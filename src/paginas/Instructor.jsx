import React, { useState, useEffect } from "react";
import "../estilos/instructor.css";

function Instructor() {
  const [instructor, setInstructor] = useState(null);
  const [alumnosLibres, setAlumnosLibres] = useState([]);
  const [misAlumnos, setMisAlumnos] = useState([]);
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estado para controlar la apertura del menú lateral desplegable
  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);

  // Estado para armar/asignar/editar rutina
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [esEdicion, setEsEdicion] = useState(false);
  const [idRutinaAEditar, setIdRutinaAEditar] = useState(null);
  
  const [nombreRutina, setNombreRutina] = useState("");
  const [diaAsignado, setDiaAsignado] = useState("Lunes");
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);

  // Estado para el modal de "Ver Rutina"
  const [verRutinaModal, setVerRutinaModal] = useState(null);
  const [rutinaAlumno, setRutinaAlumno] = useState([]);
  const [cargandoRutina, setCargandoRutina] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const profe = JSON.parse(usuarioGuardado);
      setInstructor(profe);
      cargarDatos(profe.id);
    } else {
      setCargando(false);
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

      const libres = datosSolicitudes.filter(s => !s.instructor_id);
      const asignados = datosSolicitudes.filter(s => Number(s.instructor_id) === Number(instructorId));

      setAlumnosLibres(libres);
      setMisAlumnos(asignados);
      setEjerciciosDisponibles(datosEjercicios);
    } catch (err) {
      setError("Error al conectar con el servidor backend.");
    } finally {
      setCargando(false);
    }
  };

  const tomarAlumno = async (usuarioId) => {
    if (!instructor) {
      alert("No se encontró una sesión activa de instructor.");
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:3000/api/alumnos/${usuarioId}/asignar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructor_id: instructor.id })
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        alert("¡Alumno asignado correctamente a tu lista!");
        cargarDatos(instructor.id);
        setMenuLateralAbierto(false); // Cierra el menú al tomar un alumno
      } else {
        alert(datos.mensaje || datos.error || "No se pudo asignar el alumno.");
      }
    } catch (err) {
      alert("Error al conectar con el servidor.");
    }
  };

  const consultarRutinaAlumno = async (usuarioId, nombreAlumno) => {
    setCargandoRutina(true);
    setVerRutinaModal({ usuarioId, nombreAlumno });
    try {
      const res = await fetch(`http://localhost:3000/api/rutinas/usuario/${usuarioId}`);
      const datos = await res.json();
      setRutinaAlumno(datos);
    } catch (err) {
      alert("Error al cargar la rutina del alumno.");
    } finally {
      setCargandoRutina(false);
    }
  };

  const prepararEdicion = (grupoRutina, nombreAlumno) => {
    setEsEdicion(true);
    setIdRutinaAEditar(grupoRutina.rutina_id);
    setNombreRutina(grupoRutina.nombre_rutina);
    setDiaAsignado(grupoRutina.dia_asignado);

    const ejerciciosFormateados = grupoRutina.ejercicios
      .filter(item => item.nombre_ejercicio)
      .map((item) => ({
        ejercicio_id: item.ejercicio_id,
        series: item.series,
        repeticiones: item.repeticiones
      }));

    setEjerciciosSeleccionados(ejerciciosFormateados);
    setSolicitudSeleccionada({ usuario_id: verRutinaModal.usuarioId, nombre_completo: nombreAlumno });
    setVerRutinaModal(null);
  };

  const eliminarRutinaEspecifica = async (rutinaId, tituloRutina) => {
    if (!rutinaId) {
      alert("Error: No se encontró el ID de la rutina.");
      return;
    }

    const confirmar = window.confirm(`¿Estás seguro de que deseas borrar la rutina "${tituloRutina}"?`);
    if (!confirmar) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/api/rutinas/${rutinaId}`, {
        method: "DELETE"
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (respuesta.ok) {
        alert("¡Rutina eliminada con éxito!");
        if (verRutinaModal) {
          consultarRutinaAlumno(verRutinaModal.usuarioId, verRutinaModal.nombreAlumno);
        }
        cargarDatos(instructor.id);
      } else {
        alert(datos.error || datos.mensaje || `Error ${respuesta.status}: No se pudo borrar.`);
      }
    } catch (err) {
      alert("Error de conexión al intentar borrar la rutina.");
    }
  };

  const agregarEjercicioARutina = (ejercicioId) => {
    if (!ejercicioId) return;
    const existe = ejerciciosSeleccionados.find(e => e.ejercicio_id === parseInt(ejercicioId));
    if (existe) return;

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

  const eliminarEjercicioDeRutina = (index) => {
    setEjerciciosSeleccionados(ejerciciosSeleccionados.filter((_, i) => i !== index));
  };

  const resetearFormulario = () => {
    setSolicitudSeleccionada(null);
    setEsEdicion(false);
    setIdRutinaAEditar(null);
    setNombreRutina("");
    setDiaAsignado("Lunes");
    setEjerciciosSeleccionados([]);
  };

  const guardarRutina = async (e) => {
    e.preventDefault();
    if (!solicitudSeleccionada || ejerciciosSeleccionados.length === 0) {
      alert("Selecciona al menos un ejercicio para la rutina.");
      return;
    }

    const endpoint = esEdicion
      ? `http://localhost:3000/api/rutinas/${idRutinaAEditar}`
      : "http://localhost:3000/api/rutinas";

    const metodo = esEdicion ? "PUT" : "POST";

    try {
      const respuesta = await fetch(endpoint, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: solicitudSeleccionada.usuario_id || solicitudSeleccionada.id,
          instructor_id: instructor ? instructor.id : null,
          nombre_rutina: nombreRutina,
          proposito: solicitudSeleccionada.proposito_solicitado || "Gimnasio General",
          dia_asignado: diaAsignado,
          ejercicios: ejerciciosSeleccionados
        })
      });

      if (respuesta.ok) {
        alert(esEdicion ? "¡Rutina actualizada correctamente!" : "¡Rutina asignada exitosamente!");
        resetearFormulario();
        cargarDatos(instructor.id);
      } else {
        alert("Ocurrió un error al procesar la rutina.");
      }
    } catch (err) {
      alert("Error de red al guardar la rutina.");
    }
  };

  const agruparPorRutina = (items) => {
    return items.reduce((acc, item) => {
      const id = item.rutina_id;
      if (!id) return acc;

      if (!acc[id]) {
        acc[id] = {
          rutina_id: item.rutina_id,
          nombre_rutina: item.nombre_rutina || "Rutina sin nombre",
          dia_asignado: item.dia_asignado || "Lunes",
          ejercicios: []
        };
      }

      if (item.nombre_ejercicio) {
        acc[id].ejercicios.push(item);
      }
      return acc;
    }, {});
  };

  const alumnosFiltrados = alumnos.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="instructor-container">
      {/* BOTÓN FLOTANTE IZQUIERDO PARA ABRIR MENÚ DE ALUMNOS SIN ASIGNAR */}
      <button 
        type="button"
        className="btn-flotante-izquierda"
        onClick={() => setMenuLateralAbierto(true)}
        title="Ver alumnos sin asignar"
      >
        📌 <span className="badge-contador">{alumnosLibres.length}</span>
      </button>

      {/* MENÚ LATERAL DESPLEGABLE (SIDE DRAWER) */}
      {menuLateralAbierto && (
        <div className="drawer-overlay" onClick={() => setMenuLateralAbierto(false)}>
          <div className="drawer-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="encabezado-modal">
              <h3 className="subtitulo-formulario" style={{ margin: 0 }}>
                📌 Sin Asignar ({alumnosLibres.length})
              </h3>
              <button 
                type="button" 
                className="btn-cerrar-modal" 
                onClick={() => setMenuLateralAbierto(false)}
              >
                ✖
              </button>
            </div>

            <div className="alumnos-list" style={{ marginTop: "15px" }}>
              {alumnosLibres.length === 0 ? (
                <p className="texto-vacio">No hay alumnos libres en este momento.</p>
              ) : (
                alumnosLibres.map((solicitud) => {
                  const idAlumno = solicitud.usuario_id || solicitud.id;
                  return (
                    <div key={idAlumno} className="alumno-card-mini">
                      <div className="alumno-info">
                        <h4 className="alumno-nombre" style={{ fontSize: "16px" }}>{solicitud.nombre_completo}</h4>
                        <p className="alumno-rutina"><strong>Objetivo:</strong> {solicitud.proposito_solicitado || solicitud.objetivo}</p>
                        {solicitud.ejercicios_no_aptos && (
                          <p className="alumno-limitacion">⚠️ {solicitud.ejercicios_no_aptos}</p>
                        )}
                      </div>
                      <button 
                        className="btn-ver-rutina"
                        style={{ width: "100%", marginTop: "8px" }}
                        onClick={() => tomarAlumno(idAlumno)}
                      >
                        🤝 Tomar Alumno
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <div className="instructor-content">
        <header className="header-card">
          <h1 className="header-title">Panel del Instructor</h1>
          <p className="header-subtitle">
            {instructor ? `Bienvenido/a, ${instructor.nombre_completo}` : "Gestión de alumnos y rutinas"}
          </p>
        </header>
        <section className="metrics-grid">
          <div className="metric-card">
            <span className="metric-number">15</span>
            <span className="metric-label">Alumnos Activos</span>
          </div>
          <div className="metric-card">
            <span className="metric-number">7</span>
            <span className="metric-label">Rutinas Hoy</span>
          </div>
          <div className="metric-card">
            <span className="metric-number">3</span>
            <span className="metric-label">Pendientes</span>
          </div>
        </section>

        <main>
          {cargando && <p className="texto-secundario">Cargando datos...</p>}
          {error && <p className="mensaje-error">{error}</p>}

          {/* VISTA PRINCIPAL: MIS ALUMNOS ASIGNADOS */}
          <h2 className="section-title">🏋️ Mis Alumnos Asignados</h2>
          <div className="alumnos-list">
            {misAlumnos.length === 0 ? (
              <p className="texto-vacio">Aún no has tomado ningún alumno. Toca el icono de la izquierda (📌) para ver la lista de alumnos disponibles.</p>
            ) : (
              misAlumnos.map((alumno) => {
                const idAlumno = alumno.usuario_id || alumno.id;
                return (
                  <div key={idAlumno} className="alumno-card">
                    <div className="alumno-info">
                      <h3 className="alumno-nombre">{alumno.nombre_completo}</h3>
                      <p className="alumno-rutina"><strong>Objetivo:</strong> {alumno.proposito_solicitado || alumno.objetivo}</p>
                      {alumno.ejercicios_no_aptos && (
                        <p className="alumno-limitacion">⚠️ Limitación: {alumno.ejercicios_no_aptos}</p>
                      )}
                    </div>
                    <div className="contenedor-botones-card">
                      <button 
                        className="btn-secundario"
                        onClick={() => consultarRutinaAlumno(idAlumno, alumno.nombre_completo)}
                      >
                        👁️ Ver Rutinas
                      </button>
                      <button 
                        className="btn-ver-rutina"
                        onClick={() => {
                          resetearFormulario();
                          setSolicitudSeleccionada({ ...alumno, usuario_id: idAlumno });
                          setNombreRutina(`Rutina de ${alumno.nombre_completo}`);
                          setVerRutinaModal(null);
                        }}
                      >
                        ➕ Armar Rutina
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* MODAL / VENTANA EMERGENTE: ARMAR O EDITAR RUTINA */}
          {solicitudSeleccionada && (
            <div className="modal-overlay" onClick={resetearFormulario}>
              <div className="tarjeta-formulario modal-contenido" onClick={(e) => e.stopPropagation()}>
                <div className="encabezado-modal">
                  <h3 className="subtitulo-formulario">
                    {esEdicion ? `✏️ Editar Rutina de: ${solicitudSeleccionada.nombre_completo}` : `➕ Armar Rutina para: ${solicitudSeleccionada.nombre_completo}`}
                  </h3>
                  <button type="button" className="btn-cerrar-modal" onClick={resetearFormulario}>✖</button>
                </div>
                
                <form onSubmit={guardarRutina} className="formulario-rutina">
                  <div className="campo-grupo">
                    <label className="etiqueta-input">Nombre de la Rutina</label>
                    <input 
                      type="text" 
                      className="input-estilizado"
                      value={nombreRutina} 
                      onChange={(e) => setNombreRutina(e.target.value)}
                      required
                    />
                  </div>

                  <div className="campo-grupo">
                    <label className="etiqueta-input">Día Asignado</label>
                    <select 
                      className="select-estilizado"
                      value={diaAsignado} 
                      onChange={(e) => setDiaAsignado(e.target.value)}
                    >
                      <option value="Lunes">Lunes</option>
                      <option value="Martes">Martes</option>
                      <option value="Miercoles">Miércoles</option>
                      <option value="Jueves">Jueves</option>
                      <option value="Viernes">Viernes</option>
                      <option value="Sabado">Sábado</option>
                      <option value="Domingo">Domingo</option>
                    </select>
                  </div>

                  <div className="campo-grupo">
                    <label className="etiqueta-input">Agregar Ejercicio</label>
                    <select 
                      className="select-estilizado"
                      onChange={(e) => {
                        agregarEjercicioARutina(e.target.value);
                        e.target.value = "";
                      }}
                    >
                      <option value="">-- Selecciona un ejercicio --</option>
                      {ejerciciosDisponibles.map((ej) => (
                        <option key={ej.id} value={ej.id}>{ej.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="contenedor-ejercicios-rutina">
                    <h4 className="etiqueta-input">Ejercicios Seleccionados</h4>
                    {ejerciciosSeleccionados.length === 0 && (
                      <p className="texto-vacio">Agrega ejercicios a esta rutina.</p>
                    )}

                    {ejerciciosSeleccionados.map((item, index) => {
                      const det = ejerciciosDisponibles.find(e => e.id === item.ejercicio_id);
                      return (
                        <div key={index} className="fila-ejercicio-item">
                          <span className="nombre-ejercicio-item">{det?.nombre || `Ejercicio #${item.ejercicio_id}`}</span>
                          
                          <div className="control-series-reps">
                            <div className="campo-mini">
                              <label>Series</label>
                              <input 
                                type="number" 
                                className="input-mini"
                                value={item.series} 
                                onChange={(e) => actualizarDetalleEjercicio(index, "series", e.target.value)}
                              />
                            </div>

                            <div className="campo-mini">
                              <label>Reps</label>
                              <input 
                                type="text" 
                                className="input-mini"
                                value={item.repeticiones} 
                                onChange={(e) => actualizarDetalleEjercicio(index, "repeticiones", e.target.value)}
                              />
                            </div>

                            <button 
                              type="button" 
                              className="btn-eliminar-item"
                              onClick={() => eliminarEjercicioDeRutina(index)}
                            >
                              ✖
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="acciones-formulario">
                    <button type="submit" className="btn-ver-rutina">
                      {esEdicion ? "Guardar Cambios" : "Guardar y Asignar"}
                    </button>
                    <button 
                      type="button" 
                      className="btn-cancelar"
                      onClick={resetearFormulario}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL / VENTANA EMERGENTE: VER RUTINAS */}
          {verRutinaModal && (
            <div className="modal-overlay" onClick={() => setVerRutinaModal(null)}>
              <div className="tarjeta-formulario modal-contenido" onClick={(e) => e.stopPropagation()}>
                <div className="encabezado-modal">
                  <h3 className="subtitulo-formulario">Rutinas de {verRutinaModal.nombreAlumno}</h3>
                  <button className="btn-cerrar-modal" onClick={() => setVerRutinaModal(null)}>✖</button>
                </div>

                {cargandoRutina && <p className="texto-secundario">Cargando rutinas...</p>}

                {!cargandoRutina && rutinaAlumno.length === 0 && (
                  <p className="texto-vacio">Este alumno aún no tiene rutinas asignadas.</p>
                )}

                {!cargandoRutina && rutinaAlumno.length > 0 && (
                  <div className="vista-rutina-agrupada">
                    {Object.values(agruparPorRutina(rutinaAlumno)).map((grupo) => (
                      <div key={grupo.rutina_id} className="bloque-musculo-dia" style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <h4 className="titulo-bloque-dia" style={{ margin: 0 }}>
                            📋 {grupo.nombre_rutina} — 📅 Día: {grupo.dia_asignado}
                          </h4>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button 
                              className="btn-editar-rutina"
                              onClick={() => prepararEdicion(grupo, verRutinaModal.nombreAlumno)}
                            >
                              ✏ Editar
                            </button>
                            <button 
                              className="btn-borrar-rutina"
                              onClick={() => eliminarRutinaEspecifica(grupo.rutina_id, grupo.nombre_rutina)}
                            >
                              🗑️ Borrar
                            </button>
                          </div>
                        </div>

                        <div className="lista-ejercicios-vista">
                          {grupo.ejercicios.map((ej, idx) => (
                            <div key={idx} className="tarjeta-ejercicio-vista">
                              <div>
                                <p className="ejercicio-nombre-vista">{ej.nombre_ejercicio}</p>
                                {ej.descripcion && <p className="ejercicio-desc-vista">{ej.descripcion}</p>}
                              </div>
                              <div className="badge-series-reps">
                                <span>{ej.series} Series</span>
                                <span>•</span>
                                <span>{ej.repeticiones} Reps</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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