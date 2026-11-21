import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext.jsx";

// Protege una página.
// - Sin "rolesPermitidos": basta con tener sesión iniciada.
// - Con "rolesPermitidos": además el rol (leído de la base de datos) debe estar en la lista.
// Uso: <RutaProtegida rolesPermitidos={["instructor"]}><Instructor /></RutaProtegida>
function RutaProtegida({ rolesPermitidos, children }) {
  // Estados: "verificando", "permitido", "sin-sesion", "sin-permiso", "sin-servidor"
  const [estado, setEstado] = useState("verificando");
  const { verificarRol } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  // Cada vez que se entra a una ruta protegida, se vuelve a verificar el rol
  useEffect(() => {
    setEstado("verificando");
    verificarRol(rolesPermitidos).then((resultado) => setEstado(resultado));
  }, [ubicacion.pathname]);

  if (estado === "verificando") {
    return <p style={estilos.pagina}>Verificando permisos...</p>;
  }

  if (estado === "sin-sesion") {
    return <Navigate to="/login" replace />;
  }

  if (estado === "sin-servidor") {
    return (
      <div style={estilos.pagina}>
        <h1>No se pudo verificar tu acceso</h1>
        <p>Verifica que el servidor esté encendido e inténtalo de nuevo.</p>
        <button style={estilos.boton} onClick={() => navigate("/")}>
          Ir al inicio
        </button>
      </div>
    );
  }

  if (estado === "sin-permiso") {
    return (
      <div style={estilos.pagina}>
        <h1>Acceso denegado</h1>
        <p>No tienes permiso para ingresar a esta página.</p>
        <button style={estilos.boton} onClick={() => navigate("/")}>
          Ir al inicio
        </button>
      </div>
    );
  }

  return children;
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#121212",
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
    textAlign: "center"
  },
  boton: {
    marginTop: "15px",
    padding: "10px 18px",
    background: "#ff5722",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer"
  }
};

export default RutaProtegida;