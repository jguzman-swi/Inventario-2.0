import React from 'react';

function BranchSelector({ branches, onSelect }) {
  if (!branches || branches.length === 0) {
    return <div className="empty-state">No hay sucursales configuradas.</div>;
  }

  return (
    <div className="branch-selector">
      <h2 style={{marginBottom: '1rem'}}>Elige una Sucursal</h2>
      <div className="card-grid">
        {branches.map((branch, idx) => (
          <div 
            key={idx} 
            className="card" 
            onClick={() => onSelect(branch)}
          >
            <h3>{branch.nombre || 'Sucursal Sin Nombre'}</h3>
            <p><strong>Bodega:</strong> {branch.bodega || 'N/A'}</p>
            {branch.direccion && <p style={{marginTop: '0.5rem'}}>{branch.direccion}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BranchSelector;
