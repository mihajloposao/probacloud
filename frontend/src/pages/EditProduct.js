import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import '../styles/ProductForm.css';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleUpdate = (updatedProduct) => {
    const formData = new FormData();
    formData.append("name", updatedProduct.name);
    formData.append("description", updatedProduct.description);
    formData.append("price", updatedProduct.price);
    if (updatedProduct.image) formData.append("image", updatedProduct.image);

    fetch(`${process.env.REACT_APP_API_URL}/products/${id}`, {
      method: "PUT",
      body: formData,
    })
      .then(() => navigate("/"))
      .catch((err) => console.error(err));
  };

  if (!product) return <p>Učitavanje proizvoda...</p>;

  return (
    <div>
      <h1>Izmeni proizvod</h1>
      {product.image_path && (
        <div style={{ marginBottom: "15px" }}>
          <img
            src={`${process.env.REACT_APP_API_URL}/${product.image_path}`}
            alt={product.name}
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
        </div>
      )}
      <ProductForm initialData={product} onSubmit={handleUpdate} />
    </div>
  );
}

export default EditProduct;
