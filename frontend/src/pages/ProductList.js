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
              <button className="buy">Kupi</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
