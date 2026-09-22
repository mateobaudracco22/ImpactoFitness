Import React from "react";

function login() {
    return (
        <div>
            <h1>Iniciar Sesión</h1>
            <form>
                <label>Nombre y Apellido</label>
                <input type="text" placeholder="Ingresa tu nombre" />
                <label>Usuario</label>
                <input type="text" placeholder="Ingresa tu usuario" />
                <label>Email</label>
                <input type="email" placeholder="correo@ejemplo.com" />
                <label>Contraseña</label>
                <input type="password" />
                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}

export default login;