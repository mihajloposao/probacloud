import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterForm({ role }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // hook za navigaciju

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);        // Prikazuje poruku uspeha
        navigate("/login");              // Preusmerava na login stranicu
      } else {
        setMessage(data.error);          // Prikazuje grešku ako postoji
      }
    } catch (err) {
      console.error(err);
      setMessage("Greška servera");
    }
  };

  return (
    <div>
      <h2>Registracija {role === "seller" ? "prodavca" : "kupca"}</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Ime:</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Lozinka:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Registruj se</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RegisterForm;
