"""
Direct data migration from Cloud SQL to Supabase
Migrates all tables in correct order to respect foreign key constraints
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

# Cloud SQL (source)
CLOUD_SQL_CONFIG = {
    'host': os.getenv('DB_HOST'),  # 34.39.52.34
    'port': int(os.getenv('DB_PORT', 5432)),
    'dbname': os.getenv('DB_NAME'),  # enkel_laering
    'user': os.getenv('DB_USER'),  # enkel-laering-db-user
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
    'password': 'ASSWORD'  # ⚠️ UPDATE THIS
}

# Table migration order (respects foreign keys)
MIGRATION_ORDER = [
    'teachers',
    'students',
    'quizzes',
    'about_me_texts',
    'classes',
    'job_applications',
    'new_students',
    'questions',
    'quiz_results',
    'reviews',
    'teacher_referrals',
    'teacher_student'
]

# Column mappings for schema differences (Cloud SQL → Supabase)
COLUMN_MAPPINGS = {
    'quizzes': {
        'image': 'image_url'  # Cloud SQL 'image' → Supabase 'image_url'
    },
    'questions': {
        'image': 'image_url'  # Cloud SQL 'image' → Supabase 'image_url'
    }
}

# Columns to add with default values (new columns in Supabase not in Cloud SQL)
DEFAULT_COLUMNS = {
    'about_me_texts': {
        'image_url': None  # New column in Supabase, set to NULL
    }
}

# Columns that should convert empty strings to NULL (for foreign key constraints)
NULLABLE_FOREIGN_KEYS = {
    'new_students': ['assigned_teacher_user_id'],
    'classes': ['teacher_user_id', 'student_user_id'],
    'teacher_student': ['teacher_user_id', 'student_user_id'],
    'reviews': ['teacher_user_id', 'student_user_id'],
    'teacher_referrals': ['referee_teacher_user_id'],
    'quiz_results': ['user_id'],
    'about_me_texts': ['user_id']
}


def get_connection(config):
    """Create database connection"""
    return psycopg2.connect(**config)


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
    """Migrate a single table from source to destination"""
    print(f"\n{'='*60}")
    print(f"Migrating table: {table_name}")
    print(f"{'='*60}")

    source_cursor = source_conn.cursor(cursor_factory=RealDictCursor)
    dest_cursor = dest_conn.cursor()

    skipped_rows = 0

    try:
        # Get column names from source
        source_columns = get_column_names(source_conn, table_name)
        if not source_columns:
            print(f"⚠️  Table {table_name} not found or has no columns")
            return (0, 0)

        # Fetch all data from source
        source_column_list = ', '.join(source_columns)
        source_cursor.execute(f"SELECT {source_column_list} FROM public.{table_name}")
        rows = source_cursor.fetchall()

        if not rows:
            print(f"✓ Table {table_name} is empty - skipping")
            return (0, 0)

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

        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            for row in batch:
                # Get values from source columns
                values = []
                for idx, col in enumerate(source_columns):
                    value = row[col]

                    # Convert empty strings to NULL for foreign key columns
                    dest_col = column_mapping.get(col, col)
                    if dest_col in nullable_fks:
                        # Convert empty strings, whitespace-only strings, and None to NULL
                        if value is None or (isinstance(value, str) and value.strip() == ''):
                            value = None

                    values.append(value)

                # Add default values for new columns
                default_cols = DEFAULT_COLUMNS.get(table_name, {})
                for new_col, default_value in default_cols.items():
                    if new_col not in [column_mapping.get(col, col) for col in source_columns]:
                        values.append(default_value)

                # Use savepoint to allow continuing after foreign key violation
                try:
                    dest_cursor.execute("SAVEPOINT row_insert")
                    dest_cursor.execute(insert_sql, tuple(values))
                    dest_cursor.execute("RELEASE SAVEPOINT row_insert")
                    migrated_count += 1
                except psycopg2.errors.ForeignKeyViolation as fk_error:
                    # Skip rows with orphaned foreign keys (referencing non-existent records)
                    dest_cursor.execute("ROLLBACK TO SAVEPOINT row_insert")
                    skipped_rows += 1
                    if skipped_rows <= 5:  # Only print first 5 to avoid spam
                        print(f"  ⚠️  Skipping row due to missing foreign key: {str(fk_error).split('DETAIL:')[0].strip()}")

            dest_conn.commit()
            progress_msg = f"  Migrated {min(i + batch_size, len(rows) - skipped_rows)}/{len(rows)} rows"
            if skipped_rows > 0:
                progress_msg += f" (skipped {skipped_rows} orphaned records)"
            print(progress_msg + "...")

        summary = f"✓ Successfully migrated {migrated_count} rows from {table_name}"
        if skipped_rows > 0:
            summary += f" (⚠️  {skipped_rows} orphaned records skipped)"
        print(summary)
        return (migrated_count, skipped_rows)

    except Exception as e:
        dest_conn.rollback()
        print(f"✗ Error migrating {table_name}: {e}")
        raise
    finally:
        source_cursor.close()
        dest_cursor.close()


def verify_migration(source_conn, dest_conn):
    """Verify row counts match between source and destination"""
    print(f"\n{'='*60}")
    print("VERIFICATION - Comparing row counts")
    print(f"{'='*60}")

    source_cursor = source_conn.cursor()
    dest_cursor = dest_conn.cursor()

    print(f"\n{'Table':<25} {'Cloud SQL':<15} {'Supabase':<15} {'Status':<10}")
    print("-" * 70)

    all_match = True
    for table in MIGRATION_ORDER:
        source_cursor.execute(f"SELECT COUNT(*) FROM public.{table}")
        source_count = source_cursor.fetchone()[0]

        dest_cursor.execute(f"SELECT COUNT(*) FROM public.{table}")
        dest_count = dest_cursor.fetchone()[0]

        status = "✓ OK" if source_count == dest_count else "✗ MISMATCH"
        if source_count != dest_count:
            all_match = False

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

    try:
        # Migrate each table
        total_rows = 0
        total_skipped = 0
        for table in MIGRATION_ORDER:
            rows_migrated, rows_skipped = migrate_table(table, source_conn, dest_conn)
            total_rows += rows_migrated
            total_skipped += rows_skipped

        print(f"\n{'='*60}")
        print(f"MIGRATION COMPLETE")
        print(f"{'='*60}")
        print(f"Total rows migrated: {total_rows}")
        if total_skipped > 0:
            print(f"Total orphaned records skipped: {total_skipped}")
            print("\n⚠️  Note: Skipped records reference non-existent foreign keys")
            print("   This indicates data integrity issues in the source database")

        # Verify migration
        if verify_migration(source_conn, dest_conn):
            print("\n✓ VERIFICATION PASSED - All row counts match!")
        else:
            print("\n⚠️  VERIFICATION FAILED - Some counts don't match")
            print("Check the table above for details")

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
