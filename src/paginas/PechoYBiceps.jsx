import "../estilos/PechoYBiceps.css";

function Rutina() {
    return (
        <div className="rutina-page">

            <header>
                <h1>Rutina de Pecho y Bíceps</h1>
                <h2>Impacto-Fitness</h2>
                <p>Entrenamiento para desarrollar fuerza y masa muscular</p>
            </header>

            <main className="rutina-contenedor">

                <section className="info-rutina">
                    <h2>Información de la rutina</h2>

                    <p>
                        Esta rutina está enfocada principalmente en trabajar
                        los músculos del pecho y los bíceps. Los ejercicios
                        están organizados para realizarse de manera ordenada,
                        respetando las series, repeticiones y descansos.
                    </p>

                    <div className="datos-rutina">
                        <div>
                            <strong>Duración</strong>
                            <span>60 - 75 minutos</span>
                        </div>

                        <div>
                            <strong>Dificultad</strong>
                            <span>Intermedia</span>
                        </div>

                        <div>
                            <strong>Músculos</strong>
                            <span>Pecho y Bíceps</span>
                        </div>
                    </div>
                </section>

                <section className="grupo-muscular">
                    <h2>Entrenamiento de Pecho</h2>

                    <div className="ejercicios">

                        <div className="ejercicio">
                            <h3>1. Press de banca plano</h3>

                            <p>
                                Ejercicio principal para trabajar el pecho.
                                Se realiza acostado en un banco plano,
                                empujando la barra hacia arriba y bajándola
                                de forma controlada.
                            </p>

                            <div className="datos-ejercicio">
                                <p><strong>Series:</strong> 4</p>
                                <p><strong>Repeticiones:</strong> 8 - 10</p>
                                <p><strong>Peso:</strong> 40 kg</p>
                                <p><strong>Descanso:</strong> 90 segundos</p>
                            </div>
                        </div>

                        <div className="ejercicio">
                            <h3>2. Press inclinado con mancuernas</h3>

                            <p>
                                Trabaja principalmente la parte superior
                                del pecho. Se realiza con el banco inclinado
                                y una mancuerna en cada mano.
                            </p>

                            <div className="datos-ejercicio">
                                <p><strong>Series:</strong> 3</p>
                                <p><strong>Repeticiones:</strong> 10 - 12</p>
                                <p><strong>Peso:</strong> 15 kg por mancuerna</p>
                                <p><strong>Descanso:</strong> 75 segundos</p>
                            </div>
                        </div>

                        <div className="ejercicio">
                            <h3>3. Aperturas con mancuernas</h3>

                            <p>
                                Es un ejercicio que permite trabajar el pecho
                                mediante un movimiento de apertura y cierre
                                de los brazos.
                            </p>

                            <div className="datos-ejercicio">
                                <p><strong>Series:</strong> 3</p>
                                <p><strong>Repeticiones:</strong> 12</p>
                                <p><strong>Peso:</strong> 10 kg por mancuerna</p>
                                <p><strong>Descanso:</strong> 60 segundos</p>
                            </div>
                        </div>

                        <div className="ejercicio">
                            <h3>4. Fondos para pecho</h3>

                            <p>
                                Ejercicio con el peso corporal que permite
                                trabajar el pecho y también involucra los
                                tríceps.
                            </p>

                            <div className="datos-ejercicio">
                                <p><strong>Series:</strong> 3</p>
                                <p><strong>Repeticiones:</strong> 8 - 12</p>
                                <p><strong>Peso:</strong> Peso corporal</p>
                                <p><strong>Descanso:</strong> 60 segundos</p>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="grupo-muscular">
                    <h2>Entrenamiento de Bíceps</h2>

                    <div className="ejercicios">

                        <div className="ejercicio">
                            <h3>1. Curl con barra</h3>

                            <p>
                                Ejercicio básico para trabajar los bíceps.
                                Se debe mantener el cuerpo estable y realizar
                                el movimiento principalmente con los brazos.
                            </p>

                            <div className="datos-ejercicio">
                                <p><strong>Series:</strong> 4</p>
                                <p><strong>Repeticiones:</strong> 8 - 10</p>
                                <p><strong>Peso:</strong> 25 kg</p>
                                <p><strong>Descanso:</strong> 75 segundos</p>
                            </div>
                        </div>

                        <div className="ejercicio">
                            <h3>2. Curl alternado con mancuernas</h3>

                            <p>
                                Se realiza alternando los brazos y permite
                                trabajar cada bíceps por separado.
                            </p>

                            <div className="datos-ejercicio">
                                <p><strong>Series:</strong> 3</p>
                                <p><strong>Repeticiones:</strong> 10 - 12</p>
                                <p><strong>Peso:</strong> 12 kg por mancuerna</p>
                                <p><strong>Descanso:</strong> 60 segundos</p>
                            </div>
                        </div>

                        <div className="ejercicio">
                            <h3>3. Curl martillo</h3>

                            <p>
                                Variante del curl que se realiza manteniendo
                                las palmas de las manos enfrentadas. Trabaja
                                el bíceps y otros músculos del brazo.
                            </p>

                            <div className="datos-ejercicio">
                                <p><strong>Series:</strong> 3</p>
                                <p><strong>Repeticiones:</strong> 10 - 12</p>
                                <p><strong>Peso:</strong> 12 kg por mancuerna</p>
                                <p><strong>Descanso:</strong> 60 segundos</p>
                            </div>
                        </div>

                        <div className="ejercicio">
                            <h3>4. Curl en banco inclinado</h3>

                            <p>
                                Se realiza sentado en un banco inclinado.
                                Permite trabajar el bíceps mediante un
                                movimiento controlado.
                            </p>

                            <div className="datos-ejercicio">
                                <p><strong>Series:</strong> 3</p>
                                <p><strong>Repeticiones:</strong> 10 - 12</p>
                                <p><strong>Peso:</strong> 10 kg por mancuerna</p>
                                <p><strong>Descanso:</strong> 60 segundos</p>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="recomendaciones">
                    <h2>Recomendaciones</h2>

                    <ul>
                        <li>Realizar un calentamiento antes de comenzar.</li>
                        <li>Mantener una buena técnica durante los ejercicios.</li>
                        <li>No aumentar el peso si no se puede completar correctamente.</li>
                        <li>Respetar los tiempos de descanso.</li>
                        <li>Tomar agua durante el entrenamiento.</li>
                    </ul>

                    <button id="finalizarRutina">
                        Finalizar rutina
                    </button>

                    <p id="mensaje"></p>
                </section>

            </main>

            <footer>
                <p>2026 Impacto-Fitness</p>
            </footer>

        </div>
    );
}

export default Rutina;