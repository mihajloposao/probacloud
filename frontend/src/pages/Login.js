import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Prijavljen: ${data.user.name} (${data.user.role})`);
        // Kasnije ovde ćemo čuvati JWT token
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Greška servera");
    }
  };

  return (
    <div>
      <h2>Prijava</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Lozinka:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Prijavi se</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
