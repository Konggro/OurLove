import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'user1' | 'user2';

interface AuthContextType {
  currentUser: UserRole | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  userName: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple authentication - credentials loaded from environment variables for security
// Never commit .env file to Git!
const getEnv = (key: string, defaultValue: string): string => {
  return (import.meta.env as any)[key] || defaultValue;
};

const USERS = {
  user1: {
    username: getEnv('VITE_USER1_USERNAME', 'me'),
    password: getEnv('VITE_USER1_PASSWORD', 'love123'),
    name: getEnv('VITE_USER1_NAME', 'Me'),
  },
  user2: {
    username: getEnv('VITE_USER2_USERNAME', 'boyfriend'),
    password: getEnv('VITE_USER2_PASSWORD', 'love123'),
    name: getEnv('VITE_USER2_NAME', 'Boyfriend'),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser') as UserRole | null;
    const savedUserName = localStorage.getItem('userName');
    if (savedUser && savedUserName) {
      setCurrentUser(savedUser);
      setUserName(savedUserName);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Check credentials
    const user = Object.entries(USERS).find(
      ([_, creds]) => creds.username === username && creds.password === password
    );

    if (user) {
      const [role, creds] = user;
      setCurrentUser(role as UserRole);
      setUserName(creds.name);
      localStorage.setItem('currentUser', role);
      localStorage.setItem('userName', creds.name);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setUserName(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userName');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, userName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

