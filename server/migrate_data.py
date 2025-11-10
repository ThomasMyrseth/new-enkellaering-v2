"""
Direct data migration from Cloud SQL to Supabase
Migrates all tables in correct order to respect foreign key constraints
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from datetime import datetime
from urllib.parse import urlparse, unquote
import json

load_dotenv()

# Cloud SQL (source)
CLOUD_SQL_CONFIG = {
    'host': os.getenv('DB_HOST', '34.39.52.34'),  # 34.39.52.34
    'port': int(os.getenv('DB_PORT', 5432)),
    'dbname': os.getenv('DB_NAME', 'enkel_laering'),  # enkel_laering
    'user': os.getenv('DB_USER', 'enkel-laering-db-user'),  # enkel-laering-db-user
    'password': os.getenv('DB_USER_PASSWORD')
}

# Supabase (destination)
# Get from: Supabase Dashboard → Project Settings → Database → Connection String
SUPABASE_CONFIG = {
    'host': 'aws-1-eu-north-1.pooler.supabase.com',
    'port': 6543,
    'dbname': 'postgres',
    'user': 'postgres.clfgrepvidmzconiqqrt',
    # 'pool_mode': 'transaction',
    'password': os.getenv("SUPABASE_DB_PASSWORD")  # ⚠️ UPDATE THIS
}

# Supabase Storage URL (for reconstructing file URLs)
SUPABASE_PROJECT_URL = "https://clfgrepvidmzconiqqrt.supabase.co"

# Table migration order (respects foreign keys)
MIGRATION_ORDER = [
    # 'teachers',
    # 'students',
    # 'quizzes',
    'about_me_texts',
    # 'classes',
    # 'job_applications',
    # 'new_students',
    # 'questions',
    # 'quiz_results',
    # 'reviews',
    # 'teacher_referrals',
    # 'teacher_student'
]

# Column mappings for schema differences (Cloud SQL → Supabase)
COLUMN_MAPPINGS = {
    'quizzes': {
        'image': 'image_url'  # Cloud SQL 'image' → Supabase 'image_url'
    },
    'questions': {
        'image': 'image_url'  # Cloud SQL 'image' → Supabase 'image_url'
    }
    # Note: about_me_texts has no 'image' column in old schema - URL is constructed from user_id
}

# Columns to add with default values (new columns in Supabase not in Cloud SQL)
DEFAULT_COLUMNS = {
    'about_me_texts': {
        'image_url': None  # Will be constructed from user_id during migration
    }
}

# Columns to exclude from migration (exist in Cloud SQL but removed in Supabase)
COLUMNS_TO_EXCLUDE = {
    'new_students': ['assigned_teacher_user_id', 'has_assigned_teacher', 'assigned_teacher_at']
}

# Columns that should convert empty strings to NULL (for foreign key constraints)
NULLABLE_FOREIGN_KEYS = {
    # 'new_students' has no foreign keys in Supabase schema
    'classes': ['teacher_user_id', 'student_user_id'],
    'teacher_student': ['teacher_user_id', 'student_user_id'],
    'reviews': ['teacher_user_id', 'student_user_id'],
    'teacher_referrals': ['referee_teacher_user_id'],
    'quiz_results': ['user_id'],
    'about_me_texts': ['user_id']
}


def debug_print(message):
    """Print message with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] {message}")


def extract_extension_from_url(url):
    """Extract file extension from URL (e.g., '.jpg', '.png', '.pdf')"""
    if not url:
        return ''
    parsed = urlparse(url)
    path = unquote(parsed.path)  # Decode URL encoding
    # Find last dot in filename
    if '.' in path:
        return path[path.rfind('.'):]
    return ''


def extract_filename_from_url(url):
    """Extract just the filename from URL path"""
    if not url:
        return ''
    parsed = urlparse(url)
    path = unquote(parsed.path)
    # Get everything after the last /
    return path.split('/')[-1]


def sanitize_norwegian_chars(text):
    """Convert Norwegian characters to ASCII equivalents"""
    if not text:
        return text
    replacements = {
        'æ': 'ae', 'Æ': 'Ae',
        'ø': 'o', 'Ø': 'O',
        'å': 'a', 'Å': 'A'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def load_url_mappings():
    """
    Load URL mappings from migrate_storage.py output.
    Returns a list of mapping objects with old_url, new_url, etc.
    """
    mappings_file = 'url_mappings.json'
    if os.path.exists(mappings_file):
        try:
            with open(mappings_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            debug_print(f"⚠️  Could not load {mappings_file}: {e}")
            return []
    else:
        debug_print(f"⚠️  {mappings_file} not found - will use default extensions")
        return []


def find_teacher_image_url(user_id, url_mappings):
    """
    Find the Supabase URL for a teacher's profile picture from url_mappings.
    Searches for entries matching pattern: teacher_images/{user_id}/{user_id}-profile_picture.*

    Args:
        user_id: The teacher's user_id
        url_mappings: List of mapping objects with 'original_file_name' and 'new_url'

    Returns:
        The Supabase URL if found, None otherwise
    """
    if not url_mappings or not user_id:
        return None

    # Search for matching teacher image in the mappings
    pattern = f"teacher_images/{user_id}/{user_id}-profile_picture"

    for mapping in url_mappings:
        # Check both original_file_name and old_url
        original_name = mapping.get('original_file_name', '')
        old_url = mapping.get('old_url', '')

        if pattern in original_name or pattern in old_url:
            return mapping.get('new_url')

    return None


def reconstruct_supabase_url(table_name, row, old_url):
    """
    Reconstruct Supabase Storage URL from database row data and old GCS URL.

    Args:
        table_name: Name of the table being migrated
        row: Database row as dict
        old_url: Original GCS URL (used for extension/filename extraction)

    Returns:
        Reconstructed Supabase Storage URL, or None if not applicable
    """
    if not old_url or not isinstance(old_url, str):
        return old_url

    # Skip if already a Supabase URL
    if 'supabase' in old_url:
        return old_url

    # Skip if not a GCS URL
    if 'storage.googleapis.com' not in old_url:
        return old_url

    try:
        extension = extract_extension_from_url(old_url)

        if table_name == 'questions':
            # quiz-images/quiz_images/{quiz_id}/{question_id}.{ext}
            quiz_id = row.get('quiz_id')
            question_id = row.get('question_id')
            if quiz_id and question_id:
                bucket = "quiz-images"
                path = f"quiz_images/{quiz_id}/{question_id}{extension}"
                return f"{SUPABASE_PROJECT_URL}/storage/v1/object/public/{bucket}/{path}"

        elif table_name == 'quizzes':
            # quiz-images/quiz_covers/{title}.{ext}
            title = row.get('title')
            if title:
                bucket = "quiz-images"
                sanitized_title = title.replace(' ', '_')
                path = f"quiz_covers/{sanitized_title}{extension}"
                return f"{SUPABASE_PROJECT_URL}/storage/v1/object/public/{bucket}/{path}"

        elif table_name == 'about_me_texts':
            # enkellaering-images/teacher_images/{user_id}/{user_id}-profile_picture.{ext}
            user_id = row.get('user_id')
            if user_id:
                bucket = "enkellaering-images"
                path = f"teacher_images/{user_id}/{user_id}-profile_picture{extension}"
                return f"{SUPABASE_PROJECT_URL}/storage/v1/object/public/{bucket}/{path}"

        elif table_name == 'job_applications':
            # enkellaering-resumes/resumes/{firstname}_{lastname}/{filename}
            firstname = row.get('firstname')
            lastname = row.get('lastname')
            if firstname and lastname:
                bucket = "enkellaering-resumes"
                # Extract and sanitize filename from old URL
                filename = extract_filename_from_url(old_url)
                # Sanitize filename (spaces to underscores, Norwegian chars)
                filename = filename.replace(' ', '_')
                filename = sanitize_norwegian_chars(filename)
                # Sanitize folder names
                firstname_sanitized = sanitize_norwegian_chars(firstname)
                lastname_sanitized = sanitize_norwegian_chars(lastname)
                path = f"resumes/{firstname_sanitized}_{lastname_sanitized}/{filename}"
                return f"{SUPABASE_PROJECT_URL}/storage/v1/object/public/{bucket}/{path}"

    except Exception as e:
        debug_print(f"  ⚠️  Error reconstructing URL: {e}")
        return old_url

    # Return original if we couldn't reconstruct
    return old_url


def get_connection(config):
    """Create database connection"""
    debug_print(f"Attempting connection to {config.get('host')}:{config.get('port')}...")
    conn = psycopg2.connect(**config)
    debug_print("Connection established successfully")
    return conn


def get_column_names(connection, table_name):
    """Get all column names for a table"""
    # Use a regular cursor (not RealDictCursor) for this query
    cursor = connection.cursor()
    try:
        cursor.execute(f"""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = '{table_name}'
              AND table_schema = 'public'
            ORDER BY ordinal_position
        """)
        return [row[0] for row in cursor.fetchall()]
    finally:
        cursor.close()


def migrate_table(table_name, source_conn, dest_conn):
    """Migrate a single table from source to destination with URL reconstruction"""
    start_time = datetime.now()
    print(f"\n{'='*60}")
    print(f"Migrating table: {table_name}")
    print(f"{'='*60}")

    source_cursor = source_conn.cursor(cursor_factory=RealDictCursor)
    dest_cursor = dest_conn.cursor()

    skipped_rows = 0
    transformed_urls = 0  # Track number of URLs transformed

    # Load URL mappings for about_me_texts (to find correct file extensions)
    url_mappings = {}
    if table_name == 'about_me_texts':
        print("Loading URL mappings to determine teacher image extensions...")
        url_mappings = load_url_mappings()
        if url_mappings:
            print(f"  Loaded {len(url_mappings)} URL mappings")
        else:
            print("  ⚠️  No URL mappings found - will use .jpg as default extension")

    try:
        # Get column names from source
        debug_print(f"Fetching column names for {table_name}...")
        source_columns = get_column_names(source_conn, table_name)
        if not source_columns:
            print(f"⚠️  Table {table_name} not found or has no columns")
            return (0, 0)

        # Filter out excluded columns (columns that exist in source but not in destination)
        excluded_cols = COLUMNS_TO_EXCLUDE.get(table_name, [])
        if excluded_cols:
            original_count = len(source_columns)
            source_columns = [col for col in source_columns if col not in excluded_cols]
            print(f"  Excluding {original_count - len(source_columns)} columns: {', '.join(excluded_cols)}")

        debug_print(f"Found {len(source_columns)} columns: {', '.join(source_columns[:5])}{'...' if len(source_columns) > 5 else ''}")

        # Fetch all data from source
        debug_print(f"Executing SELECT query on source database...")
        source_column_list = ', '.join(source_columns)
        source_cursor.execute(f"SELECT {source_column_list} FROM public.{table_name}")
        debug_print("Fetching all rows from source...")
        rows = source_cursor.fetchall()

        if not rows:
            debug_print(f"Table {table_name} is empty - skipping")
            print(f"✓ Table {table_name} is empty - skipping")
            return (0, 0)

        debug_print(f"Successfully fetched {len(rows)} rows from source")
        print(f"Found {len(rows)} rows to migrate")

        # Map column names for destination (handle schema differences)
        dest_columns = []
        column_mapping = COLUMN_MAPPINGS.get(table_name, {})

        if column_mapping:
            print(f"  Using column mappings: {column_mapping}")

        for col in source_columns:
            # Use mapped column name if exists, otherwise keep original
            dest_col = column_mapping.get(col, col)
            dest_columns.append(dest_col)

        # Add any new columns with default values
        default_cols = DEFAULT_COLUMNS.get(table_name, {})
        for new_col, default_value in default_cols.items():
            if new_col not in dest_columns:
                dest_columns.append(new_col)
                print(f"  Adding new column '{new_col}' with default: {default_value}")

        # Prepare insert statement with destination column names
        dest_column_list = ', '.join(dest_columns)
        placeholders = ', '.join(['%s'] * len(dest_columns))
        insert_sql = f"""
            INSERT INTO public.{table_name} ({dest_column_list})
            VALUES ({placeholders})
            ON CONFLICT DO NOTHING
        """

        # Insert data in batches
        batch_size = 1000
        migrated_count = 0
        nullable_fks = NULLABLE_FOREIGN_KEYS.get(table_name, [])

        if nullable_fks:
            print(f"  Cleaning empty strings to NULL for: {', '.join(nullable_fks)}")

        debug_print(f"Starting batch insertion (batch size: {batch_size})...")
        total_batches = (len(rows) + batch_size - 1) // batch_size

        for batch_num, i in enumerate(range(0, len(rows), batch_size), 1):
            batch_start_time = datetime.now()
            debug_print(f"Processing batch {batch_num}/{total_batches} (rows {i+1} to {min(i+batch_size, len(rows))})...")

            batch = rows[i:i + batch_size]
            batch_migrated = 0
            batch_skipped = 0

            for row_num, row in enumerate(batch, start=i+1):
                # Show progress every 100 rows
                if row_num % 100 == 0:
                    debug_print(f"  Processing row {row_num}/{len(rows)} ({(row_num/len(rows)*100):.1f}%)")

                # Get values from source columns
                values = []
                for idx, col in enumerate(source_columns):
                    value = row[col]

                    # Get destination column name (accounting for mappings)
                    dest_col = column_mapping.get(col, col)

                    # Convert empty strings to NULL for foreign key columns
                    if dest_col in nullable_fks:
                        # Convert empty strings, whitespace-only strings, and None to NULL
                        if value is None or (isinstance(value, str) and value.strip() == ''):
                            value = None

                    # Reconstruct Supabase URLs for image_url and resumelink columns
                    if dest_col in ['image_url', 'resumelink']:
                        original_value = value
                        value = reconstruct_supabase_url(table_name, row, value)
                        if value != original_value and value is not None and original_value is not None:
                            transformed_urls += 1

                    values.append(value)

                # Add default values for new columns
                default_cols = DEFAULT_COLUMNS.get(table_name, {})
                for new_col, default_value in default_cols.items():
                    if new_col not in [column_mapping.get(col, col) for col in source_columns]:
                        # Special case: construct image_url for about_me_texts from user_id
                        if table_name == 'about_me_texts' and new_col == 'image_url':
                            user_id = row.get('user_id')
                            if user_id:
                                # Try to find the actual URL from storage migration mappings
                                constructed_url = find_teacher_image_url(user_id, url_mappings)

                                if constructed_url:
                                    # Found exact URL from mappings with correct extension
                                    debug_print(f"  Found image_url from mappings for user {user_id}")
                                else:
                                    # Fallback: construct with .jpg extension
                                    # Note: Extension could be .jpg, .jpeg, or .png
                                    # If url_mappings.json doesn't exist, we default to .jpg
                                    bucket = "enkellaering-images"
                                    extension = '.jpg'  # Default assumption
                                    path = f"teacher_images/{user_id}/{user_id}-profile_picture{extension}"
                                    constructed_url = f"{SUPABASE_PROJECT_URL}/storage/v1/object/public/{bucket}/{path}"
                                    debug_print(f"  Constructed default image_url for user {user_id} (using .jpg)")

                                values.append(constructed_url)
                                transformed_urls += 1
                            else:
                                values.append(None)
                        else:
                            values.append(default_value)

                # Use savepoint to allow continuing after foreign key violation
                try:
                    dest_cursor.execute("SAVEPOINT row_insert")
                    dest_cursor.execute(insert_sql, tuple(values))
                    dest_cursor.execute("RELEASE SAVEPOINT row_insert")
                    migrated_count += 1
                    batch_migrated += 1
                except psycopg2.errors.ForeignKeyViolation as fk_error:
                    # Skip rows with orphaned foreign keys (referencing non-existent records)
                    dest_cursor.execute("ROLLBACK TO SAVEPOINT row_insert")
                    skipped_rows += 1
                    batch_skipped += 1
                    if skipped_rows <= 5:  # Only print first 5 to avoid spam
                        debug_print(f"  ⚠️  Row {row_num}: Skipping due to missing foreign key")
                        print(f"  ⚠️  Skipping row due to missing foreign key: {str(fk_error).split('DETAIL:')[0].strip()}")

            debug_print(f"Committing batch {batch_num}...")
            dest_conn.commit()

            batch_elapsed = (datetime.now() - batch_start_time).total_seconds()
            rows_per_sec = len(batch) / batch_elapsed if batch_elapsed > 0 else 0
            debug_print(f"Batch {batch_num} committed in {batch_elapsed:.2f}s ({rows_per_sec:.1f} rows/sec)")

            progress_msg = f"  Migrated {migrated_count}/{len(rows)} rows ({(migrated_count/len(rows)*100):.1f}%)"
            if skipped_rows > 0:
                progress_msg += f" (skipped {skipped_rows} orphaned records)"
            print(progress_msg)

        elapsed_time = (datetime.now() - start_time).total_seconds()
        summary = f"✓ Successfully migrated {migrated_count} rows from {table_name} in {elapsed_time:.2f}s"
        if transformed_urls > 0:
            summary += f" ({transformed_urls} URLs transformed)"
        if skipped_rows > 0:
            summary += f" (⚠️  {skipped_rows} orphaned records skipped)"
        print(summary)
        debug_print(f"Table {table_name} migration completed")
        return (migrated_count, skipped_rows)

    except Exception as e:
        dest_conn.rollback()
        print(f"✗ Error migrating {table_name}: {e}")
        raise
    finally:
        source_cursor.close()
        dest_cursor.close()


def verify_url_migration(dest_conn):
    """Verify that all URLs have been migrated to Supabase Storage"""
    print(f"\n{'='*60}")
    print("URL MIGRATION VERIFICATION")
    print(f"{'='*60}")

    dest_cursor = dest_conn.cursor()

    # Tables and columns to check
    url_checks = [
        ('quizzes', 'image_url'),
        ('questions', 'image_url'),
        ('about_me_texts', 'image_url'),
        ('job_applications', 'resumelink')
    ]

    all_migrated = True
    total_old_urls = 0

    for table, column in url_checks:
        try:
            # Count GCS URLs (old)
            dest_cursor.execute(f"""
                SELECT COUNT(*) FROM {table}
                WHERE {column} LIKE '%storage.googleapis.com%'
            """)
            gcs_count = dest_cursor.fetchone()[0]

            # Count Supabase URLs (new)
            dest_cursor.execute(f"""
                SELECT COUNT(*) FROM {table}
                WHERE {column} LIKE '%supabase%'
            """)
            supabase_count = dest_cursor.fetchone()[0]

            # Count NULL or empty
            dest_cursor.execute(f"""
                SELECT COUNT(*) FROM {table}
                WHERE {column} IS NULL OR {column} = ''
            """)
            null_count = dest_cursor.fetchone()[0]

            status = "✓ OK" if gcs_count == 0 else "⚠️  GCS URLs REMAINING"
            if gcs_count > 0:
                all_migrated = False
                total_old_urls += gcs_count

            print(f"{table}.{column}:")
            print(f"  - Supabase URLs: {supabase_count}")
            print(f"  - GCS URLs (old): {gcs_count} {status}")
            print(f"  - NULL/empty: {null_count}")

        except Exception as e:
            print(f"  ⚠️  Error checking {table}.{column}: {e}")

    dest_cursor.close()

    print(f"\n{'='*60}")
    if all_migrated:
        print("✓ URL MIGRATION VERIFIED - All URLs migrated to Supabase!")
    else:
        print(f"⚠️  WARNING: {total_old_urls} old GCS URLs still in database")
        print("⚠️  You may need to run the generated SQL update script")
    print(f"{'='*60}")

    return all_migrated


def verify_migration(source_conn, dest_conn):
    """Verify row counts match between source and destination"""
    print(f"\n{'='*60}")
    print("ROW COUNT VERIFICATION")
    print(f"{'='*60}")

    source_cursor = source_conn.cursor()
    dest_cursor = dest_conn.cursor()

    print(f"\n{'Table':<25} {'Cloud SQL':<15} {'Supabase':<15} {'Status':<10}")
    print("-" * 70)

    all_match = True
    for table in MIGRATION_ORDER:
        debug_print(f"Verifying table: {table}...")
        source_cursor.execute(f"SELECT COUNT(*) FROM public.{table}")
        source_count = source_cursor.fetchone()[0]

        dest_cursor.execute(f"SELECT COUNT(*) FROM public.{table}")
        dest_count = dest_cursor.fetchone()[0]

        status = "✓ OK" if source_count == dest_count else "✗ MISMATCH"
        if source_count != dest_count:
            all_match = False
            debug_print(f"  MISMATCH: {table} - Source: {source_count}, Dest: {dest_count}")

        print(f"{table:<25} {source_count:<15} {dest_count:<15} {status:<10}")

    source_cursor.close()
    dest_cursor.close()

    return all_match


def main():
    """Main migration process"""
    print("="*60)
    print("CLOUD SQL → SUPABASE DATA MIGRATION")
    print("="*60)
    print("\n⚠️  WARNING: This will migrate all data from Cloud SQL to Supabase")
    print("⚠️  Make sure you have:")
    print("   1. Updated SUPABASE_CONFIG password in this script")
    print("   2. Run schema.sql in Supabase first")
    print("   3. Backed up any existing Supabase data")
    print("   4. Run migrate_storage.py first to upload files (recommended)")
    print("\n⚠️  NOTE: URLs will be automatically reconstructed from row IDs")
    print("   No url_mappings.json file needed!")
    print("\n")

    response = input("Continue? (yes/no): ")
    if response.lower() != 'yes':
        print("Migration cancelled")
        return

    # Connect to both databases
    print("\nConnecting to Cloud SQL...")
    source_conn = get_connection(CLOUD_SQL_CONFIG)
    print("✓ Connected to Cloud SQL")

    print("\nConnecting to Supabase...")
    dest_conn = get_connection(SUPABASE_CONFIG)
    print("✓ Connected to Supabase")

    print(f"\n✓ Using URL reconstruction (Supabase project: {SUPABASE_PROJECT_URL})")

    try:
        # Migrate each table
        total_rows = 0
        total_skipped = 0
        migration_start_time = datetime.now()

        debug_print(f"Starting migration of {len(MIGRATION_ORDER)} tables...")
        for table_num, table in enumerate(MIGRATION_ORDER, 1):
            debug_print(f"\n{'*'*60}")
            debug_print(f"TABLE {table_num}/{len(MIGRATION_ORDER)}: {table}")
            debug_print(f"{'*'*60}")

            rows_migrated, rows_skipped = migrate_table(table, source_conn, dest_conn)
            total_rows += rows_migrated
            total_skipped += rows_skipped

            elapsed = (datetime.now() - migration_start_time).total_seconds()
            debug_print(f"Overall progress: {table_num}/{len(MIGRATION_ORDER)} tables completed, {total_rows} total rows migrated, {elapsed:.1f}s elapsed")

        total_elapsed = (datetime.now() - migration_start_time).total_seconds()
        print(f"\n{'='*60}")
        print(f"MIGRATION COMPLETE")
        print(f"{'='*60}")
        print(f"Total rows migrated: {total_rows}")
        print(f"Total time elapsed: {total_elapsed:.2f}s ({total_elapsed/60:.1f} minutes)")
        if total_rows > 0:
            print(f"Average speed: {total_rows/total_elapsed:.1f} rows/second")
        if total_skipped > 0:
            print(f"Total orphaned records skipped: {total_skipped}")
            print("\n⚠️  Note: Skipped records reference non-existent foreign keys")
            print("   This indicates data integrity issues in the source database")

        # Verify migration
        debug_print("\nStarting verification phase...")
        if verify_migration(source_conn, dest_conn):
            print("\n✓ ROW COUNT VERIFICATION PASSED - All row counts match!")
            debug_print("Row count verification completed successfully")
        else:
            print("\n⚠️  ROW COUNT VERIFICATION FAILED - Some counts don't match")
            print("Check the table above for details")
            debug_print("Row count verification found mismatches")

        # Verify URL migration
        debug_print("\nStarting URL migration verification...")
        verify_url_migration(dest_conn)

    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        print("Rolling back...")
        dest_conn.rollback()
        raise
    finally:
        source_conn.close()
        dest_conn.close()
        print("\nDatabase connections closed")


if __name__ == "__main__":
    main()
