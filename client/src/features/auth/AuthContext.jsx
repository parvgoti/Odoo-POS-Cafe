import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // null = not logged in
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);  // true while checking session
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    // Check for an existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setLoggedOut(false);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
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
      if (data) setProfile(data);
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
      },
    });

    if (error) throw error;

    // Pre-insert profile row (will be confirmed after OTP)
    if (data.user) {
      try {
        await supabase.from('users').upsert({
          id: data.user.id,
          email,
          name,
          role,
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Profile pre-insert skipped:', e.message);
      }
    }

    // data.session is non-null ONLY if email confirmation is disabled in Supabase.
    // If it's null, OTP was sent and SignupPage will show the OTP step.
    return data;
  }

  async function verifyOtp({ email, token, name, role = 'staff' }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) throw error;

    if (data.user) {
      setUser(data.user);
      setLoggedOut(false);

      try {
        await supabase.from('users').upsert({
          id: data.user.id,
          email,
          name,
          role,
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Profile upsert after OTP skipped:', e.message);
      }

      setProfile({ id: data.user.id, email, name, role });
    }

    return data;
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      throw error;
    }

    setLoggedOut(false);
    setUser(data.user);
    if (data.user) await fetchProfile(data.user.id);
    return data;
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setLoggedOut(true);
    setUser(null);
    setProfile(null);
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    verifyOtp,
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
