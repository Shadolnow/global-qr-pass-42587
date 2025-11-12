import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Determine if the given user is an admin.
 * Primary: call has_role RPC ('admin').
 * Fallback: check dev env overrides (username/email).
 */
export async function computeIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  // Try RPC first
  try {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!error && data === true) return true;
  } catch (e) {
    // ignore and fallback
  }

  // Fallback: dev-only overrides
  const devEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL as string | undefined;
  const devUsername = import.meta.env.VITE_DEV_ADMIN_USERNAME as string | undefined;

  const userEmail = (user.email || "").toLowerCase();
  const userUsername = String(user.user_metadata?.username || "").toLowerCase();

  if (devEmail && userEmail === String(devEmail).toLowerCase()) return true;
  if (devUsername && userUsername === String(devUsername).toLowerCase()) return true;

  return false;
}