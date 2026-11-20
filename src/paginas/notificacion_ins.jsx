
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/notificacion.css";

function Notificacion_Ins() {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [instructor, setInstructor] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      const profe = JSON.parse(usuarioGuardado);
      setInstructor(profe);
      cargarSolicitudes();
    } else {
      navigate("/");
    }
  }, []);

  // Cargar solicitudes pendientes desde la base de datos
  const cargarSolicitudes = async () => {
    try {
      setCargando(true);

      const res = await fetch(
        "http://localhost:3000/api/solicitudes"
      );

      if (!res.ok) {
        throw new Error("No se pudieron cargar las solicitudes");
      }

      const datos = await res.json();

      setSolicitudes(Array.isArray(datos) ? datos : []);

    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      alert("Error al cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  };

  // Aceptar solicitud y asignar alumno al instructor
  const aceptarSolicitud = async (solicitud) => {
    if (!instructor) return;

    const confirmar = window.confirm(
      `¿Deseas aceptar la solicitud de ${solicitud.nombre_completo}?`
    );

    if (!confirmar) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/alumnos/${solicitud.usuario_id}/asignar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            instructor_id: instructor.id,
            solicitud_id: solicitud.id
          })
        }
      );

      if (!res.ok) {
        throw new Error("No se pudo aceptar la solicitud");
      }

      alert("¡Solicitud aceptada correctamente!");

      // Actualizar la lista
      cargarSolicitudes();

    } catch (error) {
      console.error("Error al aceptar:", error);
      alert("No se pudo aceptar la solicitud.");
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaValida = new Date(fecha);

    if (isNaN(fechaValida.getTime())) return "Sin fecha";

    return fechaValida.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="notificaciones-container">

      {/* ENCABEZADO */}
      <header className="notificaciones-header">

        <button
          className="btn-volver"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <div className="titulo-notificaciones">
          <h1>Solicitudes de alumnos</h1>

          <p>
            Panel de solicitudes del instructor
          </p>
        </div>

        <div className="contador-solicitudes">
          <span>{solicitudes.length}</span>
          <p>Pendientes</p>
        </div>

      </header>

      {/* CONTENIDO */}
      <main className="notificaciones-contenido">

        <div className="encabezado-solicitudes">

          <div>
            <h2>📩 Solicitudes recibidas</h2>
            <p>
              Revisá los datos y objetivos de los alumnos.
            </p>
          </div>

          <button
            className="btn-actualizar"
            onClick={cargarSolicitudes}
          >
            ↻ Actualizar
          </button>

        </div>

        {cargando ? (

          <div className="sin-solicitudes">
            <h3>Cargando solicitudes...</h3>
          </div>

        ) : solicitudes.length === 0 ? (

          <div className="sin-solicitudes">
            <span>📭</span>
            <h3>No hay solicitudes pendientes</h3>
            <p>
              Cuando un alumno solicite un instructor,
              aparecerá en esta sección.
            </p>
          </div>

        ) : (

          <div className="solicitudes-grid">

            {solicitudes.map((solicitud) => (

              <div
                className="solicitud-card"
                key={solicitud.id}
              >

                <div className="solicitud-card-header">

                  <div className="solicitud-icono">
                    👤
                  </div>

                  <span className="estado-solicitud">
                    ● Pendiente
                  </span>

                </div>

                <div className="solicitud-info">

                  <h3>{solicitud.nombre_completo}</h3>

                  <div className="solicitud-meta">
                    <span>
                      {solicitud.meta_icono || "🎯"}
                    </span>

                    <strong>
                      {solicitud.meta_nombre || "Objetivo general"}
                    </strong>
                  </div>

                </div>

                {/* DATOS DE LA SOLICITUD */}
                <div className="datos-solicitud">

                  <div className="dato-solicitud">
                    <span>📊 Nivel</span>
                    <strong>
                      {solicitud.nivel || "No especificado"}
                    </strong>
                  </div>

                  <div className="dato-solicitud">
                    <span>📅 Días por semana</span>
                    <strong>
                      {solicitud.dias_por_semana || "No especificado"}
                    </strong>
                  </div>

                  <div className="dato-solicitud dato-observaciones">
                    <span>📝 Observaciones</span>
                    <p>
                      {solicitud.observaciones ||
                        "El alumno no agregó observaciones."}
                    </p>
                  </div>

                  <div className="dato-solicitud">
                    <span>🕒 Fecha de solicitud</span>
                    <strong>
                      {formatearFecha(solicitud.fecha)}
                    </strong>
                  </div>

                </div>

                {/* BOTÓN ACEPTAR */}
                <button
                  className="btn-aceptar-solicitud"
                  onClick={() => aceptarSolicitud(solicitud)}
                >
                  ✓ Aceptar solicitud
                </button>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Notificacion_Ins;