import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/formulario.css";

function SolicitarRutina() {
  const [usuario, setUsuario] = useState(null);
  const [formulario, setFormulario] = useState({
    meta_id: "",
    nivel: "",
    dias_por_semana: "",
    observaciones: ""
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Al abrir la página: leer el usuario guardado en el navegador
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

  // Guarda lo que el usuario escribe o elige en cada campo
  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  // Se ejecuta al apretar "Enviar solicitud"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!formulario.meta_id || !formulario.nivel || !formulario.dias_por_semana) {
      setError("Completa la meta, el nivel y los días por semana.");
      return;
    }

    setEnviando(true);

    try {
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

      if (respuesta.ok) {
        setMensaje("¡Solicitud enviada! Tu instructor la revisará y armará tu rutina.");
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
      setError("Error de red al enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="solicitar">
      <header className="solicitar-header">
        <h1>Solicitar rutina</h1>
        <button className="solicitar-btn-volver" onClick={() => navigate("/usuarios")}>
          Volver al Menú
        </button>
      </header>

      <main className="solicitar-contenedor">
        <form className="solicitar-form" onSubmit={handleSubmit}>
          <p className="solicitar-intro">
            Completa el formulario y tu instructor armará una rutina para ti.
          </p>

          {mensaje && <p className="solicitar-exito">{mensaje}</p>}
          {error && <p className="solicitar-error">{error}</p>}

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

          <button className="solicitar-btn-enviar" type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default SolicitarRutina;