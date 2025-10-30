"""
Check why quiz_id dfdf9100-4f8d-49fb-95bd-47f3d8ea1a47 is missing
"""
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

# Cloud SQL (source)
CLOUD_SQL_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_USER_PASSWORD')
}

# Supabase (destination)
SUPABASE_CONFIG = {
    'host': 'aws-1-eu-north-1.pooler.supabase.com',
    'port': 6543,
    'dbname': 'postgres',
    'user': 'postgres.clfgrepvidmzconiqqrt',
    'password': 'Coll_in@1732'
}

missing_quiz_id = 'dfdf9100-4f8d-49fb-95bd-47f3d8ea1a47'

print(f"Investigating missing quiz_id: {missing_quiz_id}\n")

# Connect to Cloud SQL
print("=" * 60)
print("CHECKING CLOUD SQL (Source)")
print("=" * 60)
cloud_conn = psycopg2.connect(**CLOUD_SQL_CONFIG)
cloud_cursor = cloud_conn.cursor(cursor_factory=RealDictCursor)

# Check if quiz exists in Cloud SQL
cloud_cursor.execute("SELECT * FROM public.quizzes WHERE quiz_id = %s", (missing_quiz_id,))
quiz = cloud_cursor.fetchone()

if quiz:
    print("✓ Quiz EXISTS in Cloud SQL:")
    print(f"  Title: {quiz['title']}")
    print(f"  Created: {quiz['created_at']}")
    print(f"  Questions: {quiz['number_of_questions']}")
else:
    print("✗ Quiz DOES NOT EXIST in Cloud SQL (orphaned questions!)")

# Check questions referencing this quiz in Cloud SQL
cloud_cursor.execute("""
    SELECT question_id, LEFT(question, 50) as question_preview
    FROM public.questions
    WHERE quiz_id = %s
""", (missing_quiz_id,))
questions = cloud_cursor.fetchall()
print(f"\n  Questions referencing this quiz in Cloud SQL: {len(questions)}")
for q in questions[:3]:
    print(f"    - {q['question_preview']}...")

cloud_cursor.close()
cloud_conn.close()

# Connect to Supabase
print("\n" + "=" * 60)
print("CHECKING SUPABASE (Destination)")
print("=" * 60)
supa_conn = psycopg2.connect(**SUPABASE_CONFIG)
supa_cursor = supa_conn.cursor(cursor_factory=RealDictCursor)

# Check if quiz exists in Supabase
supa_cursor.execute("SELECT * FROM public.quizzes WHERE quiz_id = %s", (missing_quiz_id,))
quiz_dest = supa_cursor.fetchone()

if quiz_dest:
    print("✓ Quiz EXISTS in Supabase")
else:
    print("✗ Quiz DOES NOT EXIST in Supabase")

# Check total quiz counts
cloud_cursor = psycopg2.connect(**CLOUD_SQL_CONFIG).cursor()
cloud_cursor.execute("SELECT COUNT(*) FROM public.quizzes")
cloud_quiz_count = cloud_cursor.fetchone()[0]

supa_cursor.execute("SELECT COUNT(*) FROM public.quizzes")
supa_quiz_count = supa_cursor.fetchone()[0]

print(f"\nQuiz counts:")
print(f"  Cloud SQL: {cloud_quiz_count}")
print(f"  Supabase:  {supa_quiz_count}")

if cloud_quiz_count != supa_quiz_count:
    print("\n⚠️  Quiz counts don't match!")
    print("   Some quizzes failed to migrate (likely due to ON CONFLICT DO NOTHING)")

    # Find which quizzes are missing
    cloud_cursor.execute("SELECT quiz_id, title FROM public.quizzes")
    cloud_quizzes = set(row[0] for row in cloud_cursor.fetchall())

    supa_cursor.execute("SELECT quiz_id FROM public.quizzes")
    supa_quizzes = set(row[0] for row in supa_cursor.fetchall())

    missing = cloud_quizzes - supa_quizzes
    print(f"\n   Missing quiz IDs in Supabase: {len(missing)}")
    if missing_quiz_id in missing:
        print(f"   ✓ {missing_quiz_id} is in the missing list")

supa_cursor.close()
supa_conn.close()
cloud_cursor.close()

print("\n" + "=" * 60)
print("RECOMMENDATION")
print("=" * 60)
print("The quiz exists in Cloud SQL but wasn't migrated to Supabase.")
print("This is likely because:")
print("1. It already existed in Supabase (ON CONFLICT DO NOTHING)")
print("2. Or there was a constraint violation")
print("\nSolution: Clear Supabase tables and re-run migration")
