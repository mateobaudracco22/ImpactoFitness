import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/Instructor.css";

function Instructor() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const alumnos = [
    { id: 1, nombre: "Carlos Gómez", enfoque: "Fuerza - Pecho y Tríceps", categoria: "fuerza", estado: "Al día" },
    { id: 2, nombre: "Ana Martínez", enfoque: "Cardio e Hipertrofia", categoria: "cardio", estado: "Pendiente" },
    { id: 3, nombre: "Lucas Rivas", enfoque: "Adaptación Física / Funcional", categoria: "funcional", estado: "Al día" },
  ];

  const alumnosFiltrados = alumnos.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="instructor-container">
      <div className="instructor-content">
        {/* Encabezado */}
        <header className="header-card">
          <h1 className="header-title">Panel del Instructor</h1>
          <p className="header-subtitle">Gestión de alumnos y rutinas de Impacto Fitness</p>
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

        {/* Lista de Alumnos */}
        <main>
          <div className="section-header">
            <h2 className="section-title">Alumnos Asignados</h2>
            <input
              type="text"
              placeholder="Buscar alumno..."
              className="search-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          