import React, { useState, useEffect } from 'react';
import { StudentLogin } from './components/StudentLogin';
import { StudentSignup } from './components/StudentSignup';
import { StudentDashboard } from './components/StudentDashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';

export function StudentApp({ onBackToLanding }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && session.access_token) {
        // Fetch student data from backend
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2fad19e1/student/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentStudent(data.student);
          setAccessToken(session.access_token);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      console.log('Student attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Student login error:', error);
        // Provide more helpful error message
        if (error.message === 'Invalid login credentials') {
          toast.error('Invalid email or password. Please check your credentials or sign up for a new account.');
        } else {
          toast.error(error.message);
        }
        throw error;
      }

      console.log('Student login successful, fetching profile...');

      if (data.session) {
        // Fetch student data from backend
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2fad19e1/student/profile`, {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentStudent(userData.student);
          setAccessToken(data.session.access_token);
          setIsAuthenticated(true);
          toast.success(`Welcome back, ${userData.student.name}!`);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to fetch student data');
          // If access denied (wrong portal), sign them out
          if (response.status === 403) {
            await supabase.auth.signOut();
          }
          throw new Error(errorData.error);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSignup = async (formData) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2fad19e1/student/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Signup failed');
        throw new Error(data.error);
      }

      toast.success('Account created successfully! Please sign in.');
      setShowSignup(false);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentStudent(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      
      // Go back to landing page after logout
      if (onBackToLanding) {
        setTimeout(() => {
          onBackToLanding();
        }, 500);
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const handleSwitchToAdmin = () => {
    // Go back to landing page
    if (onBackToLanding) {
      onBackToLanding();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showSignup) {
      return (
        <>
          <StudentSignup 
            onSignup={handleSignup}
            onSwitchToLogin={() => setShowSignup(false)}
          />
          <Toaster />
        </>
      );
    }
    return (
      <>
        <StudentLogin 
          onLogin={handleLogin}
          onSwitchToSignup={() => setShowSignup(true)}
          onSwitchToAdmin={handleSwitchToAdmin}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <StudentDashboard 
        student={currentStudent} 
        onLogout={handleLogout}
        accessToken={accessToken}
        projectId={projectId}
      />
      <Toaster />
    </>
  );
}