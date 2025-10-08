import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./pages/ProductList";
import SellerProductList from "./pages/SellerProductList";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSeller from "./pages/RegisterSeller"; 
import Login from "./pages/Login";         
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import './styles/App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/seller/productlist" 
          element={<ProtectedRoute allowedRoles={['seller']}><SellerProductList /></ProtectedRoute>} />
          <Route path="/addproduct" 
          element={<ProtectedRoute allowedRoles={['seller']}><AddProduct /></ProtectedRoute>}/>
          <Route path="/edit/:id" element={<ProtectedRoute allowedRoles={['seller']}><EditProduct /></ProtectedRoute>} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/seller" element={<RegisterSeller />} />
          <Route path="/login" element={<Login />} />
          <Route path="/productlist" element={<ProductList/>}/>       
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
