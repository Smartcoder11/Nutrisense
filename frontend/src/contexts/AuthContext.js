import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userId = localStorage.getItem("userId");
      setUser({ token, userId });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "/api/auth/login",
        {
          email,
          password,
        }
      );
      const { token, userId, hasProfile } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setUser({ token, userId });
      return { success: true, hasProfile };
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await axios.post(
        "/api/auth/signup",
        {
          username,
          email,
          password,
        }
      );
      const { token, userId } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setUser({ token, userId });
      return { success: true, needsProfile: true };
    } catch (error) {
      throw error.response?.data?.message || "Signup failed";
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
