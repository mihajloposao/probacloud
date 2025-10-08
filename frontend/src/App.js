import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./pages/ProductList";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSeller from "./pages/RegisterSeller"; 
import Login from "./pages/Login";         
import Layout from "./components/Layout";
import './styles/App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/edit/:id" element={<EditProduct />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/seller" element={<RegisterSeller />} />
          <Route path="/login" element={<Login />} />       
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
