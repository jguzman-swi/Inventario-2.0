import React, { useState } from 'react';
import Modal from './common/Modal';

function ItemCounter({ product, location, ledgerRows = [], onAdd, onDelete, onEdit, currentUser, isLocked, isExpanded, onToggle }) {
  const [boxInput, setBoxInput] = useState('');
  const [unitInput, setUnitInput] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', isAlert: true, icon: '⚠️' });
  
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const boxSum = ledgerRows.reduce((acc, row) => acc + Number(row.box), 0);
  const unitSum = ledgerRows.reduce((acc, row) => acc + Number(row.unit), 0);
  
  const mult = product.cantidadCompra || 1;
  const total = (boxSum * mult) + unitSum;

  let uMap = [];
  try { uMap = typeof product.Ubicacion === 'string' ? JSON.parse(product.Ubicacion) : (product.Ubicacion || []); } catch(e){}
  const locConf = uMap.find(u => String(u.id) === String(location.id)) || { cerrado: false, abierto: false };

  const stepInput = (type, delta) => {
    const isBox = type === 'box';
    const valStr = isBox ? boxInput : unitInput;
    const setFn = isBox ? setBoxInput : setUnitInput;

    if (isLocked) return;
    if (!valStr) {
      setFn(delta > 0 ? "1" : "0");
      return;
    }

    const current = parseFloat(valStr) || 0;
    let step = 1;
    let decimalPlaces = 0;
    if (valStr.includes('.')) {
      decimalPlaces = valStr.split('.')[1].length;
      step = Math.pow(10, -decimalPlaces);
    }
    
    const next = Math.max(0, current + (delta * step));
    const nextStr = decimalPlaces > 0 ? next.toFixed(decimalPlaces) : next.toString();
    setFn(nextStr);
  };

  const handleSaveToLedger = (type) => {
    if (isLocked) return;
    const valStr = type === 'box' ? boxInput : unitInput;
    const val = parseFloat(valStr);
    
    if (isNaN(val) || val === 0) return;
    
    if (val < 0) {
      setModal({ isOpen: true, title: 'Cantidad Inválida', message: 'No se permiten cantidades negativas en el inventario.', isAlert: true, icon: '🚫' });
      return;
    }
    
    onAdd(product.articuloid, type, val);
    if (type === 'box') setBoxInput('');
    else setUnitInput('');
  };

  const startEdit = (row) => {
    if (isLocked) return;
    setEditingRowId(row.id);
    const amount = Number(row.box) > 0 ? row.box : row.unit;
    setEditValue(amount);
  };

  const saveEdit = (row) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) {
      setModal({ isOpen: true, title: 'Cantidad Inválida', message: 'No se permiten cantidades negativas en el inventario.', isAlert: true, icon: '🚫' });
      return;
    }
    const isBox = Number(row.box) > 0;
    onEdit(row.id, val, isBox ? 'box' : 'unit');
    setEditingRowId(null);
  };

  const formatDate = (dateStr) => {
     if(!dateStr) return '';
     const d = new Date(dateStr);
     return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <>
      <div className={`product-item ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="product-header" onClick={onToggle}>
          <div className="product-info-summary">
            <h4>{product.itemname}</h4>
            <p>ID: {product.articuloid} | {product.UnidadCompra}</p>
          </div>
          <div className="product-status-summary">
            <div className="total-badge">
              <span className="label">TOTAL:</span>
              <span className="value">{total} {product.unidad_venta}</span>
            </div>
            <span className={`expand-icon ${isExpanded ? 'active' : ''}`}>▼</span>
          </div>
        </div>
        
        <div className="product-content">
          <div className="counter-group-container">
            {location.cerrado && locConf.cerrado && (
              <div className="counter-group">
                <div className="counter-label">
                  <span>📦 Cerrado <span className="multiplier">x{mult} {product.unidad_venta}</span></span>
                  <span style={{fontWeight: '900', color: 'var(--subway-green)'}}>SUMADO: {boxSum}</span>
                </div>
                
                <div style={{display: 'flex', gap: '10px', width: '100%', alignItems: 'center'}}>
                  <div className="counter-stepper">
                    <button onClick={(e) => { e.stopPropagation(); stepInput('box', -1); }} disabled={isLocked} className="stepper-btn">－</button>
                    <input 
                      type="number" step="any" placeholder="0" value={boxInput} disabled={isLocked}
                      onChange={(e) => setBoxInput(e.target.value)} 
                      onKeyDown={(e) => { if(e.key === 'Enter') handleSaveToLedger('box'); }}
                      className="counter-input"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={(e) => { e.stopPropagation(); stepInput('box', 1); }} disabled={isLocked} className="stepper-btn">＋</button>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleSaveToLedger('box'); }} disabled={isLocked} className="premium-save-btn">✓</button>
                </div>
              </div>
            )}

            {location.abierto && locConf.abierto && (
              <div className="counter-group">
                <div className="counter-label">
                  <span>🌭 Abierto <span className="multiplier">x1 {product.unidad_venta}</span></span>
                  <span style={{fontWeight: '900', color: 'var(--subway-green)'}}>SUMADO: {unitSum}</span>
                </div>
                
                <div style={{display: 'flex', gap: '10px', width: '100%', alignItems: 'center'}}>
                  <div className="counter-stepper">
                    <button onClick={(e) => { e.stopPropagation(); stepInput('unit', -1); }} disabled={isLocked} className="stepper-btn">－</button>
                    <input 
                      type="number" step="any" placeholder="0" value={unitInput} disabled={isLocked}
                      onChange={(e) => setUnitInput(e.target.value)} 
                      onKeyDown={(e) => { if(e.key === 'Enter') handleSaveToLedger('unit'); }}
                      className="counter-input"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={(e) => { e.stopPropagation(); stepInput('unit', 1); }} disabled={isLocked} className="stepper-btn">＋</button>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleSaveToLedger('unit'); }} disabled={isLocked} className="premium-save-btn">✓</button>
                </div>
              </div>
            )}
          </div>

          {ledgerRows.length > 0 && (
             <div className="ledger-card-container">
                {ledgerRows.map(row => {
                   const isBox = Number(row.box) > 0;
                   const amount = isBox ? row.box : row.unit;
                   return (
                      <div key={row.id} className="ledger-item" onClick={(e) => e.stopPropagation()}>
                         <div className="ledger-meta">
                            <div className={`ledger-badge ${isBox ? 'box' : 'unit'}`}>
                               {isBox ? '📦 Cerrado' : '🌭 Abierto'}
                            </div>
                            <div className="ledger-user-info">
                               👤 {row.userName} {row.timestamp ? `· ${formatDate(row.timestamp)}` : ''}
                            </div>
                         </div>
                         <div className="ledger-qty-actions">
                            {editingRowId === row.id ? (
                               <div className="edit-actions">
                                  <input 
                                    type="number" step="any" autoFocus value={editValue} 
                                    onChange={e => setEditValue(e.target.value)} 
                                    onKeyDown={e => { if(e.key === 'Enter') saveEdit(row); }}
                                    className="edit-input" style={{width: '60px'}}
                                  />
                                  <button onClick={() => saveEdit(row)} className="action-btn edit">✓</button>
                                  <button onClick={() => setEditingRowId(null)} className="action-btn delete">✕</button>
                               </div>
                            ) : (
                               <>
                                  <div className="ledger-qty">
                                     {amount > 0 ? `+${amount}` : amount}
                                  </div>
                                  {!isLocked && (
                                    <div style={{display: 'flex', gap: '4px'}}>
                                      <button onClick={() => startEdit(row)} className="action-btn edit" title="Editar">✏️</button>
                                      <button onClick={() => onDelete(row.id)} className="action-btn delete" title="Eliminar">🗑️</button>
                                    </div>
                                  )}
                               </>
                            )}
                         </div>
                      </div>
                   );
                })}
             </div>
          )}

          <div className="product-total">
            <span>Gran Neto Final:</span>
            <span className="amount">{total} {product.unidad_venta}</span>
          </div>
        </div>
      </div>
      
      <Modal 
        {...modal} 
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} 
      />
    </>
  );
}

export default ItemCounter;
