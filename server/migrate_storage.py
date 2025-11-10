"""
Migrate files from Google Cloud Storage to Supabase Storage
Migrates images and resumes, then generates SQL to update database URLs
"""

from google.cloud import storage as gcs
from google.oauth2 import service_account
from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()

# Google Cloud Storage config - using service account JSON
SERVICE_ACCOUNT_FILE = 'google_service_account.json'

# Load project ID from service account JSON
try:
    with open(SERVICE_ACCOUNT_FILE, 'r') as f:
        service_account_info = json.load(f)
        GCS_PROJECT_ID = service_account_info.get('project_id')
except FileNotFoundError:
    raise FileNotFoundError(f"❌ {SERVICE_ACCOUNT_FILE} not found. Please ensure it exists in the current directory.")
except json.JSONDecodeError:
    raise ValueError(f"❌ {SERVICE_ACCOUNT_FILE} is not valid JSON.")

# Supabase config
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file")

# Bucket mappings: GCS bucket -> Supabase buckets
# Note: enkellaering_images will be split based on file paths
BUCKET_MAPPINGS = {
    'enkellaering-resumes': 'enkellaering-resumes',
    'enkellaering_images': 'multiple'  # Routed by path: quiz_* → quiz-images, teacher_images → enkellaering-images
}


def debug_print(message):
    """Print message with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] {message}")


def sanitize_filename(filename):
    """Sanitize filename for Supabase Storage (no spaces, special chars)"""
    import urllib.parse

    # Split into path parts
    parts = filename.split('/')
    sanitized_parts = []

    for part in parts:
        # Replace spaces with underscores
        part = part.replace(' ', '_')
        # Remove or replace other problematic characters
        part = part.replace('æ', 'ae').replace('ø', 'o').replace('å', 'a')
        part = part.replace('Æ', 'Ae').replace('Ø', 'O').replace('Å', 'A')
        # URL encode any remaining special characters
        sanitized_parts.append(part)

    return '/'.join(sanitized_parts)


def determine_target_bucket(source_bucket, file_path):
    """
    Determine target Supabase bucket based on GCS bucket and file path.

    Args:
        source_bucket: GCS bucket name
        file_path: File path within bucket (e.g., "quiz_images/uuid/file.png")

    Returns:
        Target Supabase bucket name
    """
    if source_bucket == 'enkellaering-resumes':
        return 'enkellaering-resumes'

    elif source_bucket == 'enkellaering_images':
        # Route based on path prefix
        if file_path.startswith('quiz_covers/') or file_path.startswith('quiz_images/'):
            return 'quiz-images'
        elif file_path.startswith('teacher_images/'):
            return 'enkellaering-images'
        else:
            # Default to enkellaering-images for unknown paths
            debug_print(f"  ⚠️  Unknown path pattern: {file_path}, defaulting to enkellaering-images")
            return 'enkellaering-images'

    else:
        raise ValueError(f"Unknown source bucket: {source_bucket}")


def migrate_bucket(gcs_client, supabase, source_bucket_name):
    """
    Migrate all files from one GCS bucket to Supabase bucket(s).

    Files are routed to different Supabase buckets based on their path:
    - enkellaering_images/quiz_covers/* → quiz-images
    - enkellaering_images/quiz_images/* → quiz-images
    - enkellaering_images/teacher_images/* → enkellaering-images
    - enkellaering-resumes/resumes/* → enkellaering-resumes

    Args:
        gcs_client: Google Cloud Storage client
        supabase: Supabase client
        source_bucket_name: GCS bucket to migrate from
    """
    print(f"\n{'='*60}")
    if source_bucket_name == 'enkellaering_images':
        print(f"Migrating: {source_bucket_name} → quiz-images + enkellaering-images (path-based routing)")
    else:
        print(f"Migrating: {source_bucket_name} → enkellaering-resumes")
    print(f"{'='*60}")

    url_mappings = []

    try:
        # Get GCS bucket
        debug_print(f"Accessing GCS bucket: {source_bucket_name}")
        source_bucket = gcs_client.bucket(source_bucket_name)

        # List all blobs
        debug_print("Fetching file list from GCS...")
        blobs = list(source_bucket.list_blobs())

        if not blobs:
            print(f"✓ Bucket {source_bucket_name} is empty - skipping")
            return url_mappings

        print(f"Found {len(blobs)} files to migrate")

        migrated_count = 0
        failed_count = 0
        skipped_count = 0

        for i, blob in enumerate(blobs, 1):
            try:
                debug_print(f"[{i}/{len(blobs)}] Processing: {blob.name}")

                # Determine target bucket based on file path
                target_bucket = determine_target_bucket(source_bucket_name, blob.name)
                debug_print(f"  Target bucket: {target_bucket}")

                # Get old GCS URL
                old_url = f"https://storage.googleapis.com/{source_bucket_name}/{blob.name}"

                # Sanitize filename for Supabase
                sanitized_name = sanitize_filename(blob.name)
                if sanitized_name != blob.name:
                    debug_print(f"  Sanitized: {blob.name} -> {sanitized_name}")

                # Check if file is too large (Supabase has 50MB limit on free tier)
                size_mb = blob.size / (1024 * 1024)
                if size_mb > 50:
                    print(f"  [{i}/{len(blobs)}] ⚠️  Skipping (too large: {size_mb:.1f}MB): {blob.name}")
                    skipped_count += 1
                    continue

                # Download file data
                debug_print(f"  Downloading {blob.name} ({blob.size} bytes, {size_mb:.2f}MB)...")
                file_data = blob.download_as_bytes()

                # Upload to Supabase
                debug_print(f"  Uploading to Supabase bucket '{target_bucket}' as '{sanitized_name}'...")

                # Upload with upsert (overwrites if exists)
                result = supabase.storage.from_(target_bucket).upload(
                    sanitized_name,
                    file_data,
                    file_options={
                        "content-type": blob.content_type or "application/octet-stream",
                        "upsert": "true"
                    }
                )

                # Get new Supabase URL (public URL)
                new_url = supabase.storage.from_(target_bucket).get_public_url(sanitized_name)

                debug_print(f"  ✓ Migrated successfully")
                print(f"  [{i}/{len(blobs)}] ✓ {blob.name} ({size_mb:.2f}MB)")

                # Store URL mapping
                url_mappings.append({
                    'original_file_name': blob.name,
                    'sanitized_file_name': sanitized_name,
                    'old_url': old_url,
                    'new_url': new_url,
                    'bucket': target_bucket,
                    'size_bytes': blob.size,
                    'content_type': blob.content_type
                })

                migrated_count += 1

            except Exception as e:
                failed_count += 1
                error_msg = str(e)
                # Check if it's a duplicate/already exists error (which is OK)
                if 'already exists' in error_msg.lower() or 'duplicate' in error_msg.lower():
                    print(f"  [{i}/{len(blobs)}] ⚠️  Already exists: {blob.name}")
                    skipped_count += 1
                    # Still track the URL mapping even if file exists
                    old_url = f"https://storage.googleapis.com/{source_bucket_name}/{blob.name}"
                    sanitized_name = sanitize_filename(blob.name)
                    # Determine target bucket (same logic as above)
                    target_bucket_fallback = determine_target_bucket(source_bucket_name, blob.name)
                    new_url = supabase.storage.from_(target_bucket_fallback).get_public_url(sanitized_name)
                    url_mappings.append({
                        'original_file_name': blob.name,
                        'sanitized_file_name': sanitized_name,
                        'old_url': old_url,
                        'new_url': new_url,
                        'bucket': target_bucket_fallback,
                        'size_bytes': blob.size,
                        'content_type': blob.content_type
                    })
                else:
                    print(f"  [{i}/{len(blobs)}] ✗ Failed: {blob.name} - {error_msg[:100]}")
                    debug_print(f"  Error details: {error_msg}")

        print(f"\n✓ Bucket migration complete:")
        print(f"  - Migrated: {migrated_count} files")
        if skipped_count > 0:
            print(f"  - Skipped: {skipped_count} files (already exist or too large)")
        if failed_count > 0:
            print(f"  - Failed: {failed_count} files")

        return url_mappings

    except Exception as e:
        print(f"✗ Error accessing bucket {source_bucket_name}: {e}")
        raise


def generate_update_sql(all_mappings, output_file='update_storage_urls.sql'):
    """Generate SQL script to update database URLs"""
    debug_print(f"Generating SQL update script: {output_file}")

    sql_statements = [
        "-- ============================================================================",
        "-- SQL Script to Update Storage URLs from GCS to Supabase",
        "-- Generated: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "-- ============================================================================",
        "-- IMPORTANT: Review this script before running in Supabase SQL Editor",
        "-- ============================================================================\n",
        "BEGIN;\n"
    ]

    # Track statistics
    stats = {
        'quizzes': 0,
        'questions': 0,
        'about_me_texts': 0,
        'job_applications': 0
    }

    # Group mappings by bucket type
    quiz_images_mappings = [m for m in all_mappings if m['bucket'] == 'quiz-images']
    profile_images_mappings = [m for m in all_mappings if m['bucket'] == 'enkellaering-images']
    resumes_mappings = [m for m in all_mappings if m['bucket'] == 'enkellaering-resumes']

    # Generate UPDATE statements for quiz images
    if quiz_images_mappings:
        sql_statements.append("-- ============================================================================")
        sql_statements.append("-- UPDATE QUIZ IMAGE URLS")
        sql_statements.append("-- (GCS enkellaering_images/quiz_* -> Supabase quiz-images)")
        sql_statements.append("-- ============================================================================\n")

        for mapping in quiz_images_mappings:
            old_url = mapping['old_url']
            new_url = mapping['new_url']

            sql_statements.append(f"-- Original: {mapping['original_file_name']}")
            if mapping['original_file_name'] != mapping['sanitized_file_name']:
                sql_statements.append(f"-- Sanitized: {mapping['sanitized_file_name']}")
            sql_statements.append(f"-- Old: {old_url}")
            sql_statements.append(f"-- New: {new_url}\n")

            # Update quizzes table
            sql_statements.append(
                f"UPDATE quizzes SET image_url = '{new_url}' "
                f"WHERE image_url = '{old_url}';"
            )
            stats['quizzes'] += 1

            # Update questions table
            sql_statements.append(
                f"UPDATE questions SET image_url = '{new_url}' "
                f"WHERE image_url = '{old_url}';"
            )
            stats['questions'] += 1

            sql_statements.append("")  # Blank line for readability

    # Generate UPDATE statements for profile images
    if profile_images_mappings:
        sql_statements.append("\n-- ============================================================================")
        sql_statements.append("-- UPDATE PROFILE IMAGE URLS")
        sql_statements.append("-- (GCS enkellaering_images/teacher_images -> Supabase enkellaering-images)")
        sql_statements.append("-- ============================================================================\n")

        for mapping in profile_images_mappings:
            old_url = mapping['old_url']
            new_url = mapping['new_url']

            sql_statements.append(f"-- Original: {mapping['original_file_name']}")
            if mapping['original_file_name'] != mapping['sanitized_file_name']:
                sql_statements.append(f"-- Sanitized: {mapping['sanitized_file_name']}")
            sql_statements.append(f"-- Old: {old_url}")
            sql_statements.append(f"-- New: {new_url}\n")

            # Update about_me_texts table (only profile images)
            sql_statements.append(
                f"UPDATE about_me_texts SET image_url = '{new_url}' "
                f"WHERE image_url = '{old_url}';"
            )
            stats['about_me_texts'] += 1

            sql_statements.append("")  # Blank line for readability

    # Generate UPDATE statements for resumes
    if resumes_mappings:
        sql_statements.append("\n-- ============================================================================")
        sql_statements.append("-- UPDATE RESUME URLS (enkellaering-resumes -> enkellaering-resumes)")
        sql_statements.append("-- ============================================================================\n")

        for mapping in resumes_mappings:
            old_url = mapping['old_url']
            new_url = mapping['new_url']

            sql_statements.append(f"-- Original: {mapping['original_file_name']}")
            if mapping['original_file_name'] != mapping['sanitized_file_name']:
                sql_statements.append(f"-- Sanitized: {mapping['sanitized_file_name']}")
            sql_statements.append(f"-- Old: {old_url}")
            sql_statements.append(f"-- New: {new_url}\n")

            # Update job_applications table (resumelink column)
            sql_statements.append(
                f"UPDATE job_applications SET resumelink = '{new_url}' "
                f"WHERE resumelink = '{old_url}';"
            )
            stats['job_applications'] += 1

            sql_statements.append("")  # Blank line for readability

    sql_statements.append("\nCOMMIT;\n")

    # Add verification queries
    sql_statements.append("-- ============================================================================")
    sql_statements.append("-- VERIFICATION QUERIES")
    sql_statements.append("-- ============================================================================")
    sql_statements.append("-- Run these to verify the migration was successful\n")

    sql_statements.append("-- Count records with new Supabase URLs:")
    sql_statements.append("SELECT 'quizzes' as table_name, COUNT(*) as supabase_urls FROM quizzes WHERE image_url LIKE '%supabase%';")
    sql_statements.append("SELECT 'questions' as table_name, COUNT(*) as supabase_urls FROM questions WHERE image_url LIKE '%supabase%';")
    sql_statements.append("SELECT 'about_me_texts' as table_name, COUNT(*) as supabase_urls FROM about_me_texts WHERE image_url LIKE '%supabase%';")
    sql_statements.append("SELECT 'job_applications' as table_name, COUNT(*) as supabase_urls FROM job_applications WHERE resumelink LIKE '%supabase%';\n")

    sql_statements.append("-- Count records still using old GCS URLs (should be 0 after migration):")
    sql_statements.append("SELECT 'quizzes' as table_name, COUNT(*) as old_gcs_urls FROM quizzes WHERE image_url LIKE '%storage.googleapis.com%';")
    sql_statements.append("SELECT 'questions' as table_name, COUNT(*) as old_gcs_urls FROM questions WHERE image_url LIKE '%storage.googleapis.com%';")
    sql_statements.append("SELECT 'about_me_texts' as table_name, COUNT(*) as old_gcs_urls FROM about_me_texts WHERE image_url LIKE '%storage.googleapis.com%';")
    sql_statements.append("SELECT 'job_applications' as table_name, COUNT(*) as old_gcs_urls FROM job_applications WHERE resumelink LIKE '%storage.googleapis.com%';")

    # Write SQL file
    with open(output_file, 'w') as f:
        f.write('\n'.join(sql_statements))

    print(f"\n✓ SQL update script generated: {output_file}")
    print(f"  - {stats['quizzes']} UPDATE statements for quizzes.image_url")
    print(f"  - {stats['questions']} UPDATE statements for questions.image_url")
    print(f"  - {stats['about_me_texts']} UPDATE statements for about_me_texts.image_url")
    print(f"  - {stats['job_applications']} UPDATE statements for job_applications.resumelink")

    return output_file


def save_url_mappings(mappings, output_file='url_mappings.json'):
    """Save URL mappings to JSON for reference"""
    with open(output_file, 'w') as f:
        json.dump(mappings, f, indent=2)
    debug_print(f"URL mappings saved to: {output_file}")
    print(f"✓ URL mappings saved: {output_file} ({len(mappings)} files)")


def main():
    """Main migration process"""
    print("="*60)
    print("GOOGLE CLOUD STORAGE → SUPABASE STORAGE MIGRATION")
    print("="*60)
    print(f"\n⚠️  This will migrate files from GCS to Supabase")
    print(f"\nBucket routing (automatic based on file paths):")
    print(f"  • enkellaering_images/quiz_covers/* → quiz-images")
    print(f"  • enkellaering_images/quiz_images/* → quiz-images")
    print(f"  • enkellaering_images/teacher_images/* → enkellaering-images")
    print(f"  • enkellaering-resumes/resumes/* → enkellaering-resumes")

    print(f"\n⚠️  Make sure you have:")
    print(f"   1. Created Supabase buckets: enkellaering-resumes, enkellaering-images, quiz-images")
    print(f"   2. Set all three buckets to PUBLIC in Supabase Dashboard")
    print(f"   3. google_service_account.json exists in current directory")
    print(f"   4. Added SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env")
    print()

    response = input("Continue? (yes/no): ")
    if response.lower() != 'yes':
        print("Migration cancelled")
        return

    # Initialize clients
    debug_print("Initializing Google Cloud Storage client...")
    debug_print(f"Using service account file: {SERVICE_ACCOUNT_FILE}")
    debug_print(f"Project ID: {GCS_PROJECT_ID}")

    # Load credentials from service account JSON
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/cloud-platform']
    )
    gcs_client = gcs.Client(project=GCS_PROJECT_ID, credentials=credentials)
    print("✓ Connected to Google Cloud Storage")

    debug_print("Initializing Supabase client...")
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("✓ Connected to Supabase")

    # Migrate each bucket
    all_url_mappings = []
    migration_start = datetime.now()

    try:
        # Migrate resumes bucket
        if 'enkellaering-resumes' in BUCKET_MAPPINGS:
            mappings = migrate_bucket(gcs_client, supabase, 'enkellaering-resumes')
            all_url_mappings.extend(mappings)

        # Migrate images bucket (automatically routes to quiz-images or enkellaering-images based on path)
        if 'enkellaering_images' in BUCKET_MAPPINGS:
            mappings = migrate_bucket(gcs_client, supabase, 'enkellaering_images')
            all_url_mappings.extend(mappings)

        total_elapsed = (datetime.now() - migration_start).total_seconds()

        print(f"\n{'='*60}")
        print(f"MIGRATION COMPLETE")
        print(f"{'='*60}")
        print(f"Total files migrated: {len(all_url_mappings)}")
        print(f"Total time: {total_elapsed:.2f}s")

        # Save mappings and generate SQL
        if all_url_mappings:
            save_url_mappings(all_url_mappings)
            sql_file = generate_update_sql(all_url_mappings)

            print(f"\n{'='*60}")
            print(f"📝 NEXT STEPS:")
            print(f"{'='*60}")
            print(f"1. Review the generated SQL file: {sql_file}")
            print(f"2. Open Supabase Dashboard → SQL Editor")
            print(f"3. Copy and paste the SQL from {sql_file}")
            print(f"4. Run the SQL to update all database URLs")
            print(f"5. Run the verification queries at the end to confirm")
        else:
            print("\n⚠️  No files were migrated (buckets may be empty)")

    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
