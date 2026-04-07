import React, { useMemo, useState, useEffect } from 'react';
import ItemCounter from './ItemCounter';
import Modal from './common/Modal';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

function CountingArea({ location, products, allProducts, categories, onFinish, session, currentUser, socket, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [ledger, setLedger] = useState([]);
  
  // Quick Assignment states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);

  useEffect(() => {
    // 1. Fetch existing counts from DB for this room
    if (session?.id && location?.id) {
       fetch(`${API_URL}/sessions/${session.id}/locations/${location.id}/counts`)
         .then(r => r.json())
         .then(rows => {
            setLedger(rows || []);
         }).catch(e => console.error(e));
    }

    // 2. Setup Sockets
    if (socket && session && location && currentUser) {
      socket.emit('enter_location', { sessionId: session.id, locationId: location.id, userName: currentUser.nombre });
      
      const handleAdd = (data) => {
         if (String(data.ubicacion_id) === String(location.id)) {
            setLedger(prev => [data, ...prev]);
         }
      };
      
      const handleDelete = (data) => {
         if (String(data.locationId) === String(location.id)) {
            setLedger(prev => prev.filter(r => String(r.id) !== String(data.itemId)));
         }
      };

      const handleEdit = (data) => {
         if (String(data.locationId) === String(location.id)) {
            setLedger(prev => prev.map(r => {
               if(String(r.id) === String(data.itemId)) {
                 return { ...r, box: data.box, unit: data.unit };
               }
               return r;
             }));
         }
      };
      
      socket.on('item_added_broadcast', handleAdd);
      socket.on('item_deleted_broadcast', handleDelete);
      socket.on('item_edited_broadcast', handleEdit);

      return () => {
        socket.emit('leave_location', { sessionId: session.id, locationId: location.id, userName: currentUser.nombre });
        socket.off('item_added_broadcast', handleAdd);
        socket.off('item_deleted_broadcast', handleDelete);
        socket.off('item_edited_broadcast', handleEdit);
      };
    }
  }, [socket, session, location, currentUser]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'Todas' || p.ItmsGrpNam === selectedCategory;
      const matchSearch = (p.itemname || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.articuloid || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  const groupedProducts = useMemo(() => {
    const groups = {};
    filteredProducts.forEach(p => {
      const cat = p.ItmsGrpNam || 'Sin Categoría';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(p);
    });
    return groups;
  }, [filteredProducts]);

  const availableToAssign = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => {
      // Filter out products already in this location
      const uMap = Array.isArray(p.Ubicacion) ? p.Ubicacion : [];
      const alreadyHere = uMap.some(u => String(u.id) === String(location.id));
      if (alreadyHere) return false;

      // Filter by assignSearch
      const match = (p.itemname || '').toLowerCase().includes(assignSearch.toLowerCase()) || 
                    (p.articuloid || '').toLowerCase().includes(assignSearch.toLowerCase());
      return match;
    }).slice(0, 50); // Limit to 50 for performance
  }, [allProducts, location.id, assignSearch]);

  const handleAddItem = async (productId, tipo, cantidad) => {
     if (!session?.id) return;
     try {
       const res = await fetch(`${API_URL}/sessions/${session.id}/items`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           usuario_id: currentUser.id, 
           ubicacion_id: location.id, 
           producto_id: productId, 
           tipo, 
           cantidad 
         })
       });
       const newRow = await res.json();
       setLedger(prev => [newRow, ...prev]);
       if (socket) socket.emit('item_added', newRow);
     } catch(e) { console.error('Error logging add item', e); }
  };

  const handleDeleteItem = async (itemId) => {
     if (!session?.id) return;
     try {
       await fetch(`${API_URL}/sessions/${session.id}/items/${itemId}`, { method: 'DELETE' });
       setLedger(prev => prev.filter(r => String(r.id) !== String(itemId)));
       if (socket) socket.emit('item_deleted', { sessionId: session.id, locationId: location.id, itemId });
     } catch(e) { console.error('Error deleting item', e); }
  };

  const handleEditItem = async (itemId, newAmount, tipo) => {
     if (!session?.id) return;
     try {
       await fetch(`${API_URL}/sessions/${session.id}/items/${itemId}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ cantidad: newAmount, tipo })
       });
       
       const isBox = tipo === 'box';
       const cantCajas = isBox ? newAmount : 0;
       const cantSueltas = isBox ? 0 : newAmount;

       setLedger(prev => prev.map(r => {
         if (String(r.id) === String(itemId)) {
           return { ...r, box: cantCajas, unit: cantSueltas };
         }
         return r;
       }));
       if (socket) socket.emit('item_edited', { sessionId: session.id, locationId: location.id, itemId, box: cantCajas, unit: cantSueltas });
     } catch(e) { console.error('Error editing item', e); }
  };

  const handleAssignProduct = async (productId) => {
    setAssignLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/productos/${productId}/assign-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: location.id })
      });
      if (res.ok) {
        setAssignSearch('');
        if (onRefresh) await onRefresh();
      }
    } catch(e) {
      console.error("Error assigning product", e);
    } finally {
      setAssignLoading(false);
    }
  };

  const isLocked = session?.estado === 'Finalizado';
  const isAdmin = currentUser?.rol === 'Admin';

  if (!products || products.length === 0) {
    return (
      <div className="counting-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📦</div>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Área sin Productos</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '2rem' }}>
          No hay productos asignados a <strong>{location.nombre}</strong>.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '280px' }}>
          {isAdmin && (
            <button 
              className="fab" 
              onClick={() => setShowAssignModal(true)}
              style={{ position: 'static', width: '100%', background: 'var(--subway-green)', color: 'white', padding: '1rem' }}
            >
              🔍 Asignar Productos
            </button>
          )}
            <button 
              className="fab" 
              onClick={onFinish} 
              style={{ position: 'static', width: '100%', background: 'var(--inner-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '1rem' }}
            >
              ← Volver a Ubicaciones
            </button>
        </div>

        {showAssignModal && (
          <Modal 
            isOpen={true}
            title={`Asignar a ${location.nombre}`}
            onClose={() => setShowAssignModal(false)}
            showFooter={false}
          >
            <div style={{ padding: '1rem' }}>
              <input 
                type="text" 
                placeholder="Buscar producto a vincular..." 
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', marginBottom: '1rem', outline: 'none' }}
              />
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--inner-bg)' }}>
                {availableToAssign.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    {assignSearch ? 'No se encontraron más productos.' : 'Busca un producto para vincular.'}
                  </div>
                ) : (
                  availableToAssign.map(p => (
                    <div 
                      key={p.articuloid} 
                      onClick={() => !assignLoading && handleAssignProduct(p.articuloid)}
                      style={{ 
                        padding: '12px', 
                        borderBottom: '1px solid var(--border-color)', 
                        cursor: assignLoading ? 'default' : 'pointer', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        opacity: assignLoading ? 0.6 : 1,
                        background: 'var(--inner-bg)'
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{p.itemname}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.articuloid}</div>
                      </div>
                      <div style={{ color: 'var(--subway-green)', fontWeight: 'bold' }}>+ Vincular</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="counting-area" style={{paddingBottom: '80px'}}>
      
      {isLocked && (
        <div style={{background: 'var(--subway-yellow)', color: '#000', padding: '10px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: '70px', zIndex: 20}}>
          🔒 Inventario Finalizado (Solo Lectura)
        </div>
      )}
      
      <div style={{position: 'sticky', top: isLocked ? '110px' : '70px', background: 'var(--bg-color)', padding: '10px 0', zIndex: 10, borderBottom: '1px solid var(--border-color)', marginBottom: '1rem'}}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar producto en esta área..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{flex: 1, padding: '12px', fontSize: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none'}}
          />
          {isAdmin && (
            <button 
              onClick={() => setShowAssignModal(true)}
              style={{ padding: '0 15px', borderRadius: '8px', border: 'none', background: 'var(--subway-green)', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem' }}
              title="Añadir más productos a esta área"
            >
              +
            </button>
          )}
        </div>
        
        <div style={{display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'}}>
          <button 
            onClick={() => setSelectedCategory('Todas')}
            style={{padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)', background: selectedCategory === 'Todas' ? 'var(--subway-green)' : 'var(--card-bg)', color: selectedCategory === 'Todas' ? 'white' : 'var(--text-main)', whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 'bold'}}
          >
            Todas
          </button>
          
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)', background: selectedCategory === cat ? 'var(--subway-init)' : 'var(--card-bg)', color: selectedCategory === cat ? 'white' : 'var(--text-main)', whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 'bold'}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(groupedProducts).length === 0 && (
        <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
          No se encontraron coincidencias para "{searchTerm}".
        </div>
      )}
      
      {Object.keys(groupedProducts).map(catName => (
        <div key={catName} className="category-section">
          <div className="category-header">{catName}</div>
          <div>
            {groupedProducts[catName].map(product => (
              <ItemCounter 
                key={product.articuloid}
                product={product} 
                location={location} 
                ledgerRows={ledger.filter(r => r.producto_id === product.articuloid)}
                onAdd={handleAddItem}
                onDelete={handleDeleteItem}
                onEdit={handleEditItem}
                currentUser={currentUser}
                isLocked={isLocked}
                isExpanded={expandedProductId === product.articuloid}
                onToggle={() => setExpandedProductId(expandedProductId === product.articuloid ? null : product.articuloid)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="fab-container">
        <button className="fab" onClick={onFinish} style={{background: 'var(--text-muted)', color: 'white'}}>
          <span>← Volver a Ubicaciones</span>
        </button>
      </div>

      {showAssignModal && (
        <Modal 
          isOpen={true}
          title={`Gestionar productos en ${location.nombre}`}
          onClose={() => setShowAssignModal(false)}
          showFooter={false}
        >
          <div style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Busca un producto para añadirlo a esta ubicación.</p>
            <input 
              type="text" 
              placeholder="Ej. Gaseosa, Pan, Jamon..." 
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', marginBottom: '1rem', outline: 'none' }}
            />
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--inner-bg)' }}>
              {availableToAssign.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  {assignSearch ? 'No se encontraron más productos.' : 'Busca un producto para vincular.'}
                </div>
              ) : (
                availableToAssign.map(p => (
                  <div 
                    key={p.articuloid} 
                    onClick={() => !assignLoading && handleAssignProduct(p.articuloid)}
                    style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid var(--border-color)', 
                      cursor: assignLoading ? 'default' : 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      opacity: assignLoading ? 0.6 : 1,
                      background: 'var(--card-bg)'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{p.itemname}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.articuloid}</div>
                    </div>
                    <div style={{ color: 'var(--subway-green)', fontWeight: 'bold' }}>+ Vincular</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CountingArea;
