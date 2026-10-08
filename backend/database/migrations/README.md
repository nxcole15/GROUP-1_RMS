# Database Migrations

This folder contains SQL migration scripts to keep your local database in sync with production.

## 🚀 Quick Start

### For Local Development (Your Computer):

1. **Open MySQL client** (MySQL Workbench, phpMyAdmin, or command line)
2. **Select your database:**
   ```sql
   USE your_database_name;  -- e.g., USE railway; or USE smart_student_service;
   ```
3. **Run the migration file:**
   - Copy the entire contents of `001-add-new-scheduling-system-simple.sql`
   - Paste and execute in MySQL
4. **Ignore these errors** (they're normal if you already have some tables/columns):
   - ❌ `Duplicate column name 'xxx'` - Column already exists, skip it
   - ❌ `Can't DROP 'xxx'; check that column/key exists` - Already dropped, skip it

### For Railway Production:

1. **Go to Railway Dashboard** → Your MySQL database
2. **Click "Data" tab** → **Click "Query"**
3. **Copy and paste** `001-add-new-scheduling-system-simple.sql`
4. **Click "Run Query"**
5. **Ignore duplicate column errors**

---

## 📁 Migration Files

### `001-add-new-scheduling-system.sql` (Advanced)
- Uses conditional logic to check if columns exist before adding
- Works with MySQL 8.0+
- Cleaner output, no errors

### `001-add-new-scheduling-system-simple.sql` (Recommended)
- Simple ALTER statements
- Works with all MySQL versions (5.7+)
- May show "Duplicate column" errors (ignore them)
- **USE THIS ONE if you're unsure**

---

## 🆕 When to Run Migrations

Run migrations when you see these errors:

- ❌ `Table 'xxx.teacher_schedules' doesn't exist`
- ❌ `Table 'xxx.grade_submission_config' doesn't exist`
- ❌ `Unknown column 'g.submission_status' in 'field list'`
- ❌ `Field 'subject_id' doesn't have a default value`

---

## ✅ How to Verify Migration Worked

After running the migration, check if new tables exist:

```sql
-- Check new tables
SHOW TABLES LIKE '%schedule%';
SHOW TABLES LIKE '%grade_submission%';
SHOW TABLES LIKE '%grade_audit%';

-- Check if grades table has new columns
DESCRIBE grades;

-- Should see these new columns:
-- - subject_name
-- - strand
-- - teacher_schedule_id
-- - submission_status
-- - submitted_at
-- - approved_at
-- - approved_by
-- - return_reason
-- - updated_at
```

---

## 🔄 Sync Workflow (For Team)

When someone adds new database changes:

1. **Developer A** makes database changes in their local environment
2. **Developer A** creates a new migration file (e.g., `002-add-xxx-feature.sql`)
3. **Developer A** commits and pushes the migration file to Git
4. **Developer B** pulls the latest code
5. **Developer B** runs the new migration file on their local database
6. **Everyone** runs the same migration on Railway production

This keeps everyone's database in sync! 🎯

---

## 📝 Creating New Migrations

When you add new tables/columns:

1. **Create a new file:** `002-your-feature-name.sql`
2. **Use this template:**
   ```sql
   -- Migration: Description of what this adds
   -- Date: YYYY-MM-DD
   -- Description: Detailed explanation

   -- Create new tables
   CREATE TABLE IF NOT EXISTS your_table (...);

   -- Modify existing tables
   ALTER TABLE existing_table ADD COLUMN new_column VARCHAR(50) NULL;

   -- Insert default data
   INSERT IGNORE INTO config_table VALUES (...);
   ```
3. **Test locally first!**
4. **Commit to Git**
5. **Tell team to run it**
6. **Run on Railway**

---

## 🚨 Troubleshooting

### "Commands out of sync; you can't run this command now"
- **Solution:** Run migration in smaller chunks, restart MySQL client

### "Syntax error at line X"
- **Solution:** Make sure you're using MySQL, not PostgreSQL or SQLite
- Check for trailing characters or encoding issues

### "Access denied"
- **Solution:** Your MySQL user needs ALTER, CREATE, DROP permissions

### "Database not selected"
- **Solution:** Run `USE your_database_name;` first

---

## 💡 Pro Tips

- ✅ Always backup your database before running migrations
- ✅ Run migrations on local first, then production
- ✅ Use `IF NOT EXISTS` for CREATE TABLE statements
- ✅ Use `IGNORE` for INSERT statements (e.g., `INSERT IGNORE`)
- ✅ Document what each migration does in comments
- ⚠️ Never delete old migration files - they're history!

---

## 📞 Need Help?

If migrations fail or you're stuck:
1. Check the error message carefully
2. Verify you're connected to the right database
3. Try the `-simple.sql` version if the advanced one fails
4. Share the error message with the team

Happy migrating! 🚀
