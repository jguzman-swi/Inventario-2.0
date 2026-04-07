import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';

const API_URL = `http://${window.location.hostname}:3005/api`;

function SessionSelector({ branches, onSessionSelected, currentUser }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Form (New/Edit) State
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState('Diario');
  const [sucursalId, setSucursalId] = useState('');
  
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sessions`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setErrorMsg('No se pudieron cargar los conteos activos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setProcessing(true);

    if (!sucursalId) {
      setErrorMsg('Selecciona una sucursal.');
      setProcessing(false);
      return;
    }

    const payload = {
      sucursal_id: sucursalId,
      fecha_conteo: fecha,
      tipo: tipo
    };

    try {
      const url = editingSession 
        ? `${API_URL}/admin/sessions/${editingSession.id}`
        : `${API_URL}/sessions`;
      
      const method = editingSession ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Error en la operación');
      }

      if (editingSession) {
        setEditingSession(null);
        fetchSessions();
      } else {
        onSessionSelected(json);
      }
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteSession = async (session) => {
    if (!window.confirm(`¿Estás seguro de eliminar el inventario "${session.tipo}" de ${session.sucursal_nombre}? Se borrarán TODOS los conteos asociados.`)) {
       return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/admin/sessions/${session.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Error al eliminar');
      }
      fetchSessions();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const startEdit = (e, session) => {
    e.stopPropagation();
    setEditingSession(session);
    setSucursalId(session.sucursal_id);
    setTipo(session.tipo);
    // Format date for input: '2026-03-31'
    setFecha(session.fecha_conteo.split('T')[0]);
  };

  const isAdmin = currentUser?.rol === 'Admin';
  const today = new Date().toISOString().split('T')[0];
  const todaysSessions = sessions.filter(s => s.fecha_conteo && s.fecha_conteo.startsWith(today));

  // Console log for debugging permissions if needed
  useEffect(() => {
    if (currentUser) {
      console.log(`Current user session view: ${currentUser.nombre} (${currentUser.rol}), isAdmin: ${isAdmin}`);
    }
  }, [currentUser, isAdmin]);

  return (
    <div className="session-selector">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Sesiones de Inventario</h2>
      
      {errorMsg && (
        <div className="card" style={{backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', marginBottom: '1rem'}}>
          ⚠️ {errorMsg}
        </div>
      )}

      {(showNewForm || editingSession) ? (
        <div className="card" style={{ border: '2px solid var(--subway-green)' }}>
          <h3>{editingSession ? 'Editar Inventario' : 'Iniciar Nuevo Conteo'}</h3>
          <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <label>Fecha de Conteo</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc'}} />
            </div>

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <label>Tipo de Inventario</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)} style={{padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc'}}>
                <option value="Diario">Diario</option>
                <option value="Por corte">Por corte</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensual">Mensual</option>
                <option value="Auditable">Auditable</option>
              </select>
            </div>

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <label>Sucursal</label>
              <select value={sucursalId} onChange={e => setSucursalId(e.target.value)} required style={{padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc'}}>
                <option value="">Selecciona una sucursal...</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <button type="submit" className="fab" style={{position: 'static', padding: '0.75rem', width: '100%'}} disabled={processing}>
                {processing ? 'Procesando...' : (editingSession ? 'Guardar Cambios' : 'Crear y Entrar')}
              </button>
              <button 
                type="button" 
                onClick={() => { setShowNewForm(false); setEditingSession(null); }} 
                style={{padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--inner-bg)', color: 'var(--text-main)', width: '100%', cursor: 'pointer', fontWeight: 'bold'}}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {isAdmin && (
            <button 
              className="fab animate-pop" 
              style={{ position: 'static', width: '100%', padding: '1rem', marginBottom: '2rem', fontSize: '1.2rem'}}
              onClick={() => {
                setEditingSession(null);
                setSucursalId('');
                setTipo('Diario');
                setFecha(today);
                setShowNewForm(true);
              }}
            >
              + Crear Nuevo Inventario
            </button>
          )}

          <h3 style={{marginBottom: '1rem', color: 'var(--text-muted)'}}>Abiertos para Hoy ({today})</h3>
          
          {loading ? (
            <p>Cargando sesiones...</p>
          ) : todaysSessions.length === 0 ? (
            <div className="card" style={{textAlign: 'center', color: 'var(--text-muted)'}}>
              No hay inventarios creados para la fecha de hoy. Crea uno nuevo arriba.
            </div>
          ) : (
            <div className="grid">
              {todaysSessions.map(session => (
                <div key={session.id} className="card card-hover" onClick={() => onSessionSelected(session)} style={{cursor: 'pointer', borderLeft: '4px solid var(--subway-yellow)', position: 'relative'}}>
                  <div className="session-card-header">
                    <h3 style={{color: 'var(--text-main)', margin: '0 0 0.5rem 0'}}>{session.tipo}</h3>
                    <div style={{display: 'flex', gap: '5px', alignItems: 'flex-start'}}>
                      {isAdmin && (
                        <div style={{display: 'flex', gap: '4px', marginRight: '8px'}}>
                          <button 
                            className="action-btn edit" 
                            onClick={(e) => startEdit(e, session)}
                            style={{padding: '4px 8px'}}
                            title={session.estado === 'Finalizado' ? 'Editar parámetros (Atención: Sesión Finalizada)' : 'Editar parámetros'}
                          >✏️</button>
                          <button 
                            className="action-btn delete" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteSession(session); }}
                            style={{padding: '4px 8px'}}
                            title="Eliminar sesión"
                          >🗑️</button>
                        </div>
                      )}
                      <span style={{fontSize: '0.8rem', background: 'var(--inner-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold'}}>{session.estado}</span>
                    </div>
                  </div>
                  <p style={{margin: '0', color: 'var(--text-muted)', fontSize: '0.9rem'}}>📍 {session.sucursal_nombre}</p>
                  <div style={{marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span style={{color: 'var(--subway-green)', fontWeight: 'bold'}}>Entrar a contar →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sessions.length > todaysSessions.length && (
            <div style={{marginTop: '2rem'}}>
              <h3 style={{marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>Sesiones Anteriores (Histórico)</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {sessions.filter(s => !s.fecha_conteo || !s.fecha_conteo.startsWith(today)).map(session => (
                  <div key={session.id} className="card card-hover history-item" onClick={() => onSessionSelected(session)} style={{cursor: 'pointer', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1}}>
                      <span style={{fontWeight: 'bold'}}>{session.tipo}</span> - <span style={{fontSize: '0.85rem'}}>{session.sucursal_nombre}</span>
                    </div>
                    
                    <div className="history-meta">
                      {isAdmin && (
                        <div style={{display: 'flex', gap: '4px'}}>
                          <button 
                            onClick={(e) => startEdit(e, session)} 
                            className="action-btn edit" 
                            style={{padding: '2px 6px', fontSize: '0.9rem'}}
                            title={session.estado === 'Finalizado' ? 'Editar parámetros (Histórico/Finalizada)' : 'Editar'}
                          >✏️</button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteSession(session); }} 
                            className="action-btn delete" 
                            style={{padding: '2px 6px', fontSize: '0.9rem'}}
                          >🗑️</button>
                        </div>
                      )}
                      <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{session.fecha_conteo?.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SessionSelector;
