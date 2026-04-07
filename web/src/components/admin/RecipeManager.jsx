import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

function RecipeManager({ products, onRefresh }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Selection state
  const [selectedParentId, setSelectedParentId] = useState('');
  const [newIngredientId, setNewIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // New Produced Product Form
  const [showNewPadreForm, setShowNewPadreForm] = useState(false);
  const [newPadreName, setNewPadreName] = useState('');
  const [newPadreId, setNewPadreId] = useState('');
  const [isCreatingPadre, setIsCreatingPadre] = useState(false);
  
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', isAlert: true });
  
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    fetchRecipes();
    
    // Click outside listener
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/recetas`);
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      setErrorMsg('Error al cargar recetas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProducedProduct = async (e) => {
    e.preventDefault();
    if (!newPadreName || !newPadreId) return;

    setIsCreatingPadre(true);
    try {
      const res = await fetch(`${API_URL}/admin/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articuloid: newPadreId,
          itemname: newPadreName,
          UnidadCompra: 'UNIDAD',
          cantidadCompra: 1,
          unidad_venta: 'UNID',
          cantidadventa: 1,
          ItmsGrpNam: 'PRODUCTOS PRODUCIDOS',
          es_producido: 1,
          Ubicacion: []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear producto producido');

      setModal({ 
        isOpen: true, 
        title: '¡Éxito!', 
        message: `Producto "${newPadreName}" creado. Ahora asígnale ingredientes y no olvides asignarle UBICACIONES en la pestaña de Productos para poder contarlo.`, 
        isAlert: true,
        icon: '✨'
      });

      setNewPadreName('');
      setNewPadreId('');
      setShowNewPadreForm(false);
      setSelectedParentId(newPadreId); // Select it immediately
      
      if (onRefresh) onRefresh(true); // SILENT refresh - doesn't unmount
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: err.message, isAlert: true });
    } finally {
      setIsCreatingPadre(false);
    }
  };

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!selectedParentId || !newIngredientId || !quantity) return;

    if (selectedParentId === newIngredientId) {
      setModal({ isOpen: true, title: 'Error', message: 'Un producto no puede ser ingrediente de sí mismo.', isAlert: true });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/recetas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_padre_id: selectedParentId,
          producto_hijo_id: newIngredientId,
          cantidad_hijo: Number(quantity)
        })
      });

      if (!res.ok) throw new Error('Error al añadir ingrediente');
      
      setNewIngredientId('');
      setQuantity('');
      setIngredientSearchTerm(''); // Clear search
      fetchRecipes();
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: err.message, isAlert: true });
    }
  };

  const handleDeleteIngredient = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/recetas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      fetchRecipes();
    } catch (err) {
      setModal({ isOpen: true, title: 'Error', message: err.message, isAlert: true });
    }
  };

  const producedProducts = products.filter(p => p.es_producido);
  const baseIngredients = products.filter(p => 
    !p.es_producido && 
    (p.itemname.toLowerCase().includes(ingredientSearchTerm.toLowerCase()) || 
     p.articuloid.toLowerCase().includes(ingredientSearchTerm.toLowerCase()))
  );

  const currentRecipeIngredients = recipes.filter(r => r.producto_padre_id === selectedParentId);
  const selectedParentName = products.find(p => p.articuloid === selectedParentId)?.itemname || 'Selecciona un producto';

  if (loading) return <div className="card">Cargando módulo de recetas...</div>;

  return (
    <div className="recipe-manager animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="card" style={{ 
        borderLeft: '6px solid var(--subway-green)', 
        marginBottom: '2rem',
        padding: '2rem',
        background: 'var(--card-bg)',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap'}}>
          <div>
            <h2 style={{fontSize: '1.75rem', color: 'var(--subway-green)', marginBottom: '0.5rem'}}>🛠️ Gestión de Recetas (BOM)</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              Configura la composición de tus productos procesados. Vincula insumos base a productos de producción propia.
            </p>
          </div>
          <button 
            className="fab" 
            style={{
              position: 'static', 
              padding: '0.85rem 1.5rem', 
              width: 'auto', 
              background: showNewPadreForm ? '#ef4444' : 'var(--subway-yellow)', 
              color: showNewPadreForm ? 'white' : '#1a1a1a',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
            onClick={() => setShowNewPadreForm(!showNewPadreForm)}
          >
            {showNewPadreForm ? '✖ Cancelar' : '✨ Crear Producto Producido Nuevo'}
          </button>
        </div>

        {showNewPadreForm && (
          <div className="card animate-slide-up" style={{marginTop: '2rem', background: 'var(--card-bg)', border: '2px solid var(--subway-yellow)', boxShadow: 'var(--shadow-lg)'}}>
            <h3 style={{marginBottom: '1.25rem', color: 'var(--subway-green)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <span>🆕</span> Nuevo Artículo de Producción
            </h3>
            <form onSubmit={handleCreateProducedProduct} style={{display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end'}}>
              <div style={{flex: 2, minWidth: '250px'}}>
                <label style={{fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block'}}>Nombre del Producto (ej. Atún Preparado)</label>
                <input 
                  type="text" 
                  value={newPadreName} 
                  onChange={e => setNewPadreName(e.target.value)} 
                  required 
                  className="modal-input"
                  style={{marginTop: 0, textAlign: 'left', letterSpacing: 'normal', fontSize: '1rem'}}
                  placeholder="Nombre descriptivo..."
                />
              </div>
              <div style={{flex: 1, minWidth: '180px'}}>
                <label style={{fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block'}}>Código ID Independiente</label>
                <input 
                  type="text" 
                  value={newPadreId} 
                  onChange={e => setNewPadreId(e.target.value)} 
                  required 
                  className="modal-input"
                  style={{marginTop: 0, textAlign: 'left', letterSpacing: '1px', fontSize: '1rem', textTransform: 'uppercase', background: 'var(--input-bg)', color: 'var(--text-main)'}}
                  placeholder="ej. P-ATUN-01"
                />
              </div>
              <button type="submit" className="fab" disabled={isCreatingPadre} style={{position: 'static', padding: '0.85rem 2rem', width: 'auto', fontSize: '1rem', background: 'var(--subway-green)'}}>
                {isCreatingPadre ? 'Procesando...' : 'Guardar Producto'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Step 1: Select Parent */}
        <section>
          <div className="card" style={{position: 'sticky', top: '1rem'}}>
            <h3 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--subway-green)'}}>
              <span style={{background: 'var(--subway-green)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}>1</span>
              Seleccionar Producido
            </h3>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>¿Qué receta deseas editar?</label>
              <select 
                value={selectedParentId} 
                onChange={(e) => setSelectedParentId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: '2px solid var(--border-color)', 
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.25rem',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)'
                }}
              >
                <option value="">-- Elige un producto producido --</option>
                {producedProducts.map(p => (
                  <option key={p.articuloid} value={p.articuloid}>{p.itemname} ({p.articuloid})</option>
                ))}
              </select>

              {producedProducts.length === 0 && (
                <p style={{fontSize: '0.85rem', color: '#ef4444', marginTop: '1rem', fontStyle: 'italic'}}>
                  No hay productos producidos creados aún. Usa el botón superior para crear uno.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Step 2: Ingredients List & Form */}
        <section>
          {!selectedParentId ? (
            <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)', border: '3px dashed var(--border-color)', borderRadius: '24px', background: 'transparent' }}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🍳</div>
              <h3 style={{color: 'var(--text-muted)'}}>Selecciona un producto a la izquierda</h3>
              <p>Podrás ver su receta actual y añadir nuevos ingredientes.</p>
            </div>
          ) : (
            <div className="card animate-pop" style={{padding: '2rem', overflow: 'visible', paddingBottom: showDropdown ? '18rem' : '2rem', transition: 'padding-bottom 0.2s ease'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem'}}>
                <div>
                  <span style={{fontSize: '0.75rem', fontWeight: '900', color: 'var(--subway-green)', textTransform: 'uppercase', letterSpacing: '1px'}}>Editando Receta de:</span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>{selectedParentName}</h3>
                </div>
                <div style={{background: 'var(--inner-bg)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid var(--border-color)', color: 'var(--text-main)'}}>
                  ID: {selectedParentId}
                </div>
              </div>
              
              <div style={{ marginBottom: '2.5rem' }}>
                <table className="summary-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{background: 'transparent'}}>
                      <th style={{padding: '0.5rem 1rem', textAlign: 'left', color: 'var(--text-muted)'}}>Ingrediente (Insumo)</th>
                      <th style={{padding: '0.5rem 1rem', textAlign: 'left', color: 'var(--text-muted)'}}>Cantidad x Unidad</th>
                      <th style={{padding: '0.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)'}}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecipeIngredients.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--inner-bg)', borderRadius: '16px' }}>
                          Este producto aún no tiene ingredientes asociados.
                        </td>
                      </tr>
                    ) : (
                      currentRecipeIngredients.map(r => {
                        const child = products.find(p => p.articuloid === r.producto_hijo_id);
                        return (
                          <tr key={r.id} style={{background: 'var(--card-bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--border-color)'}}>
                            <td style={{padding: '1rem', borderRadius: '12px 0 0 12px'}}>
                              <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{child?.itemname}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{r.producto_hijo_id}</div>
                            </td>
                            <td style={{padding: '1rem', fontWeight: '600', color: 'var(--text-main)'}}>
                              {Number(r.cantidad_hijo).toFixed(4)} <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{child?.unidad_venta}</span>
                            </td>
                            <td style={{ textAlign: 'center', padding: '1rem', borderRadius: '0 12px 12px 0' }}>
                              <button 
                                onClick={() => handleDeleteIngredient(r.id)}
                                className="stepper-btn"
                                style={{ width: '36px', height: '36px', background: '#fee2e2', color: '#ef4444' }}
                                title="Eliminar ingrediente"
                              >🗑️</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ background: 'var(--inner-bg)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', overflow: 'visible' }}>
                <h4 style={{marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{fontSize: '1.25rem'}}>➕</span> Añadir Ingrediente a la Receta
                </h4>
                <form onSubmit={handleAddIngredient} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: 3, minWidth: '220px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Insumo Base</label>
                    <div className="searchable-select-container" ref={dropdownRef}>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" 
                          placeholder="🔍 Buscar insumo base..."
                          value={ingredientSearchTerm}
                          onFocus={() => {
                            setShowDropdown(true);
                            // If focused and an item was already selected, we might want to let them re-search
                            // but keep the name until they type something else.
                          }}
                          onChange={e => {
                            setIngredientSearchTerm(e.target.value);
                            setNewIngredientId(''); // Clear selection on type
                            setShowDropdown(true);
                          }}
                          style={{ 
                            width: '100%', 
                            padding: '1rem', 
                            paddingRight: '3rem',
                            borderRadius: '14px', 
                            border: `2px solid ${newIngredientId ? 'var(--subway-green)' : 'var(--border-color)'}`, 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            transition: 'all 0.2s ease'
                          }}
                        />
                        
                        {/* Action Icons */}
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {newIngredientId && (
                            <button 
                              type="button"
                              onClick={() => { setNewIngredientId(''); setIngredientSearchTerm(''); setShowDropdown(true); }}
                              style={{ background: 'var(--inner-bg)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-main)' }}
                            >✖</button>
                          )}
                          <div style={{ 
                            width: '0', 
                            height: '0', 
                            borderLeft: '5px solid transparent', 
                            borderRight: '5px solid transparent', 
                            borderTop: `6px solid ${showDropdown ? 'var(--subway-green)' : 'var(--text-muted)'}`,
                            transform: showDropdown ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                          }} onClick={() => setShowDropdown(!showDropdown)}></div>
                        </div>
                      </div>
                      
                      {showDropdown && (
                        <div className="search-options-list animate-slide-up" style={{ marginTop: '8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                          <div style={{ padding: '8px 15px', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--inner-bg)', borderBottom: '1px solid var(--border-color)', fontWeight: '800' }}>
                            {ingredientSearchTerm ? `RESULTADOS (${baseIngredients.length})` : 'TODOS LOS INSUMOS'}
                          </div>
                          {baseIngredients.length === 0 ? (
                            <div className="search-option-item" style={{color: '#94a3b8', textAlign: 'center', padding: '2rem'}}>No se encontraron resultados para "{ingredientSearchTerm}"</div>
                          ) : (
                            baseIngredients.map(p => (
                              <div 
                                key={p.articuloid} 
                                className="search-option-item"
                                onClick={() => {
                                  setNewIngredientId(p.articuloid);
                                  setIngredientSearchTerm(p.itemname);
                                  setShowDropdown(false);
                                }}
                              >
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                  <span style={{fontWeight: '700', color: 'var(--text-main)'}}>{p.itemname}</span>
                                  <span style={{fontSize: '0.65rem', background: 'var(--inner-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '4px'}}>{p.articuloid}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Cantidad</label>
                    <input 
                      type="number" 
                      step="0.0001"
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)} 
                      required 
                      placeholder="0.00"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <button type="submit" className="fab" style={{ position: 'static', padding: '0.75rem 2rem', width: 'auto', fontSize: '0.95rem', background: 'var(--subway-green)' }}>
                    Agregar
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
        isAlert={true}
        icon="⚠️"
      />
    </div>
  );
}

export default RecipeManager;
