import React, { useState } from "react";
import "../estilos/login.css"; // o el estilo que uses

function CrearCuenta() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica de registro con la API
  };

  return (
    <div className="contenedor-login">
      <div className="tarjeta-login">
        <h1 className="titulo-login">Crear Cuenta</h1>
        <form className="formulario-login" onSubmit={handleSubmit}>
          <div className="campo">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              placeholder="Tu nombre" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
          </div>
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
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="boton-ingresar">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

export default CrearCuenta;