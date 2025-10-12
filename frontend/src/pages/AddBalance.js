import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddBalance.css";

function AddBalance() {
  const [amount, setAmount] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Morate biti prijavljeni!");
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/addbalance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("Greška pri ažuriranju balansa.");
      }

      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške pri dodavanju budžeta.");
    }
  };

  return (
    <div className="addbalance-container">
      <form onSubmit={handleSubmit} className="addbalance-form">
        <h2>Dodaj budžet</h2>
        <input
          type="number"
          step="0.01"
          placeholder="Unesite iznos"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">Dodaj</button>
      </form>
    </div>
  );
}

export default AddBalance;
