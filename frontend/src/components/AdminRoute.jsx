import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" />; // Or wherever you want to redirect non-admins
  }

  return children;
};

export default AdminRoute;
