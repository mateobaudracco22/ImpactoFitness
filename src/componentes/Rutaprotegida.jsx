import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext.jsx";

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!usuario) {
    // Guardamos a dónde quería ir, para volver ahí después del login
    return <Navigate to="/login" state={{ desde: ubicacion }} replace />;
  }

  return children;
}

export default RutaProtegida;