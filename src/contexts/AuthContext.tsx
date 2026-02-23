import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import axios from 'axios';
import Api from '../api-endpoints/ApiUrls'
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);

      // setUser(JSON.parse(storedUser));
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // const login = async (email: string, password: string) => {
  //   try {
  //     // const response = await fetch(baseUrl?.login, {

  //     //   method: 'POST',
  //     //   headers: {
  //     //     'Content-Type': 'application/json',
  //     //   },
  //     //   body: JSON.stringify({ email, password }),
  //     // });
  //     const response: any = await axios.post('ghfhgf', { email, password })

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Login failed');
  //     }

  //     if (response) {
  //       const data = await response.json();
  //       setToken(data.token);
  //       setUser(data.user);
  //       localStorage.setItem('token', data.token);
  //       localStorage.setItem('user', JSON.stringify(data.user));
  //     }
  //   } catch (error) {
  //     // console.error('Login error:', error);
  //     // throw error;
  //     setToken("data.token");
  //     setUser("data.user");
  //     localStorage.setItem('token', "data.token");
  //     localStorage.setItem('user', "data.user");
  //   }
  // };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await axios.post(Api.login, {
        username: email,
        password,
        login_type: "PASSWORD",
        device_type: "ANDROID",
        device_id: "web",
        device_name: "Chrome",
        ip_address: "127.0.0.1"
      });
      console.log(response)
      const user = response.data?.data?.user;
      const token = response.data?.data?.tokens?.access;
      const refresh = response.data?.data?.tokens?.refresh;

      if (!token) {
        throw new Error("Token not received");
      }

      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("refresh", refresh);

      localStorage.setItem("user", JSON.stringify(user));

    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };



  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};