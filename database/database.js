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

        // 2. Crear tablas principales
        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_completo VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                telefono VARCHAR(50),
                objetivo ENUM('musculacion/fuerza', 'cardio/perdida_peso', 'clases/funcional'),
                rol ENUM('cliente', 'instructor', 'admin') DEFAULT 'cliente',
                password_hash VARCHAR(255) NOT NULL,
                instructor_id INT NULL,
                FOREIGN KEY (instructor_id) REFERENCES Usuarios(id) ON DELETE SET NULL
            );
        `);

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

        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Solicitudes_Rutina (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                proposito_solicitado TEXT,
                ejercicios_no_aptos TEXT,
                estado ENUM('Pendiente', 'Completada') DEFAULT 'Pendiente',
                FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
            );
        `);

        // 3. Insertar Profesor de prueba si no existe
        const [instructores] = await conexion.query("SELECT * FROM Usuarios WHERE rol = 'instructor'");
        if (instructores.length === 0) {
            await conexion.query(`
                INSERT INTO Usuarios (nombre_completo, email, telefono, objetivo, rol, password_hash)
                VALUES ('Profesor Nahuel', 'nahuel@gym.com', '1122334455', 'musculacion/fuerza', 'instructor', '123456')
            `);
            console.log('👤 Instructor de prueba creado (nahuel@gym.com / 123456)');
        }

        // 4. Insertar Alumnos de prueba si no existen
        const [alumnos] = await conexion.query("SELECT * FROM Usuarios WHERE rol = 'cliente'");
        if (alumnos.length === 0) {
            await conexion.query(`
                INSERT INTO Usuarios (nombre_completo, email, telefono, objetivo, rol, password_hash) VALUES
                ('Juan Pérez', 'juan@gmail.com', '1199887766', 'musculacion/fuerza', 'cliente', '123456'),
                ('María Gómez', 'maria@gmail.com', '1144556677', 'cardio/perdida_peso', 'cliente', '123456');
            `);

            await conexion.query(`
                INSERT INTO Solicitudes_Rutina (usuario_id, proposito_solicitado, ejercicios_no_aptos, estado) VALUES
                (2, 'Aumentar masa muscular y fuerza', 'Dolor en rodilla izquierda', 'Pendiente'),
                (3, 'Bajar de peso y resistencia cardiovascular', 'Ninguna', 'Pendiente');
            `);
            console.log('👥 Alumnos de prueba creados (Juan Pérez y María Gómez).');
        }

        // 5. Insertar catálogo de Ejercicios y Etiquetas de prueba si está vacío
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

// Estado del Servidor
app.get('/api/estado', (req, res) => {
    res.json({ mensaje: 'El servidor de Impacto Fitness está activo' });
});

// Autenticación (Login)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [usuarios] = await db.query(
            "SELECT id, nombre_completo, email, rol, objetivo FROM Usuarios WHERE email = ? AND password_hash = ?",
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

// Obtener todas las solicitudes / alumnos cliente
app.get('/api/solicitudes', async (req, res) => {
    try {
        const [solicitudes] = await db.query(`
            SELECT 
                u.id AS usuario_id,
                u.nombre_completo,
                u.email,
                u.objetivo,
                u.instructor_id,
                s.id AS solicitud_id,
                s.proposito_solicitado,
                s.ejercicios_no_aptos,
                s.estado
            FROM Usuarios u
            LEFT JOIN Solicitudes_Rutina s ON u.id = s.usuario_id
            WHERE u.rol = 'cliente'
        `);
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Asignar un alumno a un instructor
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

// Obtener catálogo de ejercicios con sus etiquetas musculares
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

// Obtener rutinas de un alumno
app.get('/api/rutinas/usuario/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rutinas] = await db.query(`
            SELECT r.id AS rutina_id, r.nombre_rutina, r.proposito, r.dia_asignado,
                   re.ejercicio_id, re.series, re.repeticiones, re.orden,
                   e.nombre AS nombre_ejercicio, e.descripcion, e.url_gif_demostrativo
            FROM Rutinas r
            LEFT JOIN Rutina_Ejercicios re ON r.id = re.rutina_id
            LEFT JOIN Ejercicios e ON re.ejercicio_id = e.id
            WHERE r.usuario_id = ?
            ORDER BY r.dia_asignado, re.orden
        `, [usuario_id]);

        res.json(rutinas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva rutina
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

// Editar una rutina
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

// Eliminar una rutina
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

// --- ARRANCAR EL SERVIDOR ---
inicializarBaseDeDatos().then((conexion) => {
    if (conexion) {
        db = conexion;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
        });
    }
});