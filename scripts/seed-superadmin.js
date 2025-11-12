// Seed a Super Admin user using Supabase Service Role Key
// Requirements:
// - Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set
// - Email: shamsud.ahmed@gmail.com
// - Username: shamsud
// - Initial password is prompted or passed via SUPERADMIN_PASSWORD; rotate after first login.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "shamsud.ahmed@gmail.com";
const SUPERADMIN_USERNAME = process.env.SUPERADMIN_USERNAME || "shamsud";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "Golaghat@890"; // rotate after login

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function ensureSuperAdmin() {
  console.log("Seeding Super Admin...");
  const existing = await supabase.auth.admin.getUserByEmail(SUPERADMIN_EMAIL);
  if (existing.error) {
    console.error("Error checking user:", existing.error.message);
    process.exit(1);
  }

  let userId = existing.data?.user?.id;
  if (!userId) {
    console.log("User not found. Creating...");
    const createRes = await supabase.auth.admin.createUser({
      email: SUPERADMIN_EMAIL,
      email_confirm: true,
      password: SUPERADMIN_PASSWORD,
      user_metadata: {
        account_type: "company",
        company_name: "SuperAdmin",
        plan_type: "paid",
        username: SUPERADMIN_USERNAME,
      },
    });
    if (createRes.error) {
      console.error("Error creating user:", createRes.error.message);
      process.exit(1);
    }
    userId = createRes.data.user?.id;
    console.log("Created Super Admin:", userId);
  } else {
    console.log("Super Admin already exists:", userId);
  }

  if (!userId) {
    console.error("Could not determine Super Admin user id.");
    process.exit(1);
  }

  // Assign admin role
  const roleRes = await supabase.from("user_roles").select("id").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (roleRes.error) {
    console.error("Error checking admin role:", roleRes.error.message);
    process.exit(1);
  }
  if (!roleRes.data) {
    const insertRole = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (insertRole.error) {
      console.error("Error assigning admin role:", insertRole.error.message);
      process.exit(1);
    }
    console.log("Admin role assigned.");
  } else {
    console.log("Admin role already present.");
  }

  // Upsert username mapping
  const upsertMap = await supabase.from("username_email").upsert(
    { user_id: userId, username: SUPERADMIN_USERNAME, email: SUPERADMIN_EMAIL },
    { onConflict: "username" }
  );
  if (upsertMap.error) {
    console.error("Error upserting username mapping:", upsertMap.error.message);
    process.exit(1);
  }
  console.log("Username mapping ensured.");

  console.log("Seed complete. IMPORTANT: Rotate the Super Admin password immediately after first login.");
}

ensureSuperAdmin();