import { supabase } from "@/integrations/supabase/client";

/**
 * Resolve a user-entered identifier to an email.
 * If the identifier contains '@', it is treated as an email.
 * Otherwise, it is treated as a username and resolved via the username_email table.
 */
export async function resolveLoginIdentifier(identifier: string): Promise<string> {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  const { data, error } = await supabase
    .from("username_email")
    .select("email")
    .eq("username", trimmed)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data?.email) {
    throw new Error("Username not found");
  }
  return String(data.email).toLowerCase();
}

/**
 * Register a username→email mapping for login convenience.
 * Call after successful sign up.
 */
export async function registerUsernameEmail(username: string, email: string, userId: string) {
  const { error } = await supabase.from("username_email").upsert(
    { username, email, user_id: userId },
    { onConflict: "username" }
  );
  if (error) {
    throw new Error(error.message);
  }
}