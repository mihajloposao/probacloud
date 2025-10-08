import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
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

  // Čuvamo token u localStorage
  localStorage.setItem("token", data.token); // ovo ćemo dobiti iz backend-a

  // Preusmeravamo korisnika na productlist ako je seller
  if (data.user.role === "seller") {
    navigate("/productlist");
    window.location.reload();
  } else {
    navigate("/"); // za customer-a može neka druga ruta
    window.location.reload();
  }
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
