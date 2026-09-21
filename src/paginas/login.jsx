function login() {
    return (
        <div>
            <h1>Iniciar Sesión</h1>
            <form>
                <label>Usuario</label>
                <input type="text" />
                <label>Contraseña</label>
                <input type="password" />
                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}
export default login;