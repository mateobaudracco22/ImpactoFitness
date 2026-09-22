Import React from "react";

function login() {
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
                <input type="password" />
                </div>
                <button type="submit">Ingresar</button>
       </form>
     </div>
    </div>
    );
}

export default login;