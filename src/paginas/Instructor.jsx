import React, { useState, useEffect } from "react";
import "../estilos/instructor.css";

function Instructor() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estado para armar/asignar/editar rutina
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [esEdicion, setEsEdicion] = useState(false);
  const [idRutinaAEditar, setIdRutinaAEditar] = useState(null);
  
  const [nombreRutina, setNombreRutina] = useState("");
  const [diaAsignado, setDiaAsignado] = useState("Lunes");
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);

  // Estado para el modal/sección de "Ver Rutina"
  const [verRutinaModal, setVerRutinaModal] = useState(null);
  const [rutinaAlumno, setRutinaAlumno] = useState([]);
  const [cargandoRutina, setCargandoRutina] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resSolicitudes, resEjercicios] = await Promise.all([
        fetch("http://localhost:3000/api/solicitudes"),
        fetch("http://localhost:3000/api/ejercicios")
      ]);

      const datosSolicitudes = await resSolicitudes.json();
      const datosEjercicios = await resEjercicios.json();

      setSolicitudes(datosSolicitudes);
      setEjerciciosDisponibles(datosEjercicios);
    } catch (err) {
      setError("Error al conectar con el servidor backend.");
    } finally {
      setCargando(false);
    }
  };

  // Obtener la rutina actual del alumno
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

  // Cargar datos de la rutina en el formulario para editar
  const prepararEdicion = async (usuarioId, nombreAlumno) => {
    try {
      const res = await fetch(`http://localhost:3000/api/rutinas/usuario/${usuarioId}`);
      const datos = await res.json();

      if (!datos || datos.length === 0) {
        alert("Este alumno aún no tiene una rutina asignada para editar.");
        return;
      }

      const primeraFila = datos[0];
      setEsEdicion(true);
      setIdRutinaAEditar(primeraFila.rutina_id || primeraFila.id);
      setNombreRutina(primeraFila.nombre_rutina || `Rutina de ${nombreAlumno}`);
      setDiaAsignado(primeraFila.dia_asignado || "Lunes");

      // Mapear los ejercicios recibidos para el estado del formulario
      const ejerciciosFormateados = datos.map((item) => ({
        ejercicio_id: item.ejercicio_id,
        series: item.series,
        repeticiones: item.repeticiones
      }));

      setEjerciciosSeleccionados(ejerciciosFormateados);
      setSolicitudSeleccionada({ usuario_id: usuarioId, nombre_completo: nombreAlumno });
      setVerRutinaModal(null);
    } catch (err) {
      alert("Error al preparar la edición de la rutina.");
    }
  };

  // Borrar rutina asignada
  const eliminarRutina = async (usuarioId, nombreAlumno) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas borrar la rutina asignada a ${nombreAlumno}?`
    );
    if (!confirmar) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/api/rutinas/usuario/${usuarioId}`, {
        method: "DELETE"
      });

      if (respuesta.ok) {
        alert("¡Rutina eliminada con éxito!");
        setVerRutinaModal(null);
        setRutinaAlumno([]);
        cargarDatos();
      } else {
        alert("No se pudo eliminar la rutina.");
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
          usuario_id: solicitudSeleccionada.usuario_id,
          instructor_id: 2,
          nombre_rutina: nombreRutina,
          proposito: solicitudSeleccionada.proposito_solicitado || "Gimnasio General",
          dia_asignado: diaAsignado,
          ejercicios: ejerciciosSeleccionados
        })
      });

      if (respuesta.ok) {
        alert(esEdicion ? "¡Rutina actualizada correctamente!" : "¡Rutina asignada exitosamente!");
        resetearFormulario();
        cargarDatos();
      } else {
        alert("Ocurrió un error al procesar la rutina.");
      }
    } catch (err) {
      alert("Error de red al guardar la rutina.");
    }
  };

  const agruparPorDiaOMusculo = (items) => {
    return items.reduce((acc, item) => {
      const clave = item.dia_asignado || "General";
      if (!acc[clave]) acc[clave] = [];
      acc[clave].push(item);
      return acc;
    }, {});
  };

  return (
    <div className="instructor-container">
      <div className="instructor-content">
        <header className="header-card">
          <h1 className="header-title">Panel del Instructor</h1>
          <p className="header-subtitle">Gestión de alumnos y asignación de rutinas</p>
        </header>

        <main>
          <h2 className="section-title">Solicitudes Pendientes</h2>

          {cargando && <p className="texto-secundario">Cargando datos...</p>}
          {error && <p className="mensaje-error">{error}</p>}

          <div className="alumnos-list">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="alumno-card">
                <div className="alumno-info">
                  <h3 className="alumno-nombre">{solicitud.nombre_completo}</h3>
                  <p className="alumno-rutina"><strong>Objetivo:</strong> {solicitud.proposito_solicitado}</p>
                  {solicitud.ejercicios_no_aptos && (
                    <p className="alumno-limitacion">
                      ⚠️ Limitación: {solicitud.ejercicios_no_aptos}
                    </p>
                  )}
                </div>

                <div className="contenedor-botones-card">
                  <button 
                    className="btn-secundario"
                    onClick={() => consultarRutinaAlumno(solicitud.usuario_id, solicitud.nombre_completo)}
                  >
                    Ver Rutina
                  </button>

                  <button 
                    className="btn-ver-rutina"
                    onClick={() => {
                      resetearFormulario();
                      setSolicitudSeleccionada(solicitud);
                      setNombreRutina(`Rutina de ${solicitud.nombre_completo}`);
                      setVerRutinaModal(null);
                    }}
                  >
                    Asignar Rutina
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario para Armar/Editar Rutina */}
          {solicitudSeleccionada && (
            <div className="tarjeta-formulario">
              <h3 className="subtitulo-formulario">
                {esEdicion ? `✏️ Editar Rutina de: ${solicitudSeleccionada.nombre_completo}` : `➕ Armar Rutina para: ${solicitudSeleccionada.nombre_completo}`}
              </h3>
              
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
                  <label className="etiqueta-input">Agregar Ejercicio al Listado</label>
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

                {/* Lista de Ejercicios */}
                <div className="contenedor-ejercicios-rutina">
                  <h4 className="etiqueta-input">Ejercicios Seleccionados</h4>
                  {ejerciciosSeleccionados.length === 0 && (
                    <p className="texto-vacio">Aún no has agregado ejercicios a esta rutina.</p>
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
                            <label>Reps / Vueltas</label>
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
          )}

          {/* Modal / Sección "Ver Rutina del Alumno" */}
          {verRutinaModal && (
            <div className="tarjeta-formulario modal-ver-rutina">
              <div className="encabezado-modal">
                <h3 className="subtitulo-formulario">Rutina Actual de {verRutinaModal.nombreAlumno}</h3>
                <button className="btn-cerrar-modal" onClick={() => setVerRutinaModal(null)}>✖</button>
              </div>

              {cargandoRutina && <p className="texto-secundario">Cargando ejercicios...</p>}

              {!cargandoRutina && rutinaAlumno.length === 0 && (
                <p className="texto-vacio">Este alumno aún no tiene una rutina asignada.</p>
              )}

              {!cargandoRutina && rutinaAlumno.length > 0 && (
                <>
                  <div className="barras-acciones-rutina">
                    <button 
                      className="btn-editar-rutina"
                      onClick={() => prepararEdicion(verRutinaModal.usuarioId, verRutinaModal.nombreAlumno)}
                    >
                      ✏️ Editar Rutina
                    </button>
                    <button 
                      className="btn-borrar-rutina"
                      onClick={() => eliminarRutina(verRutinaModal.usuarioId, verRutinaModal.nombreAlumno)}
                    >
                      🗑️ Borrar Rutina
                    </button>
                  </div>

                  <div className="vista-rutina-agrupada">
                    {Object.entries(agruparPorDiaOMusculo(rutinaAlumno)).map(([dia, ejercicios]) => (
                      <div key={dia} className="bloque-musculo-dia">
                        <h4 className="titulo-bloque-dia">📅 Día / Categoría: {dia}</h4>
                        <div className="lista-ejercicios-vista">
                          {ejercicios.map((ej, idx) => (
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
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Instructor;