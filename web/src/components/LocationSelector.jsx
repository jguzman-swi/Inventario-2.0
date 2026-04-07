import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';

const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:3000/api`;

function LocationSelector({ locations, onSelect, counts = {}, session, socket, onFinishSession }) {
  const [dbProgress, setDbProgress] = useState([]);
  const [liveUsers, setLiveUsers] = useState({});
  const [modal, setModal] = useState({ isOpen: false, type: 'confirm', title: '', message: '', onConfirm: () => {}, icon: '💡' });

  const fetchProgress = () => {
    if (!session?.id) return;
    fetch(`${API_URL}/sessions/${session.id}/progress`)
      .then(r => r.json())
      .then(d => setDbProgress(d))
      .catch(e => console.error("Error fetching progress", e));
  };

  const handleFinish = () => {
    setModal({
      isOpen: true,
      title: 'Finalizar Inventario',
      message: '¿Estás seguro de finalizar el inventario? Se bloqueará la edición para todos los dispositivos.',
      icon: '🔒',
      confirmText: 'Sí, Finalizar',
      onConfirm: async () => {
        try {
          await fetch(`${API_URL}/sessions/${session.id}/finish`, { method: 'POST' });
        } catch (e) {
          console.error(e);
          setModal({ isOpen: true, title: 'Error', message: 'No se pudo finalizar la sesión.', isAlert: true, icon: '❌' });
        }
      }
    });
  };

  const handleReopen = () => {
    setModal({
      isOpen: true,
      title: 'Autorización Requerida',
      message: 'Ingresa el PIN de Administrador para desbloquear la edición:',
      icon: '🔓',
      showInput: true,
      inputType: 'password',
      inputPlaceholder: 'PIN',
      confirmText: 'Desbloquear',
      onConfirm: async (pin) => {
        if (!pin) return;
        try {
          const res = await fetch(`${API_URL}/sessions/${session.id}/reopen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
          });
          if (!res.ok) {
            const err = await res.json();
            setModal({ isOpen: true, title: 'Acceso Denegado', message: err.error || 'PIN Incorrecto', isAlert: true, icon: '🚫' });
            return;
          }
        } catch (e) {
          console.error(e);
          setModal({ isOpen: true, title: 'Error', message: 'Error de conexión con el servidor.', isAlert: true, icon: '❌' });
        }
      }
    });
  };

  useEffect(() => {
    fetchProgress();

    if (socket) {
      socket.on('user_entered_location', (data) => {
        setLiveUsers(prev => ({
          ...prev,
          [data.locationId]: [...(prev[data.locationId] || []).filter(u => u !== data.userName), data.userName]
        }));
      });
      
      socket.on('user_left_location', (data) => {
        setLiveUsers(prev => ({
          ...prev,
          [data.locationId]: (prev[data.locationId] || []).filter(u => u !== data.userName)
        }));
      });
      
      socket.on('location_saved', () => {
        fetchProgress();
      });

      return () => {
        socket.off('user_entered_location');
        socket.off('user_left_location');
        socket.off('location_saved');
      };
    }
  }, [session, socket]);

  if (!locations || locations.length === 0) {
    return <div className="empty-state">No hay ubicaciones configuradas.</div>;
  }



  return (
    <div className="location-selector" style={{paddingBottom: '100px'}}>
      <h2 style={{marginBottom: '1rem'}}>¿Dónde vas a contar?</h2>
      <div className="card-grid">
        {locations.map((loc, idx) => {
          const locCounts = counts[loc.id] || {};
          const localCounted = Object.values(locCounts).filter(prod => {
            const sumBox = (Array.isArray(prod.box) ? prod.box : []).reduce((a,b)=>a+Number(b),0);
            const sumUnit = (Array.isArray(prod.unit) ? prod.unit : []).reduce((a,b)=>a+Number(b),0);
            return sumBox > 0 || sumUnit > 0;
          }).length;

          // Badges from DB
          const usersCounted = dbProgress.filter(p => String(p.ubicacion_id) === String(loc.id));
          const currentLive = liveUsers[loc.id] || [];

          return (
            <div 
              key={idx} 
              className="card card-hover" 
              onClick={() => onSelect(loc)}
              style={{cursor: 'pointer', position: 'relative'}}
            >
              <h3 style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                {loc.nombre} 
                {localCounted > 0 && <span style={{color: 'var(--subway-green)', fontSize: '0.9rem'}}>✓ Tu Bulto Actual ({localCounted} prods)</span>}
              </h3>
              <div style={{minHeight: '1.5rem', marginTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                {currentLive.map((userName, i) => (
                  <span key={`live-${i}`} className="pulse-badge" style={{display: 'inline-flex', alignItems: 'center', background: 'var(--inner-bg)', color: 'var(--subway-green)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', border: '1px solid var(--border-color)', fontWeight: 'bold'}}>
                    <span style={{width: '5px', height: '5px', backgroundColor: 'var(--subway-green)', borderRadius: '50%', marginRight: '4px', animation: 'blink 1s infinite'}}></span>
                    {userName}
                  </span>
                ))}
              </div>
              <div style={{marginTop: '0.5rem', display: 'flex', gap: '4px'}}>
                {loc.cerrado && <span className="location-type-badge" style={{margin: 0, fontSize: '0.7rem', padding: '2px 6px'}}>📦 Cerrado</span>}
                {loc.abierto && <span className="location-type-badge" style={{margin: 0, fontSize: '0.7rem', padding: '2px 6px'}}>🌭 Abierto</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fab-container" style={{display: 'flex', gap: '10px', width: '90%', maxWidth: '500px'}}>
        {session.estado === 'Finalizado' ? (
          <>
            <button 
              className="fab" 
              onClick={handleReopen}
              style={{background: 'var(--subway-green)', color: 'white', flex: 1}}
            >
              🔓 Reabrir (Admin)
            </button>
            <button 
              className="fab" 
              onClick={onFinishSession}
              style={{background: 'var(--subway-yellow)', color: 'black', flex: 1}}
            >
              🖨️ Ver Resumen
            </button>
          </>
        ) : (
          <button 
            className="fab" 
            onClick={handleFinish}
            style={{background: 'var(--subway-green)', color: 'white', width: '100%'}}
          >
            🔒 Finalizar y Bloquear Inventario
          </button>
        )}
      </div>
      
      <Modal 
        {...modal} 
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}

export default LocationSelector;
