import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const API_URL = `http://${window.location.hostname}:3005`;

function CrudTable({ endpoint, columns, primaryKey, title, availableReferences }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State for Create / Edit
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, isAlert: false, icon: '💡' });

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}${endpoint}`);
      if (!res.ok) throw new Error('Error fetching data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setErrorMsg('No se pudo cargar la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({});
    setIsEditing(true); // Treat creating as editing a blank form
  };

  const handleEditRow = (row) => {
    setFormData({ ...row });
    // In case of booleans returned from DB (0/1), convert to boolean for checkboxes
    const cleanForm = { ...row };
    columns.forEach(c => {
      if (c.type === 'boolean') {
        cleanForm[c.field] = Boolean(Number(row[c.field]));
      }
    });
    setFormData(cleanForm);
    setIsEditing(true);
  };

  const handleDeleteRow = (id) => {
    setModal({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.',
      icon: '⚠️',
      confirmText: 'Eliminar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}${endpoint}/${id}`, { method: 'DELETE' });
          const responseBody = await res.json();
          if (!res.ok) throw new Error(responseBody.error || 'Error al eliminar');
          fetchData();
        } catch (err) {
          setModal({ isOpen: true, title: 'Error', message: err.message, isAlert: true, icon: '❌' });
        }
      }
    });
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    try {
      const isCreate = !formData[primaryKey] || (primaryKey === 'articuloid' && data.findIndex(d => d.articuloid === formData.articuloid) === -1);
      
      const method = isCreate ? 'POST' : 'PUT';
      // Si es un POST para un id autogenerado, no pasa el ID en la URL. 
      // Si es PUT, o si es producto que su primary key la pasamos (articuloid) y ya existia.
      const url = isCreate 
        ? `${API_URL}${endpoint}` 
        : `${API_URL}${endpoint}/${formData[primaryKey]}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const responseBody = await res.json();
      if (!res.ok) throw new Error(responseBody.error || 'Error al guardar');
      
      setIsEditing(false);
      fetchData();
    } catch (err) {
      setModal({ isOpen: true, title: 'Error al Guardar', message: err.message, isAlert: true, icon: '❌' });
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div>Cargando tabla...</div>;

  return (
    <div className="crud-table-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>{title}</h2>
        {!isEditing && (
          <button 
            className="fab" 
            style={{position: 'static', padding: '0.5rem 1rem', width: 'auto', fontSize: '0.9rem'}}
            onClick={handleCreateNew}
          >
            + Añadir Nuevo
          </button>
        )}
      </div>

      {errorMsg && <p style={{color: 'red'}}>{errorMsg}</p>}

      {isEditing ? (
        <div className="card" style={{backgroundColor: 'var(--card-bg)', border: '1px solid var(--subway-green)'}}>
          <h3 style={{marginBottom: '1rem', color: 'var(--subway-green)'}}>{formData[primaryKey] ? 'Editar Registro' : 'Nuevo Registro'}</h3>
          <form onSubmit={handleSaveForm} style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            
            {columns.map(col => (
              <div key={col.field} style={{display: 'flex', flexDirection: 'column'}}>
                <label style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)'}}>{col.header}</label>
                
                {col.type === 'boolean' ? (
                  <input 
                    type="checkbox" 
                    checked={!!formData[col.field]} 
                    onChange={(e) => handleFormChange(col.field, e.target.checked)} 
                    style={{width: '20px', height: '20px', cursor: 'pointer'}}
                  />
                ) : col.type === 'select' ? (
                  <select 
                    value={formData[col.field] || ''}
                    onChange={(e) => handleFormChange(col.field, e.target.value)}
                    style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)'}}
                    required={col.required}
                  >
                    <option value="">Selecciona...</option>
                    {(availableReferences?.[col.field] || []).map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                ) : col.type === 'multiselect' ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto', background: 'var(--inner-bg)'}}>
                    {(availableReferences?.[col.field] || []).map(opt => {
                       const currentVals = formData[col.field] ? String(formData[col.field]).split(',').map(s=>s.trim()) : [];
                       const isChecked = currentVals.includes(String(opt.id));
                       return (
                         <label key={opt.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer'}}>
                           <input 
                             type="checkbox" 
                             checked={isChecked}
                             onChange={(e) => {
                               let newVals = [...currentVals].filter(Boolean);
                               if (e.target.checked && !newVals.includes(String(opt.id))) newVals.push(String(opt.id));
                               else if (!e.target.checked) newVals = newVals.filter(v => v !== String(opt.id));
                               handleFormChange(col.field, newVals.join(', '));
                             }}
                           />
                           {opt.label}
                         </label>
                       );
                    })}
                  </div>
                ) : col.type === 'location-config' ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto', background: 'var(--inner-bg)'}}>
                    {(availableReferences?.[col.field] || []).map(opt => {
                       let currentArr = [];
                       try {
                         if (Array.isArray(formData[col.field])) { currentArr = formData[col.field]; }
                         else if (typeof formData[col.field] === 'string') { currentArr = JSON.parse(formData[col.field]); }
                       } catch(e) { }

                       const conf = currentArr.find(c => String(c.id) === String(opt.id));
                       const isChecked = !!conf;
                       
                       const toggleMain = (e) => {
                         let newArr = [...currentArr];
                         if (e.target.checked && !conf) {
                           newArr.push({ id: String(opt.id), cerrado: true, abierto: true });
                         } else if (!e.target.checked) {
                           newArr = newArr.filter(c => String(c.id) !== String(opt.id));
                         }
                         handleFormChange(col.field, newArr);
                       };

                       const toggleProp = (prop, val) => {
                         let newArr = currentArr.map(c => {
                           if (String(c.id) === String(opt.id)) return { ...c, [prop]: val };
                           return c;
                         });
                         handleFormChange(col.field, newArr);
                       };

                       return (
                         <div key={opt.id} style={{display: 'flex', flexDirection: 'column', padding: '0.5rem', borderBottom: '1px solid #e2e8f0', gap: '0.5rem'}}>
                           <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer', margin: 0}}>
                             <input type="checkbox" checked={isChecked} onChange={toggleMain} />
                             {opt.label}
                           </label>
                           {isChecked && (
                             <div style={{display: 'flex', gap: '1rem', marginLeft: '1.5rem', fontSize: '0.85rem'}}>
                               <label style={{display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal'}}><input type="checkbox" checked={!!conf.cerrado} onChange={e => toggleProp('cerrado', e.target.checked)} /> Permite Cerrado</label>
                               <label style={{display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal'}}><input type="checkbox" checked={!!conf.abierto} onChange={e => toggleProp('abierto', e.target.checked)} /> Permite Abierto</label>
                             </div>
                           )}
                         </div>
                       );
                    })}
                  </div>
                ) : (
                  <input 
                    type={col.type === 'number' ? 'number' : 'text'}
                    value={formData[col.field] || ''}
                    onChange={(e) => handleFormChange(col.field, col.type === 'number' ? Number(e.target.value) : e.target.value)}
                    style={{padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)'}}
                    required={col.required}
                    disabled={col.disabledIfEdit && !!formData[primaryKey]} // Like an ID field that shouldn't change
                  />
                )}
              </div>
            ))}

            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <button type="submit" className="fab" style={{position: 'static', padding: '0.5rem 1rem', width: 'auto', fontSize: '0.9rem'}}>Guardar ✔</button>
              <button type="button" onClick={() => setIsEditing(false)} style={{padding: '0.5rem 1rem', background: 'var(--inner-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer'}}>Cancelar</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table className="summary-table" style={{width: '100%', minWidth: '600px'}}>
            <thead>
              <tr>
                {columns.map(col => <th key={col.field}>{col.header}</th>)}
                <th style={{textAlign: 'right'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row[primaryKey]}>
                  {columns.map(col => (
                    <td key={col.field}>
                      {col.type === 'boolean' 
                        ? (row[col.field] ? 'Sí' : 'No') 
                        : col.type === 'multiselect' 
                          ? (String(row[col.field] || '').split(',').map(v => {
                              const ref = availableReferences?.[col.field]?.find(r => String(r.id) === v.trim());
                              return ref ? ref.label : v;
                            }).join(', '))
                          : col.type === 'location-config'
                            ? (() => {
                                let arr = [];
                                try { arr = typeof row[col.field] === 'string' ? JSON.parse(row[col.field]) : (row[col.field] || []); } catch(e){}
                                return arr.map(c => {
                                  const name = availableReferences?.[col.field]?.find(r => String(r.id) === String(c.id))?.label || c.id;
                                  return `${name} (${c.cerrado?'📦':''}${c.abierto?'🌭':''})`;
                                }).join(', ');
                              })()
                          : (row[col.field] || '-')}
                    </td>
                  ))}
                  <td style={{textAlign: 'right'}}>
                    <button onClick={() => handleEditRow(row)} style={{background: 'transparent', border:'none', cursor:'pointer', fontSize:'1.2rem', marginRight: '10px'}}>✏️</button>
                    <button onClick={() => handleDeleteRow(row[primaryKey])} style={{background: 'transparent', border:'none', cursor:'pointer', fontSize:'1.2rem'}}>🗑️</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} style={{textAlign: 'center', padding: '2rem'}}>No hay registros en la base de datos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <Modal 
        {...modal} 
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}

export default CrudTable;
