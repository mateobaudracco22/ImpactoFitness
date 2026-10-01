import Login from "./src/paginas/login.jsx";
import Informacion from "./src/paginas/informacion.jsx";
import Instructor from "./src/paginas/instructor.jsx";
import CrearCuenta from "./src/paginas/crear.cuenta.jsx"; // <-- Agregado
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/informacion" element={<Informacion />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/crear.cuenta" element={<CrearCuenta />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;