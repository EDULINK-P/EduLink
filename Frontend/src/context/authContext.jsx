import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error(error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const signup = async (name, email, password) => {
    const res = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.user) setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.user) setUser(data.user);
    return data;
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
