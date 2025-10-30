# Queries Requiring Supabase RPC Functions

This document lists all SQL queries that have been converted to Supabase RPC (PostgreSQL) functions due to their complexity.

---

## Summary

**Total RPC Functions Created: 12**

These functions handle:
- Multi-table JOINs
- Window functions (ROW_NUMBER, PARTITION BY)
- Complex NOT IN subqueries with JOINs
- Transactions with validation
- Batch operations with admin validation
- Dynamic field updates

---

## Function Catalog

### 1. `get_student_for_teacher(teacher_id TEXT)`

**Location:** `server/cloud_sql/gets.py:148-156`

**Original Query:**
```sql
SELECT DISTINCT s.* FROM public.students s
JOIN public.teacher_student ts ON s.user_id = ts.student_user_id
WHERE ts.teacher_user_id = %s
  AND ts.teacher_accepted_student = TRUE
  AND (ts.hidden IS NULL OR ts.hidden != TRUE)
```

**Why RPC:** Multi-table JOIN with complex filtering

**Python Usage:**
```python
# Before
result = execute_query(sql, (teacher_user_id,))

# After
result = supabase.rpc('get_student_for_teacher', {'teacher_id': teacher_user_id}).execute().data
```

---

### 2. `get_teacher_for_student(student_id TEXT)`

**Location:** `server/cloud_sql/gets.py:166-174`

**Original Query:**
```sql
SELECT t.* FROM public.teachers t
JOIN public.teacher_student ts ON t.user_id = ts.teacher_user_id
WHERE ts.student_user_id = %s
  AND ts.teacher_accepted_student = TRUE
  AND (ts.hidden IS NULL OR ts.hidden != TRUE)
```

**Why RPC:** Multi-table JOIN with complex filtering

**Python Usage:**
```python
result = supabase.rpc('get_teacher_for_student', {'student_id': student_user_id}).execute().data
```

---

### 3. `get_new_orders_for_teacher(teacher_id TEXT)`

**Location:** `server/cloud_sql/gets.py:106-116`

**Original Query:**
```sql
SELECT ts.*, s.*, t.*
FROM public.teacher_student ts
JOIN public.students s ON ts.student_user_id = s.user_id
JOIN public.teachers t ON ts.teacher_user_id = t.user_id
WHERE ts.teacher_user_id = %s
  AND ts.teacher_accepted_student IS NULL
  AND (ts.hidden IS NULL OR ts.hidden = FALSE)
```

**Why RPC:** 3-table JOIN returning combined results

**Python Usage:**
```python
result = supabase.rpc('get_new_orders_for_teacher', {'teacher_id': teacher_user_id}).execute().data
```

---

### 4. `get_students_with_few_classes(days INT)`

**Location:** `server/cloud_sql/gets.py:259-294`

**Original Query:**
```sql
SELECT s.*, ts.*, t.*,
       lc.started_at AS last_class_started_at,
       lc.class_id AS last_class_id
FROM public.students s
JOIN public.teacher_student ts ON s.user_id = ts.student_user_id
JOIN public.teachers t ON t.user_id = ts.teacher_user_id
LEFT JOIN (
    SELECT * FROM (
        SELECT *,
               ROW_NUMBER() OVER (
                 PARTITION BY student_user_id
                 ORDER BY started_at DESC
               ) AS rn
        FROM public.classes
    ) c
    WHERE rn = 1
) lc ON lc.student_user_id = s.user_id
WHERE s.user_id NOT IN (
    SELECT student_user_id
    FROM public.classes
    WHERE started_at::date > %s
)
  AND s.is_active = TRUE
  AND ts.row_id = (
      SELECT MIN(row_id)
      FROM public.teacher_student ts2
      WHERE ts2.student_user_id = ts.student_user_id
  )
```

**Why RPC:** Window function (ROW_NUMBER), multiple subqueries, complex JOINs

**Python Usage:**
```python
result = supabase.rpc('get_students_with_few_classes', {'days': 30}).execute().data
```

---

### 5. `get_students_without_teacher()`

**Location:** `server/cloud_sql/gets.py:314-329`

**Original Query:**
```sql
SELECT *
FROM public.students s
WHERE s.user_id NOT IN (
    SELECT student_user_id
    FROM public.teacher_student AS ts
    JOIN public.teachers AS t ON ts.teacher_user_id = t.user_id
    WHERE ts.teacher_accepted_student = TRUE
      AND (ts.hidden = FALSE OR hidden IS NULL)
      AND t.resigned = FALSE
)
AND s.is_active = TRUE
```

**Why RPC:** Complex NOT IN subquery with JOIN

**Python Usage:**
```python
result = supabase.rpc('get_students_without_teacher').execute().data
```

---

### 6. `get_all_students_without_teacher(admin_id TEXT)`

**Location:** `server/cloud_sql/gets.py:90-104`

**Original Query:**
```sql
SELECT s.* FROM public.students s
LEFT JOIN public.teacher_student ts ON s.user_id = ts.student_user_id
LEFT JOIN public.teachers t ON ts.teacher_user_id = t.user_id
WHERE t.user_id = %s AND t.admin = TRUE
  AND s.user_id NOT IN (
      SELECT student_user_id FROM public.teacher_student
      WHERE teacher_accepted_student = TRUE
        AND (hidden = FALSE OR hidden IS NULL)
  )
```

**Why RPC:** Complex LEFT JOINs with admin validation and NOT IN subquery

**Python Usage:**
```python
result = supabase.rpc('get_all_students_without_teacher', {'admin_id': admin_user_id}).execute().data
```

---

### 7. `insert_classes_batch(classes_json JSONB)`

**Location:** `server/cloud_sql/inserts.py:118-158`

**Original Logic:**
```python
# Validate teacher exists
cur.execute("SELECT user_id FROM teachers WHERE user_id = %s", (teacher_user_id,))
if not cur.fetchone():
    raise ValueError("Teacher does not exist")

# Insert each class in a loop
for cls in classes:
    execute_modify("INSERT INTO classes (...) VALUES (...)", params)
```

**Why RPC:** Transaction atomicity - need to validate teacher and insert all classes as a single transaction

**Python Usage:**
```python
classes_json = [
    {
        'class_id': str(uuid.uuid4()),
        'teacher_user_id': 'teacher_123',
        'student_user_id': 'student_456',
        # ... other fields
    },
    # ... more classes
]

result = supabase.rpc('insert_classes_batch', {'classes_json': classes_json}).execute().data
```

---

### 8. `alter_new_student(new_student_id UUID, admin_id TEXT, updates_json JSONB)`

**Location:** `server/cloud_sql/alters.py:32-78`

**Original Query:**
```sql
UPDATE public.new_students ns
SET
    has_called = %s,
    called_at = %s,
    has_answered = %s,
    -- ... 13 more fields
WHERE ns.new_student_id = %s
  AND EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.user_id = %s
  )
```

**Why RPC:** Dynamic update of 16 fields with admin validation in single atomic operation

**Python Usage:**
```python
updates = {
    'has_called': 'TRUE',
    'called_at': '2024-01-15T10:30:00Z',
    'has_answered': 'TRUE',
    # ... other fields to update
}

result = supabase.rpc('alter_new_student', {
    'new_student_id': new_student_id,
    'admin_id': admin_user_id,
    'updates_json': updates
}).execute().data
```

---

### 9. `update_new_order_dynamic(order_row_id UUID, updates_json JSONB)`

**Location:** `server/cloud_sql/alters.py:226-252`

**Original Logic:**
```python
sql = "UPDATE public.teacher_student SET "
parts = []
params = []

if teacher_accepted_student is not None:
    parts.append("teacher_accepted_student = %s")
    params.append(teacher_accepted_student)
# ... dynamic field building

sql += ", ".join(parts) + " WHERE row_id = %s"
```

**Why RPC:** Dynamic field update with optional parameters

**Python Usage:**
```python
updates = {
    'teacher_accepted_student': 'TRUE',
    'physical_or_digital': 'FALSE',
    'comments': 'Student prefers online lessons'
}

result = supabase.rpc('update_new_order_dynamic', {
    'order_row_id': row_id,
    'updates_json': updates
}).execute().data
```

---

### 10. `delete_quizzes_cascade(admin_id TEXT, quiz_ids UUID[])`

**Location:** `server/cloud_sql/deletes.py:90-111`

**Original Logic:**
```python
# Verify admin
cur.execute("SELECT admin FROM teachers WHERE user_id = %s", (admin_user_id,))
if not row or not row.get("admin"):
    return False

# Delete from multiple tables for each quiz_id
for quiz_id in quiz_ids:
    execute_modify("DELETE FROM quiz_results WHERE quiz_id = %s", (quiz_id,))
    execute_modify("DELETE FROM questions WHERE quiz_id = %s", (quiz_id,))
    execute_modify("DELETE FROM quizzes WHERE quiz_id = %s", (quiz_id,))
    delete_folder_from_bucket(storage_client, quiz_id)
```

**Why RPC:** Multi-table cascade delete with admin validation (atomic operation)

**Python Usage:**
```python
quiz_ids = ['quiz-uuid-1', 'quiz-uuid-2', 'quiz-uuid-3']

result = supabase.rpc('delete_quizzes_cascade', {
    'admin_id': admin_user_id,
    'quiz_ids': quiz_ids
}).execute().data

# Note: Storage deletion is still done in Python after RPC
for quiz_id in quiz_ids:
    delete_folder_from_bucket(quiz_id)
```

---

### 11. `set_classes_invoiced_batch(class_ids UUID[], admin_id TEXT)`

**Location:** `server/cloud_sql/alters.py:128-139`

**Original Query:**
```sql
UPDATE public.classes c
SET invoiced_student = TRUE,
    invoiced_student_at = NOW()
WHERE c.class_id = ANY(%s)
  AND EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.user_id = %s
  )
```

**Why RPC:** Batch update with admin validation in single atomic operation

**Python Usage:**
```python
class_ids = ['class-uuid-1', 'class-uuid-2', 'class-uuid-3']

result = supabase.rpc('set_classes_invoiced_batch', {
    'class_ids': class_ids,
    'admin_id': admin_user_id
}).execute().data
```

---

### 12. `set_classes_paid_batch(class_ids UUID[], admin_id TEXT)`

**Location:** `server/cloud_sql/alters.py:141-152`

**Original Query:**
```sql
UPDATE public.classes c
SET paid_teacher = TRUE,
    paid_teacher_at = NOW()
WHERE c.class_id = ANY(%s)
  AND EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.user_id = %s
  )
```

**Why RPC:** Batch update with admin validation in single atomic operation

**Python Usage:**
```python
class_ids = ['class-uuid-1', 'class-uuid-2', 'class-uuid-3']

result = supabase.rpc('set_classes_paid_batch', {
    'class_ids': class_ids,
    'admin_id': admin_user_id
}).execute().data
```

---

## Benefits of Using RPC Functions

### 1. **Performance**
- Single round-trip to database instead of multiple queries
- Server-side processing reduces network latency
- Optimized query execution plans

### 2. **Atomicity**
- All operations in an RPC function are transactional
- Either all succeed or all fail (no partial updates)
- Critical for operations like `insert_classes_batch` and `delete_quizzes_cascade`

### 3. **Security**
- Admin validation happens at database level
- Cannot be bypassed by client code
- Consistent security enforcement

### 4. **Maintainability**
- Complex SQL logic centralized in database
- Easier to debug and optimize
- Changes don't require application redeployment (just SQL update)

### 5. **Type Safety**
- PostgreSQL enforces parameter types
- JSON validation at database level
- Clearer error messages

---

## Alternative Approaches (Not Used)

For comparison, here are approaches we **didn't** use and why:

### ❌ Multiple Client Queries
```python
# This would work but is less efficient
admin = supabase.table('teachers').select('admin').eq('user_id', admin_id).execute()
if admin.data[0]['admin'] == 'TRUE':
    for class_id in class_ids:
        supabase.table('classes').update({...}).eq('class_id', class_id).execute()
```
**Problem:** Multiple round-trips, not atomic, slower

### ❌ Python-side JOINs
```python
# Fetch both tables and join in Python
students = supabase.table('students').select('*').execute()
teacher_students = supabase.table('teacher_student').select('*').execute()
# ... join logic in Python
```
**Problem:** Transfers too much data, inefficient, error-prone

### ❌ Supabase PostgREST Complex Queries
```python
# Supabase has some JOIN support but limited for complex cases
supabase.table('students').select('*, teacher_student!inner(*, teachers(*))').execute()
```
**Problem:** Can't handle window functions, complex NOT IN, or dynamic updates

---

## Testing RPC Functions

To test each RPC function in Supabase SQL Editor:

```sql
-- Test get_student_for_teacher
SELECT * FROM get_student_for_teacher('teacher-user-id-here');

-- Test get_students_with_few_classes
SELECT * FROM get_students_with_few_classes(30);

-- Test insert_classes_batch
SELECT insert_classes_batch('[
    {
        "class_id": "550e8400-e29b-41d4-a716-446655440000",
        "teacher_user_id": "teacher_123",
        "student_user_id": "student_456",
        "created_at": "2024-01-15T10:00:00Z",
        "started_at": "2024-01-15T14:00:00Z",
        "ended_at": "2024-01-15T15:00:00Z",
        "comment": "Test class",
        "paid_teacher": "FALSE",
        "invoiced_student": "FALSE",
        "was_canselled": "FALSE",
        "groupclass": "FALSE",
        "number_of_students": "1"
    }
]'::jsonb);
```

---

## Summary Table

| Function | Type | Complexity | Returns |
|---------|------|------------|---------|
| `get_student_for_teacher` | SELECT | Medium | Table |
| `get_teacher_for_student` | SELECT | Medium | Table |
| `get_new_orders_for_teacher` | SELECT | Medium | JSONB |
| `get_students_with_few_classes` | SELECT | High | JSONB |
| `get_students_without_teacher` | SELECT | Medium | Table |
| `get_all_students_without_teacher` | SELECT | High | Table |
| `insert_classes_batch` | INSERT | Medium | Boolean |
| `alter_new_student` | UPDATE | Medium | Boolean |
| `update_new_order_dynamic` | UPDATE | Low | Boolean |
| `delete_quizzes_cascade` | DELETE | Medium | Boolean |
| `set_classes_invoiced_batch` | UPDATE | Low | Boolean |
| `set_classes_paid_batch` | UPDATE | Low | Boolean |

---

**All 12 RPC functions are production-ready and have been integrated into the Python codebase.**
