import Login from "/src/paginas/login.jsx";
import Informacion from "./src/paginas/informacion.jsx";
import Instructor from "./src/paginas/Instructor.jsx";
import Usuarios from "./src/paginas/usuarios.jsx";
import CrearCuenta from "./src/paginas/crear.cuenta.jsx";
import Solicitud_Rutina from "./src/paginas/Solicitud_Rutina.jsx";
import notificacion_ins from "./src/paginas/notificacion_ins.jsx";
import RutaProtegida from "./componentes/Rutaprotegida.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Informacion />} />
        <Route path="/login" element={<RutaProtegida><Login/></RutaProtegida>} />
        <Route path="/informacion" element={<RutaProtegida><Informacion /></RutaProtegida>} />
        <Route path="/instructor" element={<RutaProtegida><Instructor/></RutaProtegida>} />
        <Route path="/crear.cuenta" element={<RutaProtegida><CrearCuenta/></RutaProtegida>} />
        <Route path="/usuarios" element={<RutaProtegida><Usuarios/></RutaProtegida>} />
        <Route path="/Solicitud_Rutina" element={<RutaProtegida><Solicitud_Rutina/></RutaProtegida>} />
        <Route path="/notificacion_ins" element={<RutaProtegida><notificacion_ins/></RutaProtegida>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;