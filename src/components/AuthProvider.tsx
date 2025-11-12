import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { computeIsAdmin } from '@/utils/admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        const u = session?.user ?? null;
        setUser(u);
        // refresh admin flag when auth state changes
        computeIsAdmin(u).then(setIsAdmin).catch(() => setIsAdmin(false));
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const u = session?.user ?? null;
      setUser(u);
      const admin = await computeIsAdmin(u);
      setIsAdmin(admin);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Gracefully handle missing provider in development to avoid hard crashes
    if (import.meta.env.DEV) {
      console.warn('useAuth was called outside of an <AuthProvider>. Returning a safe fallback.');
    }
    return {
      user: null,
      session: null,
      isAdmin: false,
      signUp: async () => ({ error: new Error('AuthProvider is not mounted') }),
      signIn: async () => ({ error: new Error('AuthProvider is not mounted') }),
      signOut: async () => {}
    } as AuthContextType;
  }
  return context;
};