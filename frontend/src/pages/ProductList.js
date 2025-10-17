import React, { useEffect, useState } from "react";
import "../styles/ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);

  const fetchProducts = () => {
    fetch(`${process.env.REACT_APP_API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
      .catch((err) => console.error("Greška pri dohvatanju proizvoda:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Funkcija za kupovinu
  const handleBuy = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Morate biti prijavljeni da biste kupili proizvod.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/buy/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Došlo je do greške pri kupovini.");
        return;
      }

      alert("Kupovina uspešna!");
      window.location.reload();
      fetchProducts();
    } catch (err) {
      console.error("Greška pri kupovini:", err);
      alert("Greška pri kupovini proizvoda.");
    }
  };

  return (
    <div>
      <h1>Lista proizvoda</h1>
      <ul className="product-list">
        {products.map((p) => (
          <li key={p.id} className="product-item">
            {p.image_path && (
              <div className="product-image-container">
                <img
                  src={`${process.env.REACT_APP_API_URL}/${p.image_path}`}
                  alt={p.name}
                  className="product-image"
                />
              </div>
            )}
            <div className="product-info">
              <h3>{p.name}</h3>
              <p>{p.price} RSD</p>
            </div>
            <div className="product-actions">
              <button className="buy" onClick={() => handleBuy(p.id)}>
                Kupi
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
