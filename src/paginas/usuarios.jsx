import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/usuario.css";

function MisRutinas() {
  const [usuario, setUsuario] = useState(null);
  const [rutinasAgrupadas, setRutinasAgrupadas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Obtener el usuario logueado
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuario(user);
      obtenerMisRutinas(user.id);
    } else {
      // Si no hay usuario, redirigir al login
      navigate("/");
    }
  }, [navigate]);

  const obtenerMisRutinas = async (idUsuario) => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/rutinas/usuario/${idUsuario}`);
      if (!respuesta.ok) throw new Error("Error al obtener las rutinas");
      
      const datos = await respuesta.json();
      
      // 2. Transformar los datos planos agrupándolos primero por DÍA y luego por RUTINA
      const agrupado = datos.reduce((acc, item) => {
        const dia = item.dia_asignado || "Sin asignar";
        const idRutina = item.rutina_id;

        if (!acc[dia]) acc[dia] = {};
        if (!acc[dia][idRutina]) {
          acc[dia][idRutina] = {
            id: idRutina,
            nombre_rutina: item.nombre_rutina,
            proposito: item.proposito,
            ejercicios: []
          };
        }

        if (item.nombre_ejercicio) {
          acc[dia][idRutina].ejercicios.push({
            nombre: item.nombre_ejercicio,
            series: item.series,
            repeticiones: item.repeticiones
          });
        }
        return acc;
      }, {});

      setRutinasAgrupadas(agrupado);
    } catch (err) {
      setError("No se pudieron cargar tus rutinas. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="layout-usuario">
      {/* SIDEBAR LATERAL (Basado en el diseño) */}
      <aside className="sidebar">
        <div className="perfil-info">
          <div className="avatar-circulo">👤</div>
          <h3>Hola, {usuario ? usuario.nombre_completo.split(" ")[0] : "Usuario"}</h3>
        </div>
        
        <nav className="menu-navegacion">
          <button className="menu-item activo">Mis Rutinas</button>
        </nav>

        <div className="menu-footer">
          <button className="menu-item salir" onClick={handleCerrarSesion}>
            ↪ Log Out
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido-principal">
        <header className="cabecera-seccion">
          <h1>Mis Rutinas Asignadas</h1>
          <p>Mira tus planes de entrenamiento divididos por día.</p>
        </header>

        {cargando && <p className="cargando-texto">Cargando tus rutinas...</p>}
        {error && <p className="error-texto">{error}</p>}

        {!cargando && Object.keys(rutinasAgrupadas).length === 0 && (
          <p className="vacio-texto">Aún no tienes rutinas asignadas. ¡Habla con tu instructor!</p>
        )}

        <div className="contenedor-rutinas">
          {Object.keys(rutinasAgrupadas).map((dia) => (
            <div key={dia} className="bloque-dia">
              <h2 className="titulo-dia">{dia}</h2>
              
              <div className="grid-tarjetas">
                {Object.values(rutinasAgrupadas[dia]).map((rutina) => (
                  <div key={rutina.id} className="tarjeta-rutina">
                    <div className="tarjeta-cabecera">
                      <div>
                        <h3 className="rutina-nombre">{rutina.nombre_rutina}</h3>
                        <p className="rutina-instructor">Objetivo: {rutina.proposito}</p>
                      </div>
                      <button className="btn-ver-detalle">Ver Detalle</button>
                    </div>

                    <ul className="lista-ejercicios">
                      {rutina.ejercicios.length === 0 && <li>Sin ejercicios asignados.</li>}
                      {rutina.ejercicios.map((ej, index) => (
                        <li key={index}>
                          Ejercicio {index + 1}: {ej.nombre} - {ej.series} sets x {ej.repeticiones} reps
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MisRutinas;