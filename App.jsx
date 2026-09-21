import React from "react";
import Login from "./paginas/login.jsx";
import Informacion from "./paginas/informacion.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/informacion" element={<Informacion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;