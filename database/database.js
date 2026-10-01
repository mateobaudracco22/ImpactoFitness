import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '' // Tu contraseña de MySQL
};

async function inicializarBaseDeDatos() {
    try {
        const conexion = await mysql.createConnection(dbConfig);
        
        // 1. Crear base de datos si no existe
        await conexion.query(`CREATE DATABASE IF NOT EXISTS impacto_fitness;`);
        await conexion.query(`USE impacto_fitness;`);

        // 2. Tabla Usuarios
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

        // 3. Tabla Ejercicios
        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Ejercicios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                url_gif_demostrativo VARCHAR(255)
            );
        `);

        // 4. Tabla Etiquetas_Musculares
        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Etiquetas_Musculares (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL
            );
        `);

        // 5. Tabla Intermedia Ejercicio_Etiqueta
        await conexion.query(`
            CREATE TABLE IF NOT EXISTS Ejercicio_Etiqueta (
                ejercicio_id INT,
                etiqueta_id INT,
                PRIMARY KEY (ejercicio_id, etiqueta_id),
                FOREIGN KEY (ejercicio_id) REFERENCES Ejercicios(id) ON DELETE CASCADE,
                FOREIGN KEY (etiqueta_id) REFERENCES Etiquetas_Musculares(id) ON DELETE CASCADE
            );
        `);

        // 6. Tabla Rutinas
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

        // 7. Tabla Intermedia Rutina_Ejercicios (Detalle de ejercicios en cada rutina)
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

        // 8. Tabla Solicitudes_Rutina
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

        console.log('✅ Base de datos "impacto_fitness" y las 7 tablas creadas correctamente.');
        return conexion;
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
    }
}

// Inicializar base de datos y arrancar servidor
inicializarBaseDeDatos().then((db) => {
    
    app.get('/api/estado', (req, res) => {
        res.json({ mensaje: 'Servidor funcionando con la estructura completa de tablas' });
    });

    app.listen(PORT, () => {
        console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
    });
});