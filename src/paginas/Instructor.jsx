import React, { useState, useEffect } from "react";
import "../estilos/instructor.css";

function Instructor() {
  const [instructor, setInstructor] = useState(null);
  const [alumnosLibres, setAlumnosLibres] = useState([]);
  const [misAlumnos, setMisAlumnos] = useState([]);
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([]);

  // Estados de control de UI
  const [etiquetaFiltro, setEtiquetaFiltro] = useState("TODOS");
  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);
  const [modalEjerciciosAbierto, setModalEjerciciosAbierto] = useState(false);

  // Estado para armar/editar rutina
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [esEdicion, setEsEdicion] = useState(false);
  const [idRutinaAEditar, setIdRutinaAEditar] = useState(null);
  const [nombreRutina, setNombreRutina] = useState("");
  const [diaAsignado, setDiaAsignado] = useState("Lunes");
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);

  // Modal Ver Rutina del Alumno
  const [verRutinaModal, setVerRutinaModal] = useState(null);
  const [rutinaAlumno, setRutinaAlumno] = useState([]);
  const [cargandoRutina, setCargandoRutina] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const profe = JSON.parse(usuarioGuardado);
      setInstructor(profe);
      cargarDatos(profe.id);
    }
  }, []);

  const cargarDatos = async (instructorId) => {
    try {
      const [resSolicitudes, resEjercicios] = await Promise.all([
        fetch("http://localhost:3000/api/solicitudes"),
        fetch("http://localhost:3000/api/ejercicios")
      ]);
      const datosSolicitudes = await resSolicitudes.json();
      const datosEjercicios = await resEjercicios.json();

      setAlumnosLibres(datosSolicitudes.filter(s => !s.instructor_id));
      setMisAlumnos(datosSolicitudes.filter(s => Number(s.instructor_id) === Number(instructorId)));
      setEjerciciosDisponibles(datosEjercicios);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  const tomarAlumno = async (usuarioId) => {
    if (!instructor) return;
    try {
      const res = await fetch(`http://localhost:3000/api/alumnos/${usuarioId}/asignar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructor_id: instructor.id })
      });
      if (res.ok) {
        alert("¡Alumno asignado correctamente!");
        cargarDatos(instructor.id);
        setMenuLateralAbierto(false);
      }
    } catch (err) {
      alert("Error al asignar alumno.");
    }
  };

  const consultarRutinaAlumno = async (usuarioId, nombreAlumno) => {
    setVerRutinaModal({ usuarioId, nombreAlumno });
    setRutinaAlumno([]);
    setCargandoRutina(true);

    try {
      const res = await fetch(`http://localhost:3000/api/rutinas/usuario/${usuarioId}`);
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      
      const datos = await res.json();
      const listaRutinas = Array.isArray(datos) ? datos : (datos.rutinas || []);
      setRutinaAlumno(listaRutinas);
    } catch (err) {
      console.error("Error al cargar rutina:", err);
      alert("Error al cargar la rutina.");
    } finally {
      setCargandoRutina(false);
    }
  };

  const borrarRutina = async (rutinaId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta rutina?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/rutinas/${rutinaId}`, { method: "DELETE" });
      if (res.ok) {
        alert("Rutina eliminada");
        consultarRutinaAlumno(verRutinaModal.usuarioId, verRutinaModal.nombreAlumno);
      }
    } catch (err) {
      alert("Error al eliminar rutina");
    }
  };

  const agregarEjercicioARutina = (ejercicioId) => {
    if (ejerciciosSeleccionados.some(e => e.ejercicio_id === parseInt(ejercicioId))) return;
    setEjerciciosSeleccionados([
      ...ejerciciosSeleccionados,
      { ejercicio_id: parseInt(ejercicioId), series: 4, repeticiones: "10-12" }
    ]);
  };

  const actualizarDetalleEjercicio = (index, campo, valor) => {
    const copia = [...ejerciciosSeleccionados];
    copia[index][campo] = valor;
    setEjerciciosSeleccionados(copia);
  };

  const resetearFormulario = () => {
    setSolicitudSeleccionada(null);
    setEsEdicion(false);
    setIdRutinaAEditar(null);
    setNombreRutina("");
    setDiaAsignado("Lunes");
    setEjerciciosSeleccionados([]);
    setEtiquetaFiltro("TODOS");
    setModalEjerciciosAbierto(false);
  };

  const guardarRutina = async (e) => {
    e.preventDefault();
    if (!solicitudSeleccionada || ejerciciosSeleccionados.length === 0) {
      alert("Selecciona al menos un ejercicio.");
      return;
    }

    const endpoint = esEdicion
      ? `http://localhost:3000/api/rutinas/${idRutinaAEditar}`
      : "http://localhost:3000/api/rutinas";

    try {
      const res = await fetch(endpoint, {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: solicitudSeleccionada.usuario_id || solicitudSeleccionada.id,
          instructor_id: instructor?.id,
          nombre_rutina: nombreRutina,
          proposito: solicitudSeleccionada.meta_nombre || "Gimnasio General",
          dia_asignado: diaAsignado,
          ejercicios: ejerciciosSeleccionados
        })
      });

      if (res.ok) {
        alert("¡Rutina guardada!");
        resetearFormulario();
        cargarDatos(instructor.id);
      }
    } catch (err) {
      alert("Error al guardar la rutina.");
    }
  };

  const listaEtiquetas = ["TODOS", ...Array.from(
    new Set(ejerciciosDisponibles.flatMap(ej => Array.isArray(ej.etiquetas) ? ej.etiquetas : []))
  )];

  const ejerciciosFiltrados = ejerciciosDisponibles.filter(ej => 
    etiquetaFiltro === "TODOS" || (Array.isArray(ej.etiquetas) && ej.etiquetas.includes(etiquetaFiltro))
  );

  return (
    <div className="instructor-container">
      <button type="button" className="btn-flotante-izquierda" onClick={() => setMenuLateralAbierto(true)}>
        📌 <span className="badge-contador">{alumnosLibres.length}</span>
      </button>

      {menuLateralAbierto && (
        <div className="drawer-overlay" onClick={() => setMenuLateralAbierto(false)}>
          <div className="drawer-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="encabezado-modal">
              <h3>📌 Alumnos Sin Asignar ({alumnosLibres.length})</h3>
              <button className="btn-cerrar-modal" onClick={() => setMenuLateralAbierto(false)}>✖</button>
            </div>
            <div className="alumnos-list" style={{ marginTop: "15px" }}>
              {alumnosLibres.map((al) => (
                <div key={al.id || al.usuario_id} className="alumno-card-mini">
                  <h4>{al.nombre_completo}</h4>
                  <div style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "6px", 
                    backgroundColor: "#2a2a36", 
                    padding: "4px 10px", 
                    borderRadius: "15px", 
                    fontSize: "0.8rem", 
                    color: "#b0b0c0", 
                    margin: "5px 0", 
                    border: "1px solid #3f3f4e" 
                  }}>
                    <span>{al.meta_icono || "🎯"}</span>
                    <span style={{ color: "#fff", fontWeight: "500" }}>{al.meta_nombre || "General"}</span>
                  </div>
                  <button className="btn-ver-rutina" onClick={() => tomarAlumno(al.id || al.usuario_id)}>
                    🤝 Tomar Alumno
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="instructor-content">
        <header className="header-card">
          <h1 className="header-title">Panel del Instructor</h1>
          <p className="header-subtitle">{instructor ? `Bienvenido/a, ${instructor.nombre_completo}` : ""}</p>
        </header>

        <section className="metrics-grid">
          <div className="metric-card"><span className="metric-number">{misAlumnos.length}</span><span className="metric-label">Mis Alumnos</span></div>
          <div className="metric-card"><span className="metric-number">{alumnosLibres.length}</span><span className="metric-label">Pendientes</span></div>
        </section>

        <main>
          <h2 className="section-title">🏋️ Mis Alumnos Asignados</h2>
          <div className="alumnos-list">
            {misAlumnos.map((alumno) => {
              const idAlumno = alumno.usuario_id || alumno.id;
              return (
                <div key={idAlumno} className="alumno-card">
                  <div>
                    <h3 className="alumno-nombre">{alumno.nombre_completo}</h3>
                    
                    <div style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      backgroundColor: "#2a2a36", 
                      padding: "4px 10px", 
                      borderRadius: "15px", 
                      fontSize: "0.8rem", 
                      color: "#b0b0c0", 
                      margin: "5px 0 0 0", 
                      border: "1px solid #3f3f4e" 
                    }}>
                      <span>{alumno.meta_icono || "🎯"}</span>
                      <span style={{ color: "#fff", fontWeight: "500" }}>{alumno.meta_nombre || "General"}</span>
                    </div>
                  </div>

                  <div className="contenedor-botones-card">
                    <button className="btn-ver-rutina" onClick={() => setSolicitudSeleccionada(alumno)}>
                      ➕ Armar Rutina
                    </button>
                    <button className="btn-secundario" onClick={() => consultarRutinaAlumno(idAlumno, alumno.nombre_completo)}>
                      📋 Ver Rutinas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MODAL ARMADO / EDICIÓN DE RUTINA */}
          {solicitudSeleccionada && (
            <div className="modal-overlay" onClick={resetearFormulario}>
              <div className="tarjeta-formulario modal-contenido modal-ancho" onClick={(e) => e.stopPropagation()}>
                <div className="encabezado-modal">
                  <h3>{esEdicion ? "✏️ Editar" : "➕ Armar"} Rutina: {solicitudSeleccionada.nombre_completo}</h3>
                  <button className="btn-cerrar-modal" onClick={resetearFormulario}>✖</button>
                </div>

                <form onSubmit={guardarRutina} className="formulario-rutina">
                  <div className="grid-dos-columnas">
                    <div className="campo-grupo">
                      <label className="etiqueta-input">Nombre de la Rutina</label>
                      <input type="text" className="input-estilizado" value={nombreRutina} onChange={(e) => setNombreRutina(e.target.value)} required />
                    </div>
                    <div className="campo-grupo">
                      <label className="etiqueta-input">Día Asignado</label>
                      <select className="select-estilizado" value={diaAsignado} onChange={(e) => setDiaAsignado(e.target.value)}>
                        {["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="campo-grupo" style={{ marginTop: "10px" }}>
                    <button type="button" className="btn-abrir-catalogo-modal" onClick={() => setModalEjerciciosAbierto(true)}>
                      🔍 Abrir Catálogo con Burbujas Musculares
                    </button>
                  </div>

                  <div className="contenedor-ejercicios-rutina">
                    <h4>Ejercicios Seleccionados ({ejerciciosSeleccionados.length})</h4>
                    {ejerciciosSeleccionados.map((item, index) => {
                      const det = ejerciciosDisponibles.find(e => e.id === item.ejercicio_id);
                      return (
                        <div key={index} className="fila-ejercicio-item">
                          <div className="detalles-ejercicio-agregado">
                            <span className="nombre-ejercicio-item">{det?.nombre || `Ejercicio #${item.ejercicio_id}`}</span>
                            <div className="burbujas-musculares">
                              {det?.etiquetas?.map((m, i) => (
                                <span key={i} className="badge-musculo mini">{m}</span>
                              ))}
                            </div>
                          </div>
                          <div className="control-series-reps">
                            <input type="number" className="input-mini" value={item.series} onChange={(e) => actualizarDetalleEjercicio(index, "series", e.target.value)} />
                            <input type="text" className="input-mini" value={item.repeticiones} onChange={(e) => actualizarDetalleEjercicio(index, "repeticiones", e.target.value)} />
                            <button type="button" className="btn-eliminar-item" onClick={() => setEjerciciosSeleccionados(ejerciciosSeleccionados.filter((_, i) => i !== index))}>✖</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="acciones-formulario">
                    <button type="submit" className="btn-ver-rutina">{esEdicion ? "Actualizar" : "Guardar y Asignar"}</button>
                    <button type="button" className="btn-cancelar" onClick={resetearFormulario}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CATÁLOGO EMERGENTE DE EJERCICIOS */}
          {modalEjerciciosAbierto && (
            <div className="modal-overlay-ejercicios" onClick={() => setModalEjerciciosAbierto(false)}>
              <div className="modal-contenido-ejercicios" onClick={(e) => e.stopPropagation()}>
                <div className="encabezado-modal">
                  <h3>🏋️️ Catálogo de Ejercicios por Músculo</h3>
                  <button className="btn-cerrar-modal" onClick={() => setModalEjerciciosAbierto(false)}>✖</button>
                </div>
                <div className="contenedor-burbujas-filtro">
                  {listaEtiquetas.map((etq) => (
                    <button key={etq} type="button" className={`burbuja-filtro ${etiquetaFiltro === etq ? "activa" : ""}`} onClick={() => setEtiquetaFiltro(etq)}>
                      {etq}
                    </button>
                  ))}
                </div>
                <div className="grid-ejercicios-catalogo-modal">
                  {ejerciciosFiltrados.map((ej) => {
                    const yaAgregado = ejerciciosSeleccionados.some(e => e.ejercicio_id === ej.id);
                    return (
                      <div key={ej.id} className={`tarjeta-ejercicio-burbuja ${yaAgregado ? "agregado" : ""}`} onClick={() => !yaAgregado && agregarEjercicioARutina(ej.id)}>
                        <div className="cabecera-tarjeta-ejercicio">
                          <span>{ej.nombre}</span>
                          <span>{yaAgregado ? "✓" : "+"}</span>
                        </div>
                        <p className="desc-ej-catalogo">{ej.descripcion}</p>
                        <div className="burbujas-musculares">
                          {ej.etiquetas?.map((m, idx) => (
                            <span key={idx} className="badge-musculo">{m}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MODAL VER RUTINAS DEL ALUMNO */}
          {verRutinaModal && (
            <div className="modal-overlay" onClick={() => setVerRutinaModal(null)}>
              <div className="tarjeta-formulario modal-contenido" onClick={(e) => e.stopPropagation()}>
                <div className="encabezado-modal">
                  <h3>📋 Rutinas de: {verRutinaModal.nombreAlumno}</h3>
                  <button className="btn-cerrar-modal" onClick={() => setVerRutinaModal(null)}>✖</button>
                </div>

                {cargandoRutina ? (
                  <p className="texto-vacio">Cargando rutinas...</p>
                ) : rutinaAlumno.length === 0 ? (
                  <p className="texto-vacio">Este alumno no tiene ninguna rutina asignada todavía.</p>
                ) : (
                  <div className="vista-rutina-agrupada">
                    {rutinaAlumno.map((rut, index) => {
                      const idDeRutina = rut.rutina_id || rut.id || index;
                      const ejerciciosLista = rut.ejercicios || [];

                      return (
                        <div key={idDeRutina} className="bloque-musculo-dia">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <h4 className="titulo-bloque-dia">
                              {rut.dia_asignado || "Sin día"}: {rut.nombre_rutina || "Rutina sin nombre"}
                            </h4>
                            {(rut.rutina_id || rut.id) && (
                              <div style={{ display: "flex", gap: "10px" }}>
                                <button 
                                  className="btn-ver-rutina"
                                  style={{ padding: "4px 10px", margin: "0", fontSize: "0.85rem" }}
                                  onClick={() => {
                                    setEsEdicion(true);
                                    setIdRutinaAEditar(rut.rutina_id || rut.id);
                                    setNombreRutina(rut.nombre_rutina);
                                    setDiaAsignado(rut.dia_asignado);
                                    setEjerciciosSeleccionados(
                                      (rut.ejercicios || []).map(ej => ({
                                        ejercicio_id: ej.id || ej.ejercicio_id,
                                        series: ej.series || 4,
                                        repeticiones: ej.repeticiones || "10-12"
                                      }))
                                    );
                                    setSolicitudSeleccionada({ 
                                      id: verRutinaModal.usuarioId, 
                                      usuario_id: verRutinaModal.usuarioId,
                                      nombre_completo: verRutinaModal.nombreAlumno 
                                    });
                                    setVerRutinaModal(null);
                                  }}
                                >
                                  ✏️ Editar
                                </button>
                                <button className="btn-borrar-rutina" onClick={() => borrarRutina(rut.rutina_id || rut.id)}>
                                  🗑️ Borrar
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="lista-ejercicios-vista">
                            {ejerciciosLista.length > 0 ? (
                              ejerciciosLista.map((ej, idx) => (
                                <div key={ej.id || idx} className="tarjeta-ejercicio-vista">
                                  <div>
                                    <p className="ejercicio-nombre-vista">{ej.nombre || ej.nombre_ejercicio || "Ejercicio"}</p>
                                    {ej.descripcion && <p className="ejercicio-desc-vista">{ej.descripcion}</p>}
                                  </div>
                                  <span className="badge-series-reps">
                                    {ej.series || 0} series x {ej.repeticiones || "0"}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="texto-vacio" style={{ fontSize: "0.8rem" }}>Sin ejercicios asignados.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Instructor;