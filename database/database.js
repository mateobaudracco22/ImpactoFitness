import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3000;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// Configuración de conexión a MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: ''
};

let db;

async function inicializarBaseDeDatos() {
    try {
        const conexion = await mysql.createConnection(dbConfig);
        
        // 1. Crear base de datos si no existe
        await conexion.query(`CREATE DATABASE IF NOT EXISTS impacto_fitness;`);
        await conexion.query(`USE impacto_fitness;`);

        // 2. Crear tabla de metas
        await conexion.query(`
            CREATE TABLE IF NOT EXISTS metas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                icono VARCHAR(50)
            );
        `);

        // 3. Crear tablas principales
        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_completo VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                telefono VARCHAR(50),
                objetivo ENUM('musculacion/fuerza', 'cardio/perdida_peso', 'clases/funcional'),
                rol ENUM('cliente', 'instructor', 'admin') DEFAULT 'cliente',
                password_hash VARCHAR(255) NOT NULL,
                meta_id INT NULL,
                instructor_id INT NULL,
                FOREIGN KEY (instructor_id) REFERENCES Usuarios(id) ON DELETE SET NULL
            );
        `);

        // Seguridad por si la tabla Usuarios ya existía sin meta_id
        try {
            await conexion.query(`ALTER TABLE Usuarios ADD COLUMN meta_id INT NULL;`);
        } catch (e) {
            // Si la columna ya existe, MySQL arrojará error
        }

        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Ejercicios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                url_gif_demostrativo VARCHAR(255)
            );
        `);

        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Etiquetas_Musculares (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL
            );
        `);

        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Ejercicio_Etiqueta (
                ejercicio_id INT NOT NULL,
                etiqueta_id INT NOT NULL,
                PRIMARY KEY (ejercicio_id, etiqueta_id),
                FOREIGN KEY (ejercicio_id) REFERENCES Ejercicios(id) ON DELETE CASCADE,
                FOREIGN KEY (etiqueta_id) REFERENCES Etiquetas_Musculares(id) ON DELETE CASCADE
            );
        `);

        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Rutinas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                instructor_id INT,
                nombre_rutina VARCHAR(255),
                proposito VARCHAR(255),
                dia_asignado ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'),
                FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (instructor_id) REFERENCES Usuarios(id) ON DELETE SET NULL
            );
        `);

        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Rutina_Ejercicios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                rutina_id INT NOT NULL,
                ejercicio_id INT NOT NULL,
                series INT DEFAULT 1,
                repeticiones VARCHAR(50),
                orden INT DEFAULT 1,
                FOREIGN KEY (rutina_id) REFERENCES Rutinas(id) ON DELETE CASCADE,
                FOREIGN KEY (ejercicio_id) REFERENCES Ejercicios(id) ON DELETE CASCADE
            );
        `);

        // 4. Insertar Metas por defecto si está vacía
        const [metasCheck] = await conexion.query("SELECT COUNT(*) as total FROM metas");
        if (metasCheck[0].total === 0) {
            await conexion.query(`
                INSERT INTO metas (id, nombre, descripcion, icono) VALUES
                (1, 'Ganar Músculo', 'Enfocado en hipertrofia y fuerza.', '🏋️'),
                (2, 'Perder Peso', 'Enfocado en déficit calórico y quema de grasa.', '🔥'),
                (3, 'Resistencia / Cardio', 'Mejora del estado físico general.', '🏃‍♂️'),
                (4, 'Mantenimiento', 'Mantener el peso actual y tono muscular.', '🧘');
            `);
            console.log('🎯 Metas de prueba insertadas.');
        }

        // 5. Insertar Profesor de prueba si no existe
        const [instructores] = await conexion.query("SELECT * FROM Usuarios WHERE rol = 'instructor'");
        if (instructores.length === 0) {
            await conexion.query(`
                INSERT INTO Usuarios (nombre_completo, email, telefono, rol, password_hash, meta_id)
                VALUES ('Profesor Nahuel', 'nahuel@gym.com', '1122334455', 'instructor', '123456', NULL)
            `);
            console.log('👤 Instructor de prueba creado (nahuel@gym.com / 123456)');
        }

        // 6. Insertar Alumnos de prueba si no existen
        const [alumnos] = await conexion.query("SELECT * FROM Usuarios WHERE rol = 'cliente'");
        if (alumnos.length === 0) {
            await conexion.query(`
                INSERT INTO Usuarios (nombre_completo, email, telefono, rol, password_hash, meta_id) VALUES
                ('Juan Pérez', 'juan@gmail.com', '1199887766', 'cliente', '123456', 1),
                ('María Gómez', 'maria@gmail.com', '1144556677', 'cliente', '123456', 2);
            `);
            console.log('👥 Alumnos de prueba creados (Juan Pérez y María Gómez).');
        }

        // 7. Insertar catálogo de Ejercicios y Etiquetas de prueba si está vacío
        const [ejercicios] = await conexion.query("SELECT COUNT(*) as total FROM Ejercicios");
        if (ejercicios[0].total === 0) {
            await conexion.query(`
                INSERT INTO Etiquetas_Musculares (id, nombre) VALUES
                (1, 'Pectoral'), (2, 'Tríceps'), (3, 'Cuádriceps'), 
                (4, 'Glúteos'), (5, 'Espalda'), (6, 'Bíceps'), (7, 'Hombros');
            `);

            await conexion.query(`
                INSERT INTO Ejercicios (id, nombre, descripcion) VALUES
                (1, 'Press de Banca', 'Pecho y tríceps con barra horizontal'),
                (2, 'Sentadilla con Barra', 'Cuádriceps y glúteos'),
                (3, 'Peso Muerto', 'Espalda baja, glúteos e isquiotibiales'),
                (4, 'Dominadas', 'Dorsales y bíceps'),
                (5, 'Curl de Bíceps', 'Flexión de codo con mancuernas'),
                (6, 'Extensión de Tríceps', 'Trabajo en polea alta'),
                (7, 'Elevaciones Laterales', 'Aislamiento de deltoides lateral');
            `);

            await conexion.query(`
                INSERT INTO Ejercicio_Etiqueta (ejercicio_id, etiqueta_id) VALUES
                (1, 1), (1, 2),
                (2, 3), (2, 4),
                (3, 4), (3, 5),
                (4, 5), (4, 6),
                (5, 6),
                (6, 2),
                (7, 7);
            `);

            console.log('💪 Ejercicios y etiquetas de prueba insertados.');
        }

        console.log('✅ Base de datos "impacto_fitness" inicializada correctamente.');
        return conexion;
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
    }
}

// --- ENDPOINTS (API) ---

app.get('/api/estado', (req, res) => {
    res.json({ mensaje: 'El servidor de Impacto Fitness está activo' });
});

// Autenticación (Login) con LEFT JOIN a metas (soporta instructores sin meta)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [usuarios] = await db.query(
            `SELECT u.id, u.nombre_completo, u.email, u.rol, u.objetivo, u.meta_id, m.nombre AS meta_nombre, m.icono AS meta_icono 
             FROM Usuarios u 
             LEFT JOIN metas m ON u.meta_id = m.id 
             WHERE u.email = ? AND u.password_hash = ?`,
            [email, password]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        res.json({ usuario: usuarios[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/solicitudes', async (req, res) => {
    try {
        const [solicitudes] = await db.query(`
            SELECT 
                u.id AS usuario_id,
                u.nombre_completo,
                u.email,
                u.meta_id,
                m.nombre AS meta_nombre,
                m.icono AS meta_icono,
                u.instructor_id
            FROM Usuarios u
            LEFT JOIN metas m ON u.meta_id = m.id
            WHERE u.rol = 'cliente' 
            AND (u.instructor_id IS NULL OR u.instructor_id = 0)
        `);
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/alumnos/:id/asignar', async (req, res) => {
    const alumnoId = req.params.id;
    const { instructor_id } = req.body;

    try {
        const [resultado] = await db.query(
            'UPDATE Usuarios SET instructor_id = ? WHERE id = ?',
            [instructor_id, alumnoId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado.' });
        }

        res.json({ mensaje: 'Alumno asignado correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al asignar alumno en la base de datos.' });
    }
});

app.get('/api/ejercicios', async (req, res) => {
    try {
        const consulta = `
            SELECT 
                e.id, 
                e.nombre, 
                e.descripcion, 
                e.url_gif_demostrativo,
                GROUP_CONCAT(em.nombre SEPARATOR ',') AS etiquetas
            FROM Ejercicios e
            LEFT JOIN Ejercicio_Etiqueta ee ON e.id = ee.ejercicio_id
            LEFT JOIN Etiquetas_Musculares em ON ee.etiqueta_id = em.id
            GROUP BY e.id
        `;
        
        const [filas] = await db.query(consulta);

        const resultado = filas.map(ejercicio => ({
            ...ejercicio,
            etiquetas: ejercicio.etiquetas ? ejercicio.etiquetas.split(',') : []
        }));

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/registro', async (req, res) => {
    const { nombre_completo, email, telefono, meta_id, password, rol } = req.body;
    try {
        const [resultado] = await db.query(
            `INSERT INTO Usuarios (nombre_completo, email, telefono, meta_id, password_hash, rol, instructor_id) 
             VALUES (?, ?, ?, ?, ?, ?, NULL)`,
            [nombre_completo, email, telefono, meta_id || null, password, rol || 'cliente']
        );

        res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/rutinas/usuario/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [filas] = await db.query(`
            SELECT r.id AS rutina_id, r.nombre_rutina, r.proposito, r.dia_asignado,
                   re.ejercicio_id, re.series, re.repeticiones, re.orden,
                   e.nombre AS nombre_ejercicio, e.descripcion, e.url_gif_demostrativo
            FROM Rutinas r
            LEFT JOIN Rutina_Ejercicios re ON r.id = re.rutina_id
            LEFT JOIN Ejercicios e ON re.ejercicio_id = e.id
            WHERE r.usuario_id = ?
            ORDER BY r.dia_asignado, re.orden
        `, [usuario_id]);

        const rutinasAgrupadas = filas.reduce((acumulador, fila) => {
            let rutina = acumulador.find(r => r.rutina_id === fila.rutina_id);
            
            if (!rutina) {
                rutina = {
                    rutina_id: fila.rutina_id,
                    nombre_rutina: fila.nombre_rutina,
                    proposito: fila.proposito,
                    dia_asignado: fila.dia_asignado,
                    ejercicios: []
                };
                acumulador.push(rutina);
            }

            if (fila.ejercicio_id) {
                rutina.ejercicios.push({
                    ejercicio_id: fila.ejercicio_id,
                    series: fila.series,
                    repeticiones: fila.repeticiones,
                    orden: fila.orden,
                    nombre_ejercicio: fila.nombre_ejercicio,
                    descripcion: fila.descripcion,
                    url_gif_demostrativo: fila.url_gif_demostrativo
                });
            }

            return acumulador;
        }, []);

        res.json(rutinasAgrupadas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rutinas', async (req, res) => {
    const { usuario_id, instructor_id, nombre_rutina, proposito, dia_asignado, ejercicios } = req.body;
    try {
        const [resultadoRutina] = await db.query(
            "INSERT INTO Rutinas (usuario_id, instructor_id, nombre_rutina, proposito, dia_asignado) VALUES (?, ?, ?, ?, ?)",
            [usuario_id, instructor_id, nombre_rutina, proposito, dia_asignado]
        );
        const rutinaId = resultadoRutina.insertId;

        if (ejercicios && ejercicios.length > 0) {
            for (let i = 0; i < ejercicios.length; i++) {
                const ej = ejercicios[i];
                await db.query(
                    "INSERT INTO Rutina_Ejercicios (rutina_id, ejercicio_id, series, repeticiones, orden) VALUES (?, ?, ?, ?, ?)",
                    [rutinaId, ej.ejercicio_id, ej.series, ej.repeticiones, i + 1]
                );
            }
        }

        res.status(201).json({ mensaje: 'Rutina creada con éxito', rutinaId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/rutinas/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_rutina, dia_asignado, ejercicios } = req.body;

    try {
        await db.query(
            'UPDATE Rutinas SET nombre_rutina = ?, dia_asignado = ? WHERE id = ?',
            [nombre_rutina, dia_asignado, id]
        );

        await db.query('DELETE FROM Rutina_Ejercicios WHERE rutina_id = ?', [id]);

        if (ejercicios && ejercicios.length > 0) {
            for (let i = 0; i < ejercicios.length; i++) {
                const ej = ejercicios[i];
                await db.query(
                    'INSERT INTO Rutina_Ejercicios (rutina_id, ejercicio_id, series, repeticiones, orden) VALUES (?, ?, ?, ?, ?)',
                    [id, ej.ejercicio_id, ej.series, ej.repeticiones, i + 1]
                );
            }
        }

        res.json({ mensaje: 'Rutina actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la rutina.' });
    }
});

app.delete('/api/rutinas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM Rutina_Ejercicios WHERE rutina_id = ?', [id]);
        const [resultado] = await db.query('DELETE FROM Rutinas WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'No se encontró la rutina.' });
        }

        res.json({ mensaje: 'Rutina eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al borrar la rutina.' });
    }
});

app.get('/api/metas', async (req, res) => {
    try {
        const [metas] = await db.query('SELECT * FROM metas');
        res.json(metas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las metas de la base de datos.' });
    }
});

app.put('/api/usuarios/:id/meta', async (req, res) => {
    const usuarioId = req.params.id;
    const { meta_id } = req.body; 

    try {
        const [resultado] = await db.query(
            'UPDATE Usuarios SET meta_id = ? WHERE id = ?',
            [meta_id, usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json({ mensaje: 'Meta actualizada correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la meta en la base de datos.' });
    }
});

app.get('/api/instructores/:instructor_id/alumnos', async (req, res) => {
    const { instructor_id } = req.params;
    try {
        const [alumnos] = await db.query(`
            SELECT 
                u.id AS usuario_id,
                u.nombre_completo,
                u.email,
                u.meta_id,
                m.nombre AS meta_nombre,
                m.icono AS meta_icono,
                u.instructor_id
            FROM Usuarios u
            LEFT JOIN metas m ON u.meta_id = m.id
            WHERE u.instructor_id = ?
        `, [instructor_id]);
        res.json(alumnos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ARRANCAR EL SERVIDOR ---
inicializarBaseDeDatos().then((conexion) => {
    if (conexion) {
        db = conexion;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
        });
    }
});