import React from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import '../styles/ProductForm.css';

function AddProduct() {
  const navigate = useNavigate();

  const handleAdd = (formData) => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    if (formData.image) data.append("image", formData.image);

    fetch(`${process.env.REACT_APP_API_URL}/products`, {
      method: "POST",
      body: data,
    })
      .then(() => navigate("/"))
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>Dodaj proizvod</h1>
      <ProductForm onSubmit={handleAdd} />
    </div>
  );
}

export default AddProduct;
