import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/login.css";

function CrearCuenta() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metaId, setMetaId] = useState(1);
  const [metas, setMetas] = useState([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Cargar metas al montar el componente
    fetch("http://localhost:3000/api/metas")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMetas(data);
          setMetaId(data[0].id);
        }
      })
      .catch(() => {
        // Fallback si la API aún no tiene el endpoint
        setMetas([
          { id: 1, nombre: "Ganar Músculo", icono: "🏋️" },
          { id: 2, nombre: "Perder Peso", icono: "🔥" },
          { id: 3, nombre: "Resistencia / Cardio", icono: "🏃‍♂️" },
          { id: 4, nombre: "Mantenimiento", icono: "🧘" }
        ]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:3000/api/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_completo: nombre,
          email,
          telefono,
          meta_id: metaId,
          password,
          rol: "cliente",
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || "Ocurrió un error al registrar la cuenta.");
        setCargando(false);
        return;
      }

      alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
      navigate("/login");
    } catch (err) {
      setError("No se pudo conectar con el servidor. Verifica que esté encendido.");
      setCargando(false);
    }
  };

  return (
    <div className="contenedor-login">
      <div className="tarjeta-login">
        <h1 className="titulo-login">Crear Cuenta</h1>

        {error && <p className="mensaje-error">{error}</p>}

        <form className="formulario-login" onSubmit={handleSubmit}>
          <div className="campo">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              placeholder="Tu nombre y apellido" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              required 
            />
          </div>

          <div className="campo">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="correo@ejemplo.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input 
              type="tel" 
              placeholder="1122334455" 
              value={telefono} 
              onChange={(e) => setTelefono(e.target.value)} 
            />
          </div>

          <div className="campo">
            <label>Meta de Entrenamiento</label>
            <select 
              value={metaId} 
              onChange={(e) => setMetaId(Number(e.target.value))}
              className="campo-input"
            >
              {metas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.icono || "🎯"} {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="boton-ingresar" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="seccion-registro">
          <p>¿Ya tienes una cuenta?</p>
          <button 
            type="button" 
            className="boton-crear-cuenta"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default CrearCuenta;