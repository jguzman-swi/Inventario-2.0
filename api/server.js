require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../web/dist')));

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'subway_app',
  password: process.env.DB_PASSWORD || 'SecureAppPass123!',
  database: process.env.DB_NAME || 'subway_inventory',
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
  } catch (err) {
    console.error('❌ Cannot connect to MySQL:', err.message);
  }
})();

// Endpoint to fetch all base data for the app
app.get('/api/inventory', async (req, res) => {
  try {
    const [sucursales] = await pool.query('SELECT * FROM Sucursales');
    const [ubicaciones] = await pool.query('SELECT * FROM Ubicaciones');
    const [categorias] = await pool.query('SELECT * FROM Categorias');
    const [productos] = await pool.query('SELECT * FROM Productos');
    const [usuarios] = await pool.query('SELECT id, nombre, rol FROM Usuarios');
    const [recetas] = await pool.query('SELECT * FROM Recetas');

    const parsedUbicaciones = ubicaciones.map(u => ({
      ...u,
      abierto: Boolean(u.abierto),
      cerrado: Boolean(u.cerrado)
    }));

    res.json({
      usuarios,
      sucursales,
      ubicaciones: parsedUbicaciones,
      categorias: categorias.map(c => c.nombre),
      recetas, // Global recipes for calculation
      productos: productos.map(p => {
        let u = p.Ubicacion;
        if (typeof u === 'string') {
          try { u = JSON.parse(u); } catch(e){}
        }
        return { ...p, Ubicacion: u };
      })
    });
  } catch (error) {
    console.error('Error fetching inventory config:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, pin } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, rol FROM Usuarios WHERE nombre = ? AND pin_code = ?',
      [username, pin]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu usuario y PIN.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
});


// ==========================================
// SESSION ENDPOINTS
// ==========================================
app.get('/api/sessions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, s.nombre as sucursal_nombre
      FROM Conteos c
      LEFT JOIN Sucursales s ON c.sucursal_id = s.id
      ORDER BY c.fecha_conteo DESC, c.fecha DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching sessions' });
  }
});

app.post('/api/sessions', async (req, res) => {
  const { sucursal_id, fecha_conteo, tipo } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Conteos (sucursal_id, fecha, fecha_conteo, tipo, estado, total_piezas) VALUES (?, NOW(), ?, ?, ?, 0)',
      [sucursal_id, fecha_conteo, tipo, 'Abierto']
    );
    res.json({ id: result.insertId, sucursal_id, fecha_conteo, tipo, estado: 'Abierto' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un inventario de ese tipo para esa fecha y sucursal. Por favor selecciona el existente en la lista.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error creating session' });
  }
});

app.get('/api/sessions/:id/progress', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT c.ubicacion_id, u.nombre as usuario_nombre
      FROM Conteo_Items c
      JOIN Usuarios u ON c.usuario_id = u.id
      WHERE c.conteo_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching session progress' });
  }
});

app.get('/api/sessions/:id/my_counts', async (req, res) => {
  const { usuario_id } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT producto_id, ubicacion_id, cantidad_cajas, cantidad_sueltas
      FROM Conteo_Items
      WHERE conteo_id = ? AND usuario_id = ?
    `, [req.params.id, usuario_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching personal counts' });
  }
});

app.get('/api/sessions/:id/locations/:locId/counts', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.producto_id, u.nombre as userName, c.usuario_id, c.cantidad_cajas as box, c.cantidad_sueltas as unit, c.timestamp 
      FROM Conteo_Items c
      JOIN Usuarios u ON c.usuario_id = u.id
      WHERE c.conteo_id = ? AND c.ubicacion_id = ?
      ORDER BY c.timestamp DESC
    `, [req.params.id, req.params.locId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching location ledger progress' });
  }
});

// Single insertion to the ledger
app.post('/api/sessions/:id/items', async (req, res) => {
  const { usuario_id, ubicacion_id, producto_id, tipo, cantidad } = req.body;
  const conteoId = req.params.id;
  try {
    const isBox = tipo === 'box';
    const cantCajas = isBox ? cantidad : 0;
    const cantSueltas = isBox ? 0 : cantidad;
    
    const [result] = await pool.query(`
      INSERT INTO Conteo_Items (conteo_id, usuario_id, ubicacion_id, producto_id, cantidad_cajas, cantidad_sueltas)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [conteoId, usuario_id, ubicacion_id, producto_id, cantCajas, cantSueltas]);
    
    // Fetch the newly created row precisely to return it
    const [insertedRow] = await pool.query(`
      SELECT c.id, c.producto_id, u.nombre as userName, c.usuario_id, c.cantidad_cajas as box, c.cantidad_sueltas as unit, c.timestamp 
      FROM Conteo_Items c
      JOIN Usuarios u ON c.usuario_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.json(insertedRow[0]);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Error inserting item' });
  }
});

// Row deletion from ledger
app.delete('/api/sessions/:id/items/:itemId', async (req, res) => {
  try {
    await pool.query('DELETE FROM Conteo_Items WHERE id = ?', [req.params.itemId]);
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting item' });
  }
});

// Row update (edit) from ledger
app.put('/api/sessions/:id/items/:itemId', async (req, res) => {
  const { cantidad, tipo } = req.body;
  try {
    const isBox = tipo === 'box';
    const cantCajas = isBox ? cantidad : 0;
    const cantSueltas = isBox ? 0 : cantidad;
    await pool.query(
      'UPDATE Conteo_Items SET cantidad_cajas = ?, cantidad_sueltas = ? WHERE id = ?', 
      [cantCajas, cantSueltas, req.params.itemId]
    );
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating item' });
  }
});

app.get('/api/sessions/:id/full_report', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT producto_id, ubicacion_id, u.nombre as usuario_nombre, SUM(cantidad_cajas) as box_total, SUM(cantidad_sueltas) as unit_total
      FROM Conteo_Items c
      JOIN Usuarios u ON c.usuario_id = u.id
      WHERE c.conteo_id = ?
      GROUP BY producto_id, ubicacion_id, u.nombre
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching session full report' });
  }
});

app.put('/api/sessions/:id/counts', async (req, res) => {
  const conteoId = req.params.id;
  const { counts, usuario_id } = req.body;
  
  if (!counts) return res.status(400).json({ error: 'No counts provided' });
  if (!usuario_id) return res.status(400).json({ error: 'No user provided' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Delete existing old items ONLY for this specific user so others aren't erased
    await connection.query('DELETE FROM Conteo_Items WHERE conteo_id = ? AND usuario_id = ?', [conteoId, usuario_id]);

    let total = 0;
    for (const [locId, prods] of Object.entries(counts)) {
      for (const [prodId, pCount] of Object.entries(prods)) {
        const boxBatches = Array.isArray(pCount.box) ? pCount.box : (pCount.box ? [pCount.box] : []);
        const unitBatches = Array.isArray(pCount.unit) ? pCount.unit : (pCount.unit ? [pCount.unit] : []);
        
        const sumBox = boxBatches.reduce((a, b) => a + Number(b), 0);
        const sumUnit = unitBatches.reduce((a, b) => a + Number(b), 0);

        if (sumBox > 0 || sumUnit > 0) {
          total += (sumBox + sumUnit);
          await connection.query(
            `INSERT INTO Conteo_Items (conteo_id, usuario_id, producto_id, ubicacion_id, cantidad_cajas, cantidad_sueltas) VALUES (?, ?, ?, ?, ?, ?)`,
            [conteoId, usuario_id, prodId, locId, sumBox, sumUnit]
          );
        }
      }
    }

    await connection.query('UPDATE Conteos SET total_piezas = ?, fecha = NOW() WHERE id = ?', [total, conteoId]);
    await connection.commit();

    // Trigger explicit location_saved event to all listening the session room
    const io = req.app.get('io');
    if (io) {
      io.to(`session_${conteoId}`).emit('location_saved', { conteoId });
    }

    res.json({ message: 'Count updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error updating counts' });
  } finally {
    connection.release();
  }
});

// Finalize/Lock session
app.post('/api/sessions/:id/finish', async (req, res) => {
  try {
    await pool.query("UPDATE Conteos SET estado = 'Finalizado' WHERE id = ?", [req.params.id]);
    
    // Broadcast state change
    const io = req.app.get('io');
    if (io) io.to(`session_${req.params.id}`).emit('session_state_changed', { estado: 'Finalizado' });

    res.json({ success: true, estado: 'Finalizado' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Error finalizing session' });
  }
});

// Reopen session (Admin only)
app.post('/api/sessions/:id/reopen', async (req, res) => {
  const { pin } = req.body;
  try {
    // Check if PIN belongs to an Admin
    const [rows] = await pool.query("SELECT * FROM Usuarios WHERE pin_code = ? AND rol = 'Admin'", [pin]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'PIN Inválido o no tienes permisos de Administrador.' });
    }

    await pool.query("UPDATE Conteos SET estado = 'Abierto' WHERE id = ?", [req.params.id]);
    
    // Broadcast state change
    const io = req.app.get('io');
    if (io) io.to(`session_${req.params.id}`).emit('session_state_changed', { estado: 'Abierto' });

    res.json({ success: true, estado: 'Abierto' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Error reopening session' });
  }
});

// ==========================================
// ADMIN CRUD ENDPOINTS
// ==========================================

// Helper for error catching
const catchDbError = (res, error) => {
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({ error: 'No se puede eliminar porque tiene productos o registros asociados.' });
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'El identificador ya existe.' });
  }
  console.error('DB Error:', error);
  return res.status(500).json({ error: 'Error interno del servidor de Base de Datos.' });
};

// --- SESIONES/CONTEOS ---
app.delete('/api/admin/sessions/:id', async (req, res) => {
  try {
    // Relying on ON DELETE CASCADE for Conteo_Items
    const [result] = await pool.query('DELETE FROM Conteos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada.' });
    }
    res.json({ message: 'Sesión eliminada completamente.' });
  } catch (err) {
    catchDbError(res, err);
  }
});

app.put('/api/admin/sessions/:id', async (req, res) => {
  const { sucursal_id, fecha_conteo, tipo } = req.body;
  try {
    await pool.query(
      'UPDATE Conteos SET sucursal_id = ?, fecha_conteo = ?, tipo = ? WHERE id = ?',
      [sucursal_id, fecha_conteo, tipo, req.params.id]
    );
    res.json({ message: 'Sesión actualizada' });
  } catch (err) { catchDbError(res, err); }
});

// --- RECETAS ---
app.get('/api/admin/recetas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Recetas');
    res.json(rows);
  } catch (err) { catchDbError(res, err); }
});

app.post('/api/admin/recetas', async (req, res) => {
  const { producto_padre_id, producto_hijo_id, cantidad_hijo } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Recetas (producto_padre_id, producto_hijo_id, cantidad_hijo) VALUES (?, ?, ?)',
      [producto_padre_id, producto_hijo_id, cantidad_hijo]
    );
    res.json({ id: result.insertId, producto_padre_id, producto_hijo_id, cantidad_hijo });
  } catch (err) { catchDbError(res, err); }
});

app.delete('/api/admin/recetas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Recetas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Receta eliminada' });
  } catch (err) { catchDbError(res, err); }
});

// --- SUCURSALES ---
app.get('/api/admin/sucursales', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Sucursales');
  res.json(rows);
});
app.post('/api/admin/sucursales', async (req, res) => {
  const { bodega, nombre, direccion } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO Sucursales (bodega, nombre, direccion) VALUES (?, ?, ?)', [bodega, nombre, direccion]);
    res.json({ id: result.insertId, bodega, nombre, direccion });
  } catch (err) { catchDbError(res, err); }
});
app.put('/api/admin/sucursales/:id', async (req, res) => {
  const { bodega, nombre, direccion } = req.body;
  try {
    await pool.query('UPDATE Sucursales SET bodega=?, nombre=?, direccion=? WHERE id=?', [bodega, nombre, direccion, req.params.id]);
    res.json({ message: 'Sucursal actualizada' });
  } catch (err) { catchDbError(res, err); }
});
app.delete('/api/admin/sucursales/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Sucursales WHERE id=?', [req.params.id]);
    res.json({ message: 'Eliminada' });
  } catch (err) { catchDbError(res, err); }
});

// --- UBICACIONES ---
app.get('/api/admin/ubicaciones', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Ubicaciones');
  res.json(rows);
});
app.post('/api/admin/ubicaciones', async (req, res) => {
  const { id, nombre, abierto, cerrado } = req.body;
  try {
    await pool.query('INSERT INTO Ubicaciones (id, nombre, abierto, cerrado) VALUES (?, ?, ?, ?)', [id, nombre, abierto, cerrado]);
    res.json({ id, nombre, abierto, cerrado });
  } catch (err) { catchDbError(res, err); }
});
app.put('/api/admin/ubicaciones/:id', async (req, res) => {
  const { nombre, abierto, cerrado } = req.body;
  try {
    await pool.query('UPDATE Ubicaciones SET nombre=?, abierto=?, cerrado=? WHERE id=?', [nombre, abierto, cerrado, req.params.id]);
    res.json({ message: 'Ubicacion actualizada' });
  } catch (err) { catchDbError(res, err); }
});
app.delete('/api/admin/ubicaciones/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Ubicaciones WHERE id=?', [req.params.id]);
    res.json({ message: 'Eliminada' });
  } catch (err) { catchDbError(res, err); }
});

// --- CATEGORIAS ---
app.get('/api/admin/categorias', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Categorias');
  res.json(rows);
});
app.post('/api/admin/categorias', async (req, res) => {
  const { nombre } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO Categorias (nombre) VALUES (?)', [nombre]);
    res.json({ id: result.insertId, nombre });
  } catch (err) { catchDbError(res, err); }
});
app.put('/api/admin/categorias/:id', async (req, res) => {
  const { nombre } = req.body;
  try {
    await pool.query('UPDATE Categorias SET nombre=? WHERE id=?', [nombre, req.params.id]);
    res.json({ message: 'Categoría actualizada' });
  } catch (err) { catchDbError(res, err); }
});
app.delete('/api/admin/categorias/:id', async (req, res) => {
  try {
    // We check if any products are using this category name (ItmsGrpNam)
    // Wait, DB doesn't have a strict foreign key for Category Name. Let's do a soft check.
    const [cat] = await pool.query('SELECT nombre FROM Categorias WHERE id=?', [req.params.id]);
    if (cat.length > 0) {
      const catName = cat[0].nombre;
      const [prods] = await pool.query('SELECT * FROM Productos WHERE ItmsGrpNam=?', [catName]);
      if (prods.length > 0) {
        return res.status(400).json({ error: 'No se puede eliminar porque tiene productos asociados.' });
      }
    }
    await pool.query('DELETE FROM Categorias WHERE id=?', [req.params.id]);
    res.json({ message: 'Eliminada' });
  } catch (err) { catchDbError(res, err); }
});

// --- PRODUCTOS ---
app.get('/api/admin/productos', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Productos');
  res.json(rows.map(r => {
    // MySQL 9 JSON column might return object or string depending on driver config
    let ubicacion = r.Ubicacion;
    if (typeof ubicacion === 'string') {
      try { ubicacion = JSON.parse(ubicacion); } catch(e){}
    }
    return { ...r, Ubicacion: ubicacion };
  }));
});
app.post('/api/admin/productos', async (req, res) => {
  const { articuloid, itemname, UnidadCompra, cantidadCompra, unidad_venta, cantidadventa, ItmsGrpNam, min, max, Ubicacion, es_producido } = req.body;
  try {
    const ubicacionValue = typeof Ubicacion === 'string' ? Ubicacion : JSON.stringify(Ubicacion || []);
    await pool.query(
      `INSERT INTO Productos (articuloid, itemname, UnidadCompra, cantidadCompra, unidad_venta, cantidadventa, ItmsGrpNam, Ubicacion, min, max, es_producido)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [articuloid, itemname, UnidadCompra, cantidadCompra, unidad_venta, cantidadventa, ItmsGrpNam, ubicacionValue, min, max, es_producido || 0]
    );
    res.json({ articuloid, itemname });
  } catch (err) { catchDbError(res, err); }
});
app.put('/api/admin/productos/:id', async (req, res) => {
  const { itemname, UnidadCompra, cantidadCompra, unidad_venta, cantidadventa, ItmsGrpNam, min, max, Ubicacion, es_producido } = req.body;
  try {
    const ubicacionValue = typeof Ubicacion === 'string' ? Ubicacion : JSON.stringify(Ubicacion || []);
    await pool.query(
      `UPDATE Productos SET itemname=?, UnidadCompra=?, cantidadCompra=?, unidad_venta=?, cantidadventa=?, ItmsGrpNam=?, min=?, max=?, Ubicacion=?, es_producido=? WHERE articuloid=?`,
      [itemname, UnidadCompra, cantidadCompra, unidad_venta, cantidadventa, ItmsGrpNam, min, max, ubicacionValue, es_producido || 0, req.params.id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (err) { catchDbError(res, err); }
});
app.delete('/api/admin/productos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Productos WHERE articuloid=?', [req.params.id]);
    res.json({ message: 'Eliminada' });
  } catch (err) { catchDbError(res, err); }
});

app.post('/api/admin/productos/:id/assign-location', async (req, res) => {
  const { locationId } = req.body;
  const productId = req.params.id;
  try {
    const [rows] = await pool.query('SELECT Ubicacion FROM Productos WHERE articuloid = ?', [productId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    
    let locations = rows[0].Ubicacion;
    if (typeof locations === 'string' && locations) {
      try { locations = JSON.parse(locations); } catch(e) { locations = []; }
    } else if (!locations) {
      locations = [];
    }
    
    // Ensure it's an array
    if (!Array.isArray(locations)) locations = [];

    // Check if location already assigned
    if (!locations.some(u => String(u.id) === String(locationId))) {
      locations.push({ id: Number(locationId), abierto: true, cerrado: true });
      await pool.query('UPDATE Productos SET Ubicacion = ? WHERE articuloid = ?', [JSON.stringify(locations), productId]);
    }
    
    res.json({ success: true, locations });
  } catch (err) { catchDbError(res, err); }
});

// --- USUARIOS ---
app.get('/api/admin/usuarios', async (req, res) => {
  const [rows] = await pool.query('SELECT id, nombre, pin_code, rol FROM Usuarios');
  res.json(rows);
});
app.post('/api/admin/usuarios', async (req, res) => {
  const { nombre, pin_code, rol } = req.body;
  try {
    const defaultRol = rol || 'Cajero';
    const [result] = await pool.query('INSERT INTO Usuarios (nombre, pin_code, rol) VALUES (?, ?, ?)', [nombre, pin_code, defaultRol]);
    res.json({ id: result.insertId, nombre, pin_code, rol: defaultRol });
  } catch (err) { catchDbError(res, err); }
});
app.put('/api/admin/usuarios/:id', async (req, res) => {
  const { nombre, pin_code, rol } = req.body;
  try {
    const defaultRol = rol || 'Cajero';
    await pool.query('UPDATE Usuarios SET nombre=?, pin_code=?, rol=? WHERE id=?', [nombre, pin_code, defaultRol, req.params.id]);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) { catchDbError(res, err); }
});
app.delete('/api/admin/usuarios/:id', async (req, res) => {
  try {
    // Setting ON DELETE SET NULL allows users to be removed without wiping sessions.
    await pool.query('DELETE FROM Usuarios WHERE id=?', [req.params.id]);
    res.json({ message: 'Usuario Eliminado' });
  } catch (err) { catchDbError(res, err); }
});

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_session', (sessionId) => {
    socket.join(`session_${sessionId}`);
  });
  socket.on('enter_location', (data) => {
    // data: { sessionId, locationId, userName }
    socket.to(`session_${data.sessionId}`).emit('user_entered_location', data);
  });
  socket.on('leave_location', (data) => {
    socket.to(`session_${data.sessionId}`).emit('user_left_location', data);
  });
  
  // Ledger events
  socket.on('item_added', (data) => {
    // data: the full row dict
    socket.to(`session_${data.conteo_id}`).emit('item_added_broadcast', data);
  });
  socket.on('item_deleted', (data) => {
    // data: { sessionId, itemId, locationId }
    socket.to(`session_${data.sessionId}`).emit('item_deleted_broadcast', data);
  });
});

// For any other route, send the React index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../web/dist/index.html'));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Subway Inventory API + Sockets listening on port ${PORT}`);
});
