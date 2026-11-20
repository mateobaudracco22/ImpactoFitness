// ===== IMPORTS =====
// useState guarda datos que cambian; useEffect ejecuta código al abrir la página
import React, { useState, useEffect } from "react";
// useNavigate permite cambiar de página desde el código
import { useNavigate } from "react-router-dom";
// Estilos de esta página
import "../estilos/Solicitud_Rutina.css";

function SolicitarRutina() {
  // ===== ESTADOS =====
  // Usuario con sesión iniciada (se lee del localStorage)
  const [usuario, setUsuario] = useState(null);

  // Guarda lo que el usuario completa en el formulario (un campo por dato)
  const [formulario, setFormulario] = useState({
    meta_id: "",
    nivel: "",
    dias_por_semana: "",
    observaciones: ""
  });

  // Controlan el botón de envío y los mensajes que se muestran en pantalla
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ===== AL ABRIR LA PÁGINA =====
  // Lee el usuario guardado en el navegador; si no hay sesión, vuelve al inicio
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuario(user);
      // Si el usuario ya tiene una meta, la dejamos elegida
      setFormulario((anterior) => ({ ...anterior, meta_id: user.meta_id || "" }));
    } else {
      navigate("/");
    }
  }, [navigate]);

  // ===== FUNCIÓN: guardar lo que se escribe =====
  // Se ejecuta en cada cambio de un campo. Usa el atributo "name" del campo
  // para saber cuál propiedad del formulario actualizar.
  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  // ===== FUNCIÓN: enviar la solicitud =====
  // Se ejecuta al apretar "Enviar solicitud"
  const handleSubmit = async (e) => {
    e.preventDefault(); // evita que el formulario recargue la página
    setMensaje("");
    setError("");

    // 1) Validación: los tres campos obligatorios deben estar completos
    if (!formulario.meta_id || !formulario.nivel || !formulario.dias_por_semana) {
      setError("Completa la meta, el nivel y los días por semana.");
      return;
    }

    setEnviando(true);

    try {
      // 2) Envía los datos al servidor (que los guarda en la base de datos)
      const respuesta = await fetch("http://localhost:3000/api/solicitudes-rutina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          meta_id: Number(formulario.meta_id),
          nivel: formulario.nivel,
          dias_por_semana: Number(formulario.dias_por_semana),
          observaciones: formulario.observaciones
        })
      });

      // 3) Según la respuesta del servidor, muestra éxito o error
      if (respuesta.ok) {
        setMensaje("¡Solicitud enviada! Tu instructor la revisará y armará tu rutina.");
        // Limpia el formulario para poder enviar otra solicitud
        setFormulario({
          meta_id: usuario.meta_id || "",
          nivel: "",
          dias_por_semana: "",
          observaciones: ""
        });
      } else {
        setError("No se pudo enviar la solicitud. Inténtalo de nuevo.");
      }
    } catch (err) {
      // Se ejecuta si no hay conexión con el servidor
      setError("Error de red al enviar la solicitud.");
    } finally {
      // Siempre se ejecuta: vuelve a habilitar el botón
      setEnviando(false);
    }
  };

  // ===== ESTRUCTURA DE LA PÁGINA =====
  return (
    <div className="solicitar">
      {/* Encabezado con el título y el botón para volver al menú */}
      <header className="solicitar-header">
        <h1>Solicitar rutina</h1>
        <button className="solicitar-btn-volver" onClick={() => navigate("/usuarios")}>
          Volver al Menú
        </button>
      </header>

      <main className="solicitar-contenedor">
        {/* Formulario: al enviarlo se ejecuta handleSubmit */}
        <form className="solicitar-form" onSubmit={handleSubmit}>
          <p className="solicitar-intro">
            Completa el formulario y tu instructor armará una rutina para ti.
          </p>

          {/* Mensajes: solo se muestran si tienen texto */}
          {mensaje && <p className="solicitar-exito">{mensaje}</p>}
          {error && <p className="solicitar-error">{error}</p>}

          {/* Cada campo está conectado al estado: value muestra el dato guardado
              y onChange lo actualiza con handleChange */}
          <label htmlFor="meta_id">Meta de entrenamiento</label>
          <select
            id="meta_id"
            name="meta_id"
            value={formulario.meta_id}
            onChange={handleChange}
          >
            <option value="">Selecciona una meta</option>
            <option value="1">Ganar Músculo</option>
            <option value="2">Perder Peso</option>
            <option value="3">Resistencia / Cardio</option>
            <option value="4">Mantenimiento</option>
          </select>

          <label htmlFor="nivel">Nivel de experiencia</label>
          <select
            id="nivel"
            name="nivel"
            value={formulario.nivel}
            onChange={handleChange}
          >
            <option value="">Selecciona tu nivel</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>

          <label htmlFor="dias_por_semana">Días por semana</label>
          <select
            id="dias_por_semana"
            name="dias_por_semana"
            value={formulario.dias_por_semana}
            onChange={handleChange}
          >
            <option value="">Selecciona cuántos días</option>
            <option value="2">2 días</option>
            <option value="3">3 días</option>
            <option value="4">4 días</option>
            <option value="5">5 días</option>
            <option value="6">6 días</option>
          </select>

          <label htmlFor="observaciones">Observaciones (opcional)</label>
          <textarea
            id="observaciones"
            name="observaciones"
            placeholder="Lesiones, ejercicios que prefieres, horarios, etc."
            value={formulario.observaciones}
            onChange={handleChange}
          />

          {/* Botón de envío: se desactiva y cambia el texto mientras se envía */}
          <button className="solicitar-btn-enviar" type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      </main>
    </div>
  );
}

// Permite importar este componente desde App.jsx
export default SolicitarRutina;