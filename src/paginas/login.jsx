import React, { useState } from "react";
import "../estilos/login.css";

function Login() {
  const [mostrarPassword, setMostrarPassword] = useState(false);

  return (
    <div className="contenedor-login">
      <div className="tarjeta-login">
        <h1 className="titulo-login">Iniciar Sesión</h1>

        <form className="formulario-login">
          <div className="campo">
            <label>Nombre y Apellido</label>
            <input type="text" placeholder="Ingresa tu nombre" />
          </div>

          <div className="campo">
            <label>Usuario</label>
            <input type="text" placeholder="Ingresa tu usuario" />
          </div>

          <div className="campo">
            <label>Email</label>
            <input type="email" placeholder="correo@ejemplo.com" />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <div className="contenedor-input-password">
              <input type={mostrarPassword ? "text" : "password"} placeholder="••••••••"/>
              <button type="submit" className="boton-ingresar">Ingresar</button>
              <button type="button" className="boton-ojo" onClick={() => setMostrarPassword(!mostrarPassword)}> {mostrarPassword ? "🙈" : "👁️"}
</button>
            </div>
          </div>

          <div className="seccion-registro">
            <p>¿No tienes una cuenta?</p>
            <button type="button" className="boton-crear-cuenta">
              Crear Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;