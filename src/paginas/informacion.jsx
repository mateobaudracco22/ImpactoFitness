import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/informacion.css";

function Info() {
    const [usuario, setUsuario] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        }
    }, []);

    const handleCerrarSesion = () => {
        localStorage.removeItem("usuario");
        setUsuario(null);
        navigate("/");
    };

    const volverAlMenu = () => {
        if (usuario?.rol === "instructor") {
            navigate("/instructor");
        } else {
            navigate("/usuarios");
        }
    };

    return (
        <div className="info">
            <header className="info-header">
                <div className="header-titulos">
                    <h1>Información sobre este gimnasio</h1>
                    <h2>Impacto-Fitness</h2>
                </div>
                <div className="header-acciones">
                    {usuario ? (
                        <>
                            <button className="btn-accion btn-menu" onClick={volverAlMenu}>
                                Volver al Menú
                            </button>
                            <button className="btn-accion btn-salir" onClick={handleCerrarSesion}>
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <button className="btn-accion btn-login" onClick={() => navigate("/login")}>
                            Iniciar Sesión
                        </button>
                    )}
                </div>
            </header>

            <main className="contenedor">
                <div className="caja">
                    <h2>¿Quiénes somos?</h2>
                    <p>
                        En Impacto-Fitness buscamos facilitar la tarea de entrenar
                        y ayudar a nuestros usuarios a organizar sus actividades
                        de una manera sencilla y rápida.
                    </p>
                </div>

                <div className="caja">
                    <h2>¿Qué ofrecemos?</h2>
                    <p>
                        Nuestra plataforma permite acceder a diferentes servicios
                        relacionados con el entrenamiento y la actividad física.
                    </p>
                    <ul>
                        <li>Reserva de turnos</li>
                        <li>Rutinas de entrenamiento</li>
                        <li>Ejercicios</li>
                        <li>Seguimiento de actividades</li>
                    </ul>
                </div>

                <div className="caja">
                    <h2>Rutinas</h2>
                    <p>
                        Los usuarios pueden consultar diferentes rutinas dependiendo
                        de sus objetivos y organizar sus entrenamientos de forma
                        más cómoda.
                    </p>
                </div>

                <div className="caja">
                    <h2>Reservas</h2>
                    <p>
                        Desde la plataforma se pueden realizar reservas para
                        organizar los horarios de entrenamiento y evitar esperas
                        innecesarias.
                    </p>
                </div>

                <div className="caja">
                    <h2>Horarios</h2>
                    <p>
                        El gimnasio cuenta con diferentes horarios para que cada
                        usuario pueda elegir el momento que mejor se adapte a
                        sus necesidades.
                    </p>
                </div>

                <div className="caja">
                    <h2>Contacto</h2>
                    <p>
                        Para realizar consultas o recibir más información,
                        los usuarios pueden comunicarse con el gimnasio a través
                        de nuestros medios de contacto.
                    </p>
                </div>
            </main>

            <footer>
                <p>2026 Impacto-Fitness</p>
            </footer>
        </div>
    );
}

export default Info;