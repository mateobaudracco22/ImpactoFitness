import Login from "/src/paginas/login.jsx";
import Informacion from "./src/paginas/informacion.jsx";
import Instructor from "./src/paginas/Instructor.jsx";
import Usuarios from "./src/paginas/usuarios.jsx";
import CrearCuenta from "./src/paginas/crear.cuenta.jsx";
import Solicitud_Rutina from "./src/paginas/Solicitud_Rutina.jsx";
import NotificacionIns from "./src/paginas/notificacion_ins.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Informacion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/informacion" element={<Informacion />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/crear.cuenta" element={<CrearCuenta />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/Solicitud_Rutina" element={<SolicitarRutina />} />
        <Route path="/notificacion_ins" element={<NotificacionIns/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;