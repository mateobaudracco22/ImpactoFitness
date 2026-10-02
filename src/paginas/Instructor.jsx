import React, { useState, useEffect } from "react";
import "../estilos/instructor.css";

function Instructor() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estado para controlar el alumno seleccionado y el formulario de la rutina
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [nombreRutina, setNombreRutina] = useState("");
  const [diaAsignado, setDiaAsignado] = useState("Lunes");
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar solicitudes pendientes y catálogo de ejercicios
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

  const guardarRutina = async (e) => {
    e.preventDefault();
    if (!solicitudSeleccionada || ejerciciosSeleccionados.length === 0) {
      alert("Selecciona al menos un ejercicio para la rutina.");
      return;
    }

    try {
      const respuesta = await fetch("http://localhost:3000/api/rutinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: solicitudSeleccionada.usuario_id,
          instructor_id: 2, // ID de profesor creado en el SQL
          nombre_rutina: nombreRutina,
          proposito: solicitudSeleccionada.proposito_solicitado,
          dia_asignado: diaAsignado,
          ejercicios: ejerciciosSeleccionados
        })
      });

      if (respuesta.ok) {
        alert("¡Rutina asignada exitosamente al alumno!");
        setSolicitudSeleccionada(null);
        setEjerciciosSeleccionados([]);
        setNombreRutina("");
        cargarDatos(); // Recargar listado
      }
    } catch (err) {
      alert("Error al guardar la rutina.");
    }
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

          {cargando && <p style={{ color: "#b0b0b0" }}>Cargando datos...</p>}
          {error && <p className="mensaje-error">{error}</p>}

          <div className="alumnos-list">
            {solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="alumno-card">
                <div className="alumno-info">
                  <h3 className="alumno-nombre">{solicitud.nombre_completo}</h3>
                  <p className="alumno-rutina"><strong>Objetivo:</strong> {solicitud.proposito_solicitado}</p>
                  {solicitud.ejercicios_no_aptos && (
                    <p className="alumno-rutina" style={{ color: "#FFB74D" }}>
                      ⚠️ Limitación: {solicitud.ejercicios_no_aptos}
                    </p>
                  )}
                </div>
                <button 
                  className="btn-ver-rutina"
                  onClick={() => {
                    setSolicitudSeleccionada(solicitud);
                    setNombreRutina(`Rutina de ${solicitud.nombre_completo}`);
                  }}
                >
                  Asignar Rutina
                </button>
              </div>
            ))}
          </div>

          {/* Formulario/Modal desplegable para armar la rutina */}
          {solicitudSeleccionada && (
            <div className="header-card" style={{ marginTop: "30px", textAlign: "left" }}>
              <h3 style={{ color: "#FFB74D" }}>Armar Rutina para: {solicitudSeleccionada.nombre_completo}</h3>
              
              <form onSubmit={guardarRutina} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
                <div>
                  <label style={{ color: "#FFB74D", display: "block", marginBottom: "5px" }}>Nombre de la Rutina</label>
                  <input 
                    type="text" 
                    value={nombreRutina} 
                    onChange={(e) => setNombreRutina(e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #3A3A3A", backgroundColor: "#121212", color: "#FFF" }}
                  />
                </div>

                <div>
                  <label style={{ color: "#FFB74D", display: "block", marginBottom: "5px" }}>Día Asignado</label>
                  <select 
                    value={diaAsignado} 
                    onChange={(e) => setDiaAsignado(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #3A3A3A", backgroundColor: "#121212", color: "#FFF" }}
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

                <div>
                  <label style={{ color: "#FFB74D", display: "block", marginBottom: "5px" }}>Agregar Ejercicio</label>
                  <select 
                    onChange={(e) => {
                      agregarEjercicioARutina(e.target.value);
                      e.target.value = "";
                    }}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #3A3A3A", backgroundColor: "#121212", color: "#FFF" }}
                  >
                    <option value="">-- Selecciona un ejercicio --</option>
                    {ejerciciosDisponibles.map((ej) => (
                      <option key={ej.id} value={ej.id}>{ej.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Lista de ejercicios agregados a la rutina actual */}
                {ejerciciosSeleccionados.map((item, index) => {
                  const det = ejerciciosDisponibles.find(e => e.id === item.ejercicio_id);
                  return (
                    <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", backgroundColor: "#121212", padding: "10px", borderRadius: "6px" }}>
                      <span style={{ flex: 1, color: "#FFF" }}>{det?.nombre}</span>
                      <input 
                        type="number" 
                        value={item.series} 
                        onChange={(e) => actualizarDetalleEjercicio(index, "series", e.target.value)}
                        placeholder="Series"
                        style={{ width: "60px", padding: "5px" }}
                      />
                      <input 
                        type="text" 
                        value={item.repeticiones} 
                        onChange={(e) => actualizarDetalleEjercicio(index, "repeticiones", e.target.value)}
                        placeholder="Reps"
                        style={{ width: "80px", padding: "5px" }}
                      />
                    </div>
                  );
                })}

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="submit" className="btn-ver-rutina">Guardar y Asignar</button>
                  <button 
                    type="button" 
                    onClick={() => setSolicitudSeleccionada(null)}
                    style={{ padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#555", color: "#FFF", cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Instructor;