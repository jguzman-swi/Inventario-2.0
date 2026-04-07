require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seed() {
  let connection;
  try {
    const dataPath = path.join(__dirname, '../data.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error("data.json not found! Ensure python extraction ran.");
    }

    const { sucursales, ubicaciones, categorias, productos } = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Create DB connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'subway_app',
      password: process.env.DB_PASSWORD || 'SecureAppPass123!',
      multipleStatements: true
    });

    const dbName = process.env.DB_NAME || 'subway_inventory';

    console.log(`🛡️ Creating database ${dbName}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log(`🛡️ Creating schema...`);
    // Drop existing to re-seed cleanly
    const schema = `
      DROP TABLE IF EXISTS Conteo_Items;
      DROP TABLE IF EXISTS Conteos;
      DROP TABLE IF EXISTS Productos;
      DROP TABLE IF EXISTS Ubicaciones;
      DROP TABLE IF EXISTS Sucursales;
      DROP TABLE IF EXISTS Categorias;
      DROP TABLE IF EXISTS Usuarios;

      CREATE TABLE Usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        pin_code VARCHAR(10) NOT NULL,
        rol VARCHAR(50) DEFAULT 'Cajero'
      );

      CREATE TABLE Sucursales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bodega VARCHAR(50),
        nombre VARCHAR(100),
        direccion VARCHAR(255)
      );

      CREATE TABLE Ubicaciones (
        id VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(100),
        abierto BOOLEAN,
        cerrado BOOLEAN
      );

      CREATE TABLE Categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE
      );

      CREATE TABLE Productos (
        articuloid VARCHAR(50) PRIMARY KEY,
        itemname VARCHAR(200),
        UnidadCompra VARCHAR(50),
        cantidadCompra DECIMAL(10,2),
        unidad_venta VARCHAR(50),
        cantidadventa DECIMAL(10,2),
        ItmsGrpNam VARCHAR(100),
        Ubicacion JSON,
        min DECIMAL(10,2),
        max DECIMAL(10,2)
      );

      CREATE TABLE Conteos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sucursal_id INT,
        fecha DATETIME,
        fecha_conteo DATE,
        tipo VARCHAR(50),
        estado VARCHAR(20) DEFAULT 'Abierto',
        total_piezas INT,
        FOREIGN KEY (sucursal_id) REFERENCES Sucursales(id) ON DELETE SET NULL,
        UNIQUE KEY unique_session (sucursal_id, fecha_conteo, tipo)
      );

      CREATE TABLE Conteo_Items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conteo_id INT,
        usuario_id INT,
        producto_id VARCHAR(50),
        ubicacion_id VARCHAR(50),
        cantidad_cajas DECIMAL(10,2) DEFAULT 0,
        cantidad_sueltas DECIMAL(10,2) DEFAULT 0,
        FOREIGN KEY (conteo_id) REFERENCES Conteos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE SET NULL,
        FOREIGN KEY (producto_id) REFERENCES Productos(articuloid) ON DELETE CASCADE,
        FOREIGN KEY (ubicacion_id) REFERENCES Ubicaciones(id) ON DELETE CASCADE
      );
    `;

    await connection.query(schema);

    console.log(`🌾 Seeding Usuarios...`);
    await connection.query("INSERT INTO Usuarios (nombre, pin_code, rol) VALUES ('Admin Maestro', '1234', 'Admin')");
    await connection.query("INSERT INTO Usuarios (nombre, pin_code, rol) VALUES ('Cajero Invitado', '0000', 'Cajero')");
    
    console.log(`🌾 Seeding Sucursales...`);
    for (const b of sucursales) {
      await connection.query(
        'INSERT INTO Sucursales (bodega, nombre, direccion) VALUES (?, ?, ?)',
        [b.bodega, b.nombre, b.direccion]
      );
    }

    console.log(`🌾 Seeding Ubicaciones...`);
    for (const u of ubicaciones) {
      await connection.query(
        'INSERT INTO Ubicaciones (id, nombre, abierto, cerrado) VALUES (?, ?, ?, ?)',
        [String(u.id), u.nombre, !!u.abierto, !!u.cerrado]
      );
    }

    console.log(`🌾 Seeding Categorias...`);
    for (const c of categorias) {
      await connection.query('INSERT IGNORE INTO Categorias (nombre) VALUES (?)', [String(c)]);
    }

    console.log(`🌾 Seeding Productos...`);
    for (const p of productos) {
      const ubicacionStr = String(p.Ubicacion);
      const locIds = ubicacionStr.split(',').map(s => s.trim()).filter(Boolean);
      const ubicacionJson = locIds.map(id => ({
        id,
        cerrado: true,
        abierto: true
      }));

      await connection.query(
        `INSERT INTO Productos (articuloid, itemname, UnidadCompra, cantidadCompra, unidad_venta, cantidadventa, ItmsGrpNam, Ubicacion, min, max)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.articuloid, p.itemname, p.UnidadCompra, p.cantidadCompra, p.unidad_venta, p.cantidadventa, p.ItmsGrpNam, JSON.stringify(ubicacionJson), p.min, p.max]
      );
    }

    console.log('✅ Database seeded and ready!');
  } catch (error) {
    console.error('❌ Data seed error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
