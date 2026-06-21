import React from 'react';
import Navbar from './Navbar';
import RecruiterAssistantPanel from './RecruiterAssistantPanel';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const showBot = user && (user.role === 'recruiter' || user.role === 'super_admin');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1 flex flex-col pt-16 relative">
        {/* Offset for fixed navbar */}
        {children}
        {showBot && <RecruiterAssistantPanel />}
      </main>
    </div>
  );
};
export default Layout;
