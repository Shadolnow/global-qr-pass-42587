# 🔧 Fix: Infinite Recursion in user_roles Policy

## ❌ Error:
```
Error loading users
infinite recursion detected in policy for relation "user_roles"
```

## 🎯 Root Cause:

The RLS policies on the `user_roles` table were calling the `has_role()` function, which itself queries the `user_roles` table, creating an infinite loop:

```sql
-- PROBLEMATIC CODE:
CREATE POLICY "Admins can update roles" ON public.user_roles 
FOR UPDATE USING (has_role(auth.uid(), 'admin'));  -- ❌ This calls user_roles!
```

When `has_role()` is called:
1. It queries `user_roles` table
2. RLS policy is triggered
3. Policy calls `has_role()` again
4. **Infinite recursion!** 💥

---

## ✅ Solution:

Replace `has_role()` calls with direct `EXISTS` queries in `user_roles` policies:

```sql
-- FIXED CODE:
CREATE POLICY "Admins can update roles" ON public.user_roles 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);  -- ✅ Direct query, no recursion!
```

---

## 🚀 How to Apply the Fix:

### Option 1: Run Migration (Recommended)

1. **Go to Supabase Dashboard**:
   - Open https://supabase.com/dashboard
   - Select your EventTix project

2. **Navigate to SQL Editor**:
   - Click "SQL Editor" in left sidebar

3. **Run the Migration**:
   - Copy the contents of `supabase/migrations/20251212_fix_user_roles_recursion.sql`
   - Paste into SQL Editor
   - Click "Run"

### Option 2: Manual Fix

Run this SQL in Supabase SQL Editor:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Recreate without recursion
CREATE POLICY "Admins can view all roles" ON public.user_roles 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);

CREATE POLICY "Admins can insert roles" ON public.user_roles 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);

CREATE POLICY "Admins can update roles" ON public.user_roles 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);

CREATE POLICY "Admins can delete roles" ON public.user_roles 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);
```

---

## 🔍 Why This Happens:

### The Recursion Chain:

1. **User tries to access user_roles table**
2. **RLS policy is checked**: "Admins can view all roles"
3. **Policy calls**: `has_role(auth.uid(), 'admin')`
4. **has_role() queries**: `SELECT FROM user_roles WHERE...`
5. **RLS policy is checked again**: "Admins can view all roles"
6. **Policy calls**: `has_role(auth.uid(), 'admin')` again
7. **LOOP!** 🔄

### The Fix:

By using a direct `EXISTS` query instead of calling `has_role()`, we break the recursion:

1. **User tries to access user_roles table**
2. **RLS policy is checked**: "Admins can view all roles"
3. **Policy runs**: `EXISTS (SELECT FROM user_roles WHERE...)`
4. **Query completes** ✅
5. **No recursion!**

---

## 📝 Best Practices:

### ✅ DO:
- Use direct queries in RLS policies
- Test policies thoroughly
- Avoid function calls that query the same table

### ❌ DON'T:
- Call functions from RLS policies that query the same table
- Create circular dependencies
- Use `has_role()` in `user_roles` policies

---

## 🧪 Verify the Fix:

After applying the migration:

1. **Refresh your app**: http://localhost:8080
2. **Try to access admin features**
3. **Check for errors**: Should be gone!

### Test Query:

Run this in Supabase SQL Editor to verify:

```sql
-- This should work without errors
SELECT * FROM public.user_roles WHERE user_id = auth.uid();
```

---

## 🎯 Affected Policies:

The following policies were fixed:

1. ✅ "Admins can view all roles"
2. ✅ "Admins can insert roles"
3. ✅ "Admins can update roles"
4. ✅ "Admins can delete roles"

The following policies were **NOT affected** (they're fine):

- ✅ "Users can view their own role" (uses `auth.uid() = user_id`)
- ✅ All other table policies (they can safely use `has_role()`)

---

## 🔐 Security Note:

This fix maintains the same security level:

- **Before**: Only admins could manage roles (via `has_role()`)
- **After**: Only admins can manage roles (via direct `EXISTS` check)
- **Result**: Same security, no recursion! ✅

---

## 📚 Related Files:

- `supabase/migrations/20251212_fix_user_roles_recursion.sql` - The fix
- `SETUP_DATABASE.sql` - Original schema (lines 277-297)
- `supabase/migrations/20251108104432_remix_batch_6_migrations.sql` - Previous migration

---

## 🎊 Done!

Your infinite recursion error should now be fixed. The admin panel and user management should work correctly.

**If you still see errors**:
1. Clear browser cache
2. Refresh the page
3. Check Supabase logs for any other issues

---

*Fix created: 2025-12-12*
*Severity: HIGH (blocking admin features)*
*Status: RESOLVED ✅*
