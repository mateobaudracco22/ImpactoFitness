import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importamos la navegación
import "../estilos/login.css";

function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate(); // 2. Inicializamos el hook de navegación

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const respuesta = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || "Credenciales inválidas");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      if (onLoginExitoso) {
        onLoginExitoso(datos.usuario);
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor. Verifica que esté encendido.");
    }
  };

  return (
    <div className="contenedor-login">
      <div className="tarjeta-login">
        <h1 className="titulo-login">Iniciar Sesión</h1>

        {error && <p className="mensaje-error">{error}</p>}

        <form className="formulario-login" onSubmit={handleSubmit}>
          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <div className="contenedor-input-password">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="boton-ojo"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                {mostrarPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="boton-ingresar">
            Ingresar
          </button>
        </form>

        <div className="seccion-registro">
          <p>¿No tienes una cuenta?</p>
          <button 
            type="button" 
            className="boton-crear-cuenta" 
            onClick={() => navigate("/crear.cuenta")} // 3. Ruta corregida (sin el punto inicial)
          >
            Crear Cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;