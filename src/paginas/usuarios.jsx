import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/usuario.css";

function MisRutinas() {
  const [usuario, setUsuario] = useState(null);
  const [rutinasAgrupadas, setRutinasAgrupadas] = useState({});
  const [metasDisponibles, setMetasDisponibles] = useState([]);
  const [metaSeleccionada, setMetaSeleccionada] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState("rutinas");
  
  const [cargando, setCargando] = useState(true);
  const [guardandoMeta, setGuardandoMeta] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuario(user);
      setMetaSeleccionada(user.meta_id || null);
      obtenerMisRutinas(user.id);
      obtenerMetas();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const obtenerMisRutinas = async (idUsuario) => {
    try {
      const respuesta = await fetch(`http://localhost:3000/api/rutinas/usuario/${idUsuario}`);
      if (!respuesta.ok) throw new Error("Error al obtener las rutinas");
      
      const datos = await respuesta.json();
      
      const agrupado = datos.reduce((acc, item) => {
        const dia = item.dia_asignado || "Sin asignar";

        if (!acc[dia]) acc[dia] = [];
        
        acc[dia].push({
          id: item.rutina_id,
          nombre_rutina: item.nombre_rutina,
          proposito: item.proposito,
          ejercicios: item.ejercicios || []
        });

        return acc;
      }, {});

      setRutinasAgrupadas(agrupado);
    } catch (err) {
      setError("No se pudieron cargar tus rutinas. Intenta más tarde.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerMetas = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/metas");
      if (res.ok) {
        const datos = await res.json();
        setMetasDisponibles(datos);
      } else {
        setMetasDisponibles([
          { id: 1, nombre: "Ganar Músculo", descripcion: "Enfocado en hipertrofia y fuerza.", icono: "🏋️" },
          { id: 2, nombre: "Perder Peso", descripcion: "Enfocado en déficit calórico y quema de grasa.", icono: "🔥" },
          { id: 3, nombre: "Resistencia / Cardio", descripcion: "Mejora del estado físico general.", icono: "🏃‍♂️" },
          { id: 4, nombre: "Mantenimiento", descripcion: "Mantener el peso actual y tono muscular.", icono: "🧘" }
        ]);
      }
    } catch (err) {
      setMetasDisponibles([
        { id: 1, nombre: "Ganar Músculo", descripcion: "Enfocado en hipertrofia y fuerza.", icono: "🏋️" },
        { id: 2, nombre: "Perder Peso", descripcion: "Enfocado en déficit calórico y quema de grasa.", icono: "🔥" },
        { id: 3, nombre: "Resistencia / Cardio", descripcion: "Mejora del estado físico general.", icono: "🏃‍♂️" },
        { id: 4, nombre: "Mantenimiento", descripcion: "Mantener el peso actual y tono muscular.", icono: "🧘" }
      ]);
    }
  };

  const cambiarMetaUsuario = async (metaId) => {
    setGuardandoMeta(true);
    setMensajeExito("");
    setError("");

    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${usuario.id}/meta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta_id: metaId })
      });

      if (res.ok) {
        setMetaSeleccionada(metaId);
        const metaObj = metasDisponibles.find(m => m.id === metaId);
        const usuarioActualizado = { 
          ...usuario, 
          meta_id: metaId, 
          meta_nombre: metaObj?.nombre,
          meta_icono: metaObj?.icono 
        };
        
        setUsuario(usuarioActualizado);
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
        setMensajeExito("¡Tu meta ha sido actualizada correctamente!");
      } else {
        setError("No se pudo actualizar tu meta. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError("Error de red al actualizar la meta.");
    } finally {
      setGuardandoMeta(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const metaActualObj = metasDisponibles.find(m => m.id === metaSeleccionada);

  return (
    <div className="layout-usuario">
      <aside className="sidebar">
        <div className="perfil-info">
          <div className="avatar-circulo">👤</div>
          <h3>Hola, {usuario ? usuario.nombre_completo.split(" ")[0] : "Usuario"}</h3>
          {metaActualObj && (
            <span className="badge-meta-sidebar">
              {metaActualObj.icono} {metaActualObj.nombre}
            </span>
          )}
        </div>
        
        <nav className="menu-navegacion">
          <button 
            className={`menu-item ${seccionActiva === "rutinas" ? "activo" : ""}`}
            onClick={() => setSeccionActiva("rutinas")}
          >
            📋 Mis Rutinas
          </button>
          <button 
            className={`menu-item ${seccionActiva === "metas" ? "activo" : ""}`}
            onClick={() => setSeccionActiva("metas")}
          >
            🎯 Mis Metas / Ajustes
          </button>
          {/* NUEVO BOTÓN PARA IR A INFORMACIÓN */}
          <button 
            className="menu-item"
            onClick={() => navigate("/informacion")}
          >
            ℹ️ Información del Gimnasio
          </button>
        </nav>

        <div className="menu-footer">
          <button className="menu-item salir" onClick={handleCerrarSesion}>
            ↪ Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="contenido-principal">
        {seccionActiva === "rutinas" ? (
          <>
            <header className="cabecera-seccion">
              <h1>Mis Rutinas Asignadas</h1>
              <p>Mira tus planes de entrenamiento divididos por día.</p>
            </header>

            {cargando && <p className="cargando-texto">Cargando tus rutinas...</p>}
            {error && <p className="error-texto">{error}</p>}

            {!cargando && Object.keys(rutinasAgrupadas).length === 0 && (
              <div className="tarjeta-vacia">
                <p className="vacio-texto">Aún no tienes rutinas asignadas para tu meta actual.</p>
              </div>
            )}

            <div className="contenedor-rutinas">
              {Object.keys(rutinasAgrupadas).map((dia) => (
                <div key={dia} className="bloque-dia">
                  <h2 className="titulo-dia">{dia}</h2>
                  
                  <div className="grid-tarjetas">
                    {rutinasAgrupadas[dia].map((rutina) => (
                      <div key={rutina.id} className="tarjeta-rutina">
                        <div className="tarjeta-cabecera">
                          <div>
                            <h3 className="rutina-nombre">{rutina.nombre_rutina}</h3>
                            <p className="rutina-instructor">Objetivo: {rutina.proposito}</p>
                          </div>
                          <button 
                            className="btn-ver-detalle"
                            onClick={() => setRutinaSeleccionada(rutina)}
                          >
                            Ver Detalle
                          </button>
                        </div>

                        <ul className="lista-ejercicios">
                          {rutina.ejercicios.length === 0 && <li>Sin ejercicios asignados.</li>}
                          {rutina.ejercicios.map((ej, index) => (
                            <li key={index}>
                              Ejercicio {index + 1}: {ej.nombre_ejercicio} - {ej.series} sets x {ej.repeticiones} reps
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* SECCIÓN DE METAS / AJUSTES */
          <section className="seccion-metas-ajustes">
            <header className="cabecera-seccion">
              <h1>Selecciona tu Meta de Entrenamiento</h1>
              <p>Tu instructor verá esta meta al momento de armar tus rutinas.</p>
            </header>

            {mensajeExito && <p className="mensaje-exito">✅ {mensajeExito}</p>}
            {error && <p className="error-texto">{error}</p>}

            <div className="grid-metas-tarjetas">
              {metasDisponibles.map((meta) => {
                const esSeleccionada = metaSeleccionada === meta.id;
                return (
                  <div 
                    key={meta.id} 
                    className={`tarjeta-meta-opcion ${esSeleccionada ? "meta-activa" : ""}`}
                    onClick={() => !guardandoMeta && cambiarMetaUsuario(meta.id)}
                  >
                    <div className="icono-meta">{meta.icono || "🎯"}</div>
                    <div className="info-meta">
                      <h3>{meta.nombre}</h3>
                      <p>{meta.descripcion}</p>
                    </div>
                    {esSeleccionada && <span className="check-meta">✓ Activa</span>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* MODAL DETALLE DE RUTINA */}
        {rutinaSeleccionada && (
          <div className="modal-overlay-usuario" onClick={() => setRutinaSeleccionada(null)}>
            <div className="modal-content-usuario" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-usuario">
                <h2>{rutinaSeleccionada.nombre_rutina}</h2>
                <button className="btn-close-modal" onClick={() => setRutinaSeleccionada(null)}>✖</button>
              </div>
              <p className="modal-proposito"><strong>Objetivo:</strong> {rutinaSeleccionada.proposito}</p>
              
              <div className="modal-body-usuario">
                {rutinaSeleccionada.ejercicios.length === 0 ? (
                  <p>No hay ejercicios detallados para esta rutina.</p>
                ) : (
                  rutinaSeleccionada.ejercicios.map((ej, idx) => (
                    <div key={idx} className="ejercicio-detalle-item">
                      <div className="ejercicio-numero">{idx + 1}</div>
                      <div className="ejercicio-info">
                        <h4>{ej.nombre_ejercicio}</h4>
                        <p>{ej.series} Series × {ej.repeticiones} Repeticiones</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MisRutinas;