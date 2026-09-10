import { supabase } from "../lib/supabase";

export function signUpStudent({
  fullName,
  roll,
  email,
  password,
}) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        roll,
      },
    },
  });
}

export function signInStudent({ email, password }) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signInAdmin({ email, password }) {
  const loginResult =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (loginResult.error) {
    return loginResult;
  }

  const user = loginResult.data.user;

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError) {
    await supabase.auth.signOut();

    return {
      data: null,
      error: profileError,
    };
  }

  if (profile.role !== "admin") {
    await supabase.auth.signOut();

    return {
      data: null,
      error: new Error(
        "This account does not have administrator access."
      ),
    };
  }

  return loginResult;
}

export function logout() {
  return supabase.auth.signOut();
}