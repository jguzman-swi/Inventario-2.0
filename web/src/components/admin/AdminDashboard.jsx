import React, { useState } from 'react';
import CrudTable from './CrudTable';
import RecipeManager from './RecipeManager';

function AdminDashboard({ onExit, inventoryData, onRefresh }) {
  const [activeTab, setActiveTab] = useState('sucursales');

  const tabs = [
    { id: 'sucursales', label: 'Sucursales' },
    { id: 'ubicaciones', label: 'Ubicaciones' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'productos', label: 'Productos' },
    { id: 'usuarios', label: 'Cajeros y Admin (Usuarios)' },
    { id: 'recetas', label: 'Recetas (BOM)' },
  ];

  return (
    <div className="admin-dashboard">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
        <h2>Panel de Mantenimiento</h2>
        <button 
          onClick={onExit} 
          style={{padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
        >
          Volver a Inicio
        </button>
      </div>

      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === t.id ? 'var(--subway-green)' : 'var(--card-bg)',
              color: activeTab === t.id ? 'white' : 'var(--text-main)',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: activeTab === t.id ? 'var(--shadow)' : 'none',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'sucursales' && (
        <CrudTable 
           title="Gestión de Sucursales"
           endpoint="/api/admin/sucursales"
           primaryKey="id"
           columns={[
             { field: 'bodega', header: 'Código de Bodega', type: 'text' },
             { field: 'nombre', header: 'Nombre', type: 'text', required: true },
             { field: 'direccion', header: 'Dirección', type: 'text' }
           ]}
        />
      )}

      {activeTab === 'ubicaciones' && (
        <CrudTable 
           title="Gestión de Ubicaciones"
           endpoint="/api/admin/ubicaciones"
           primaryKey="id"
           columns={[
             { field: 'id', header: 'ID (Número/Texto)', type: 'text', required: true, disabledIfEdit: true },
             { field: 'nombre', header: 'Nombre', type: 'text', required: true },
             { field: 'cerrado', header: 'Permite Contar Cerrado (Cajas)', type: 'boolean' },
             { field: 'abierto', header: 'Permite Contar Abierto (Suelto)', type: 'boolean' }
           ]}
        />
      )}

      {activeTab === 'categorias' && (
        <CrudTable 
           title="Gestión de Categorías"
           endpoint="/api/admin/categorias"
           primaryKey="id"
           columns={[
             { field: 'nombre', header: 'Nombre', type: 'text', required: true },
           ]}
        />
      )}

      {activeTab === 'productos' && (
        <CrudTable 
           title="Gestión de Productos"
           endpoint="/api/admin/productos"
           primaryKey="articuloid"
           availableReferences={{
             Ubicacion: inventoryData?.ubicaciones?.map(u => ({id: String(u.id), label: u.nombre})) || []
           }}
           columns={[
             { field: 'articuloid', header: 'ID Artículo', type: 'text', required: true, disabledIfEdit: true },
             { field: 'itemname', header: 'Nombre del Producto', type: 'text', required: true },
             { field: 'ItmsGrpNam', header: 'Categoría (Nombre de Categoría)', type: 'text' },
             { field: 'Ubicacion', header: 'Configuración Extensa por Ubicaciones', type: 'location-config' },
             { field: 'UnidadCompra', header: 'Unidad de Compra (ej. CAJA)', type: 'text' },
             { field: 'cantidadCompra', header: 'Piezas por Empaque Cerrado', type: 'number', required: true },
             { field: 'unidad_venta', header: 'Unidad de Venta (ej. PZA)', type: 'text' },
           ]}
        />
      )}

      {activeTab === 'usuarios' && (
        <CrudTable 
           title="Gestión de Empleados y Administradores"
           endpoint="/api/admin/usuarios"
           primaryKey="id"
           availableReferences={{
             rol: [{id: 'Cajero', label: 'Cajero Normal'}, {id: 'Admin', label: 'Administrador Maestro'}]
           }}
           columns={[
             { field: 'nombre', header: 'Nombre Completo', type: 'text', required: true },
             { field: 'pin_code', header: 'PIN (4 dígitos)', type: 'text', required: true },
             { field: 'rol', header: 'Rol del Sistema', type: 'select', required: true }
           ]}
        />
      )}

      {activeTab === 'recetas' && (
        <RecipeManager 
           products={inventoryData?.productos || []}
           onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
