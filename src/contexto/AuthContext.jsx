import React, { createContext, useState, useContext } from "react";

// Contexto: comparte la sesión entre todas las páginas
const AuthContext = createContext();

// Lee el usuario guardado en el navegador (si el dato está dañado, lo borra)
function leerUsuarioGuardado() {
  try {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  } catch (error) {
    localStorage.removeItem("usuario");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  // Se llama desde el login cuando el servidor confirma email y contraseña
  const iniciarSesion = (datosUsuario) => {
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  // Se puede llamar desde cualquier botón "Cerrar Sesión"
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  // Verifica el rol REAL del usuario consultando la base de datos.
  // Si no se pasan roles, solo exige tener sesión iniciada.
  // Devuelve: "permitido", "sin-sesion", "sin-permiso" o "sin-servidor"
  const verificarRol = async (rolesPermitidos) => {
    const user = leerUsuarioGuardado();
    if (!user) return "sin-sesion";

    try {
      const respuesta = await fetch(`http://localhost:3000/api/usuarios/${user.id}/rol`);

      // El usuario ya no existe en la base de datos
      if (respuesta.status === 404) {
        cerrarSesion();
        return "sin-sesion";
      }

      if (!respuesta.ok) return "sin-servidor";

      const datos = await respuesta.json();

      if (!rolesPermitidos || rolesPermitidos.includes(datos.rol)) {
        return "permitido";
      }
      return "sin-permiso";
    } catch (error) {
      return "sin-servidor";
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion, verificarRol }}>
      {children}
    </AuthContext.Provider>
  );
}

// Para usarlo en cualquier página: const { usuario } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}