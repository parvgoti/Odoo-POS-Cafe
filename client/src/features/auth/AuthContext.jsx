import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext(null);

// Default user for when Supabase auth is not available
const DEFAULT_USER = {
  id: 'd65f5739-e483-4ee1-b0db-6ddfc2a62ebd',
  email: 'admin@odoo-cafe.com',
  user_metadata: { name: 'Admin User', role: 'admin' }
};

const DEFAULT_PROFILE = {
  id: 'd65f5739-e483-4ee1-b0db-6ddfc2a62ebd',
  email: 'admin@odoo-cafe.com',
  name: 'Admin User',
  role: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    // Try to get a real session, but don't block the app if auth fails
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      // If no session, keep using DEFAULT_USER — app still works
    }).catch(() => {
      // Auth unavailable, keep defaults
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setLoggedOut(false);
          fetchProfile(session.user.id);
        } else if (!loggedOut) {
          // Fallback to default user so app remains accessible (only if not explicitly logged out)
          setUser(DEFAULT_USER);
          setProfile(DEFAULT_PROFILE);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  async function signUp({ email, password, name, role = 'staff' }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: window.location.origin,
      }
    });

    // If email auth is disabled in Supabase, fall back to default user
    if (error?.message?.includes('Email logins are disabled')) {
      console.warn('⚠️ Email logins are disabled in Supabase. Using default admin user.');
      setUser(DEFAULT_USER);
      setProfile(DEFAULT_PROFILE);
      return { user: DEFAULT_USER, session: null };
    }

    if (error) throw error;

    if (data.user) {
      try {
        await supabase.rpc('auto_confirm_user', { user_email: email });
      } catch (e) {
        console.warn('Auto-confirm RPC not available:', e.message);
      }

      try {
        await supabase.from('users').upsert({
          id: data.user.id,
          email,
          name,
          role,
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Profile insert skipped:', e.message);
      }

      if (data.session) {
        setUser(data.user);
        setProfile({ id: data.user.id, email, name, role });
        return data;
      }

      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInError && signInData.user) {
          setUser(signInData.user);
          setProfile({ id: signInData.user.id, email, name, role });
          return { ...data, session: signInData.session };
        }
      } catch (e) {
        console.warn('Auto sign-in after signup failed:', e.message);
      }
    }

    return data;
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If email auth is disabled in Supabase, fall back to default user
      if (error.message?.includes('Email logins are disabled')) {
        console.warn('⚠️ Email logins are disabled in Supabase. Using default admin user. Enable email auth at: Supabase Dashboard > Authentication > Providers > Email');
        setLoggedOut(false);
        setUser(DEFAULT_USER);
        setProfile(DEFAULT_PROFILE);
        return { user: DEFAULT_USER, session: null };
      }
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password. If you just signed up, your email may need confirmation.');
      }
      throw error;
    }

    setLoggedOut(false);
    setUser(data.user);
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    return data;
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    // Set user to null so login page renders
    setLoggedOut(true);
    setUser(null);
    setProfile(null);
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user && !loggedOut,
    isAdmin: profile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
