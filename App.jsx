import Login from "./src/paginas/login.jsx";
import Informacion from "./src/paginas/informacion.jsx";
import Instructor from "./src/paginas/Instructor.jsx";
import Usuarios from "./src/paginas/usuarios.jsx";
import CrearCuenta from "./src/paginas/crear.cuenta.jsx";
import SolicitudRutina from "./src/paginas/Solicitud_Rutina.jsx";
import NotificacionIns from "./src/paginas/notificacion_ins.jsx";
import RutaProtegida from "./src/componentes/Rutaprotegida.jsx";
import { AuthProvider } from "./src/contexto/AuthContext.jsx";

import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas: no piden sesión */}
          <Route path="/" element={<Informacion />} />
          <Route path="/informacion" element={<Informacion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/crear.cuenta" element={<CrearCuenta />} />

          {/* Solo instructores (el rol se verifica en la base de datos) */}
          <Route
            path="/instructor"
            element={
              <RutaProtegida rolesPermitidos={["instructor", "admin"]}>
                <Instructor />
              </RutaProtegida>
            }
          />
          <Route
            path="/notificacion_ins"
            element={
              <RutaProtegida rolesPermitidos={["instructor", "admin"]}>
                <NotificacionIns />
              </RutaProtegida>
            }
          />

          {/* Solo clientes (el instructor no puede entrar como usuario) */}
          <Route
            path="/usuarios"
            element={
              <RutaProtegida rolesPermitidos={["cliente", "admin"]}>
                <Usuarios />
              </RutaProtegida>
            }
          />
          <Route
            path="/Solicitud_Rutina"
            element={
              <RutaProtegida rolesPermitidos={["cliente", "admin"]}>
                <SolicitudRutina />
              </RutaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;