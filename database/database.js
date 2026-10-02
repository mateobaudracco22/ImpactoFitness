import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3000;

// --- MIDDLEWARES ---
app.use(cors()); // Comunicación de Frontend y Backend en diferentes puertos
app.use(express.json()); // Recibir datos en formato JSON desde el Frontend

// Configuración de conexión a MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: ''
};

let db; // Variable global para reutilizar la conexión en los endpoints

async function inicializarBaseDeDatos() {
    try {
        const conexion = await mysql.createConnection(dbConfig);
        
        // 1. Crear base de datos si no existe
        await conexion.query(`CREATE DATABASE IF NOT EXISTS impacto_fitness;`);
        await conexion.query(`USE impacto_fitness;`);

        // 2. Crear tablas si no existen
        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_completo VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                telefono VARCHAR(50),
                objetivo ENUM('musculacion/fuerza', 'cardio/perdida_peso', 'clases/funcional'),
                rol ENUM('cliente', 'instructor', 'admin') DEFAULT 'cliente',
                password_hash VARCHAR(255) NOT NULL
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
                ejercicio_id INT,
                etiqueta_id INT,
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

        console.log('✅ Base de datos "impacto_fitness" y 7 tablas verificadas/creadas.');
        return conexion;
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
    }
}

// --- ENDPOINTS (API) ---

// 1. ESTADO DEL SERVIDOR
app.get('/api/estado', (req, res) => {
    res.json({ mensaje: 'El servidor de Impacto Fitness está funcionando' });
});

// 2. USUARIOS (Registro y Login)
app.post('/api/registro', async (req, res) => {
    const { nombre_completo, email, telefono, objetivo, password, rol } = req.body;
    try {
        const [resultado] = await db.query(
            `INSERT INTO Usuarios (nombre_completo, email, telefono, objetivo, password_hash, rol) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre_completo, email, telefono, objetivo, password, rol || 'cliente']
        );
        res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuarioId: resultado.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [usuarios] = await db.query(
            "SELECT id, nombre_completo, email, rol, objetivo FROM Usuarios WHERE email = ? AND password_hash = ?",
            [email, password]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        res.json({ usuario: usuarios[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. EJERCICIOS Y ETIQUETAS MUSCULARES
app.get('/api/ejercicios', async (req, res) => {
    try {
        const [ejercicios] = await db.query("SELECT * FROM Ejercicios");
        res.json(ejercicios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/etiquetas', async (req, res) => {
    try {
        const [etiquetas] = await db.query("SELECT * FROM Etiquetas_Musculares");
        res.json(etiquetas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ejercicios', async (req, res) => {
    const { nombre, descripcion, url_gif_demostrativo } = req.body;
    try {
        const [resultado] = await db.query(
            "INSERT INTO Ejercicios (nombre, descripcion, url_gif_demostrativo) VALUES (?, ?, ?)",
            [nombre, descripcion, url_gif_demostrativo]
        );
        res.status(201).json({ mensaje: 'Ejercicio creado', id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. SOLICITUDES DE RUTINA (Para que los clientes pidan rutinas)
app.post('/api/solicitudes', async (req, res) => {
    const { usuario_id, proposito_solicitado, ejercicios_no_aptos } = req.body;
    try {
        const [resultado] = await db.query(
            "INSERT INTO Solicitudes_Rutina (usuario_id, proposito_solicitado, ejercicios_no_aptos) VALUES (?, ?, ?)",
            [usuario_id, proposito_solicitado, ejercicios_no_aptos]
        );
        res.status(201).json({ mensaje: 'Solicitud enviada al entrenador', id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/solicitudes', async (req, res) => {
    try {
        // Trae las solicitudes junto con el nombre del alumno que la pidió
        const [solicitudes] = await db.query(`
            SELECT s.*, u.nombre_completo, u.email 
            FROM Solicitudes_Rutina s 
            JOIN Usuarios u ON s.usuario_id = u.id 
            WHERE s.estado = 'Pendiente'
        `);
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. RUTINAS Y RUTINA_EJERCICIOS (Para asignar y consultar rutinas)
app.get('/api/rutinas/usuario/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        // Obtener las rutinas del usuario con sus ejercicios, series y repeticiones
        const [rutinas] = await db.query(`
            SELECT r.id AS rutina_id, r.nombre_rutina, r.proposito, r.dia_asignado,
                   re.series, re.repeticiones, re.orden,
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

app.post('/api/rutinas', async (req, res) => {
    const { usuario_id, instructor_id, nombre_rutina, proposito, dia_asignado, ejercicios } = req.body;
    try {
        // 1. Crear la rutina principal
        const [resultadoRutina] = await db.query(
            "INSERT INTO Rutinas (usuario_id, instructor_id, nombre_rutina, proposito, dia_asignado) VALUES (?, ?, ?, ?, ?)",
            [usuario_id, instructor_id, nombre_rutina, proposito, dia_asignado]
        );
        const rutinaId = resultadoRutina.insertId;

        // 2. Insertar cada ejercicio asignado a esa rutina en la tabla Rutina_Ejercicios
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

// 6. ELIMINAR RUTINA DE UN USUARIO (DELETE)
app.delete('/api/rutinas/usuario/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // 1. Buscar la rutina asociada al usuario
    const [rutinas] = await db.query('SELECT id FROM Rutinas WHERE usuario_id = ?', [usuario_id]);

    if (rutinas.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró rutina para este alumno.' });
    }

    const rutinaId = rutinas[0].id;

    // 2. Borrar los ejercicios asociados a la rutina
    await db.query('DELETE FROM Rutina_Ejercicios WHERE rutina_id = ?', [rutinaId]);

    // 3. Borrar la cabecera de la rutina
    await db.query('DELETE FROM Rutinas WHERE id = ?', [rutinaId]);

    res.json({ mensaje: 'Rutina eliminada correctamente' });
  } catch (error) {
    console.error('Error al borrar la rutina:', error);
    res.status(500).json({ error: 'Error al borrar la rutina en la base de datos.' });
  }
});

// 7. ACTUALIZAR/EDITAR RUTINA (PUT)

app.put('/api/rutinas/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_rutina, dia_asignado, ejercicios } = req.body;

  try {
    // 1. Actualizar datos de la rutina principal
    await db.query(
      'UPDATE Rutinas SET nombre_rutina = ?, dia_asignado = ? WHERE id = ?',
      [nombre_rutina, dia_asignado, id]
    );

    // 2. Reemplazar ejercicios
    await db.query('DELETE FROM Rutina_Ejercicios WHERE rutina_id = ?', [id]);

    for (const ej of ejercicios) {
      await db.query(
        'INSERT INTO Rutina_Ejercicios (rutina_id, ejercicio_id, series, repeticiones) VALUES (?, ?, ?, ?)',
        [id, ej.ejercicio_id, ej.series, ej.repeticiones]
      );
    }

    res.json({ mensaje: 'Rutina actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la rutina:', error);
    res.status(500).json({ error: 'Error al actualizar la rutina.' });
  }
});

// --- ARRANCAR EL SERVIDOR ---
inicializarBaseDeDatos().then((conexion) => {
    if (conexion) {
        db = conexion; // Guardamos la conexión activa para usarla en las rutas
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
        });
    }
});