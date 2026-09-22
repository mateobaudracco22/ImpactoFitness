Import React from "react";

function login() {
    return (
        <div>
            <h1>Iniciar Sesión</h1>
            <form>
                <label>Nombre y Apellido</label>
                <input type="text"/>
                <label>Usuario</label>
                <input type="text" />
            <label>Email</label>
                <input type="email" />
                <label>Contraseña</label>
                <input type="password" />
                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}

export default login;