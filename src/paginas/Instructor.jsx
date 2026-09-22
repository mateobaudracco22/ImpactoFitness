import React from "react";
import "../estilos/instructor.css";

function Instructor() {
  // Lista con los datos que se muestran en la pantalla
  const alumnos = [
    {
      id: 1,
      nombre: "Carlos Gómez",
      rutina: "Fuerza - Pecho y Tríceps",
    },
    {
      id: 2,
      nombre: "Ana Martínez",
      rutina: "Cardio e Hipertrofia",
    },
    {
      id: 3,
      nombre: "Lucas Rivas",
      rutina: "Adaptación Física",
    },
  ];

  return (
    <div className="instructor-container">
      <div className="instructor-content">
        {/* Encabezado Principal */}
        <header className="header-card">
          <h1 className="header-title">Panel del Instructor</h1>
          <p className="header-subtitle">
            Gestión de alumnos y rutinas de Impacto Fitness
          </p>
        </header>

        {/* Sección Alumnos Asignados */}
        <main>
          <h2 className="section-title">Alumnos Asignados</h2>

          <div className="alumnos-list">
            {alumnos.map((alumno) => (
              <div key={alumno.id} className="alumno-card">
                <div className="alumno-info">
                  <h3 className="alumno-nombre">{alumno.nombre}</h3>
                  <p className="alumno-rutina">{alumno.rutina}</p>
                </div>
                <button className="btn-ver-rutina">Ver Rutina</button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Instructor;