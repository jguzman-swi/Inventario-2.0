import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import SessionSelector from './components/SessionSelector';
import LocationSelector from './components/LocationSelector';
import CountingArea from './components/CountingArea';
import Summary from './components/Summary';
import AdminDashboard from './components/admin/AdminDashboard';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const [inventoryData, setInventoryData] = useState({
    sucursales: [], ubicaciones: [], categorias: [], productos: []
  });
  const [loading, setLoading] = useState(true);
  
  // Sockets
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL.replace('/api', ''));
    
    newSocket.on('session_state_changed', (data) => {
      setSelectedSession(prev => {
        if (!prev) return null;
        return { ...prev, estado: data.estado };
      });
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('subway-theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('subway-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Admin states
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // ... rest of state declarations ...

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Re-fetch helper exposed for admin when returning
  const loadInventory = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    fetch(`${API_URL}/inventory`)
      .then(res => res.json())
      .then(data => {
        setInventoryData(data);
        if (!isSilent) setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load inventory:", err);
        if (!isSilent) setLoading(false);
      });
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleUserLogin = (user) => {
    setCurrentUser(user);
    setCurrentScreen('session-select');
  };

  const handleSessionSelect = async (session) => {
    setSelectedSession(session);
    const branch = inventoryData.sucursales.find(b => b.id === session.sucursal_id);
    setSelectedBranch(branch);
    if (socket) {
      socket.emit('join_session', session.id);
    }
    setCurrentScreen('location-select');
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setCurrentScreen('counting');
  };

  const navigateBack = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      loadInventory(); 
      return;
    }
    if (currentScreen === 'session-select') {
      setCurrentScreen('login');
      setCurrentUser(null);
    } else if (currentScreen === 'location-select') {
      setCurrentScreen('session-select');
      setSelectedSession(null);
      setSelectedBranch(null);
    } else if (currentScreen === 'counting') {
      setCurrentScreen('location-select');
      setSelectedLocation(null);
    } else if (currentScreen === 'summary') {
      setCurrentScreen('location-select');
    }
  };

  const finishCountingLocation = () => {
    navigateBack();
  };

  const openGlobalSummary = () => {
    setCurrentScreen('summary');
  };

  const getHeaderTitle = () => {
    if (isAdminMode) return 'Panel Administrativo';
    if (currentScreen === 'login') return 'Acceso al Sistema';
    if (currentScreen === 'session-select') return 'Sesiones de Inventario';
    if (currentScreen === 'location-select') return selectedBranch?.nombre;
    if (currentScreen === 'counting') return selectedLocation?.nombre;
    if (currentScreen === 'summary') return 'Resumen de Inventario';
    return 'Inventario';
  };

  const renderAdminMode = () => {
    return <AdminDashboard onExit={() => { setIsAdminMode(false); loadInventory(); }} inventoryData={inventoryData} onRefresh={loadInventory} />;
  };

  if (loading) {
    return <div className="app-container"><p style={{padding:'2rem', textAlign:'center', color: 'var(--text-main)'}}>Cargando conexión segura con MySQL...</p></div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {(currentScreen !== 'login' || isAdminMode) ? (
             <button className="back-btn" onClick={navigateBack}>← Volver</button>
          ) : null}
          
          {currentUser && currentUser.rol === 'Admin' && !isAdminMode && (
             <button 
               className="back-btn" 
               style={{opacity: 0.8, fontWeight: 'bold'}}
               onClick={() => setIsAdminMode(true)}
             >
               ⚙️ Admin
             </button>
          )}
        </div>
        
        <h1 style={{ flex: 1, textAlign: 'center' }}>{getHeaderTitle()}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--subway-yellow)',
              fontSize: '1.2rem',
              transition: 'all 0.3s ease'
            }}
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>
            <span className="brand-accent">SUB</span>WAY
          </div>
        </div>
      </header>

      <main className="container animate-slide-up">
        {isAdminMode ? renderAdminMode() : (
          <>
            {currentScreen === 'login' && (
              <Login 
                onLogin={handleUserLogin}
              />
            )}

            {currentScreen === 'session-select' && (
              <SessionSelector 
                branches={inventoryData.sucursales} 
                onSessionSelected={handleSessionSelect} 
                currentUser={currentUser}
              />
            )}
            
            {currentScreen === 'location-select' && (
              <LocationSelector 
                locations={inventoryData.ubicaciones} 
                onSelect={handleLocationSelect} 
                session={selectedSession}
                socket={socket}
                onFinishSession={openGlobalSummary}
              />
            )}

            {currentScreen === 'counting' && (
              <CountingArea 
                location={selectedLocation}
                session={selectedSession}
                currentUser={currentUser}
                socket={socket}
                products={inventoryData.productos.filter(p => {
                  if (!p.Ubicacion) return false;
                  let uMap = [];
                  try { uMap = typeof p.Ubicacion === 'string' ? JSON.parse(p.Ubicacion) : (p.Ubicacion || []); } catch(e){}
                  return uMap.some(u => String(u.id) === String(selectedLocation.id));
                })}
                allProducts={inventoryData.productos}
                categories={inventoryData.categorias}
                onFinish={finishCountingLocation}
                onRefresh={loadInventory}
              />
            )}

            {currentScreen === 'summary' && (
              <Summary 
                products={inventoryData.productos}
                locations={inventoryData.ubicaciones}
                branch={selectedBranch}
                session={selectedSession}
                currentUser={currentUser}
                recipes={inventoryData.recetas || []}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
