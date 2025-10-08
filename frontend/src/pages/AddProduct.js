import React from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import {jwtDecode} from "jwt-decode"; // za dekod tokena
import '../styles/ProductForm.css';

function AddProduct() {
  const navigate = useNavigate();

  const handleAdd = (formData) => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    if (formData.image) data.append("image", formData.image);

    // uzimamo id trenutnog korisnika iz tokena
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      data.append("user_id", decoded.id); // dodajemo user_id
    }

    fetch(`${process.env.REACT_APP_API_URL}/products`, {
      method: "POST",
      body: data,
    })
      .then(() => navigate("/productlist"))
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
