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