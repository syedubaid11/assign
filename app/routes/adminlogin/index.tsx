import axios from 'axios';
import React, { useEffect, useState } from "react";
import { createDirectus, authentication, rest } from "@directus/sdk";
import { useNavigate } from "@remix-run/react";

const client = createDirectus("http://128.140.75.83:2221")
  .with(authentication("json"))
  .with(rest());

const directus_url = 'http://128.140.75.83:2221';

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [admin, isAdmin] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await client.login(email, password);
      // saving token in localstorage
      const token = result.access_token ?? "";
      localStorage.setItem('directus_token', token);

      // getting the user info 
      const userInfo = await axios.get(`${directus_url}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log(userInfo.data.data.id);
      const userRole = userInfo.data.data.role;
      localStorage.set(userInfo.data.data.id);
      setRole(userRole);

      if (userRole) {
        const verifyAdmin = await axios.get(`${directus_url}/roles/${userRole}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log(verifyAdmin.data.data.name);
        const roleName = verifyAdmin.data.data.name;
        
        if (roleName === 'Administrator') {
          isAdmin(true);
          console.log('true');
          
          //storing admin token separately for admin operations
          localStorage.setItem('admin_token', token);
          
          navigate('/admin');
        } else {
          isAdmin(false);
          setError("Access denied. Administrator privileges required.");
        }
      } else {
        console.log('No role assigned');
        setError("No role assigned to this user.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: 10, width: "100%" }}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
}