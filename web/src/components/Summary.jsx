import React, { useState, useEffect, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

function Summary({ products, locations, branch, session, currentUser, recipes }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.id) return;
    fetch(`${API_URL}/sessions/${session.id}/full_report`)
      .then(r => r.json())
      .then(d => {
        setReport(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [session]);

  const analysis = useMemo(() => {
    if (!report) return { missing: [], partial: [], ok: [] };
    
    const missing = [];
    const partial = [];
    const ok = [];

    // Helper map for quick recipe access
    const recipesByChild = {};
    recipes.forEach(r => {
      if (!recipesByChild[r.producto_hijo_id]) recipesByChild[r.producto_hijo_id] = [];
      recipesByChild[r.producto_hijo_id].push(r);
    });

    products.forEach(p => {
       const relatedCountRecords = report.filter(r => String(r.producto_id) === String(p.articuloid));
       
       let expectedLocations = [];
       try { expectedLocations = typeof p.Ubicacion === 'string' ? JSON.parse(p.Ubicacion) : (p.Ubicacion || []); } catch(e){}
       
       const totalBox = relatedCountRecords.reduce((a,b) => a + Number(b.box_total), 0);
       const totalUnit = relatedCountRecords.reduce((a,b) => a + Number(b.unit_total), 0);
       
       // 1. Direct Pieces (as counted)
       let totalPieces = (totalBox * (p.cantidadCompra || 1)) + totalUnit;       

       // 2. Extra Pieces from BOM (if this product is an ingredient in a produced product)
       let extraFromBOM = 0;
       const ingredientInRecetas = recipes.filter(r => r.producto_hijo_id === p.articuloid);
       
       ingredientInRecetas.forEach(r => {
         const parentCounts = report.filter(record => String(record.producto_id) === String(r.producto_padre_id));
         const parentProduct = products.find(prod => String(prod.articuloid) === String(r.producto_padre_id));
         
         if (parentProduct) {
           const parentTotalBox = parentCounts.reduce((a,b) => a + Number(b.box_total), 0);
           const parentTotalUnit = parentCounts.reduce((a,b) => a + Number(b.unit_total), 0);
           const parentTotalPieces = (parentTotalBox * (parentProduct.cantidadCompra || 1)) + parentTotalUnit;
           
           extraFromBOM += parentTotalPieces * Number(r.cantidad_hijo);
         }
       });

       const finalTotalPieces = totalPieces + extraFromBOM;

       const countedLocIds = new Set(relatedCountRecords.map(r => String(r.ubicacion_id)));
       const expectedLocIds = expectedLocations.map(u => String(u.id));
       
       const missingLocs = expectedLocIds.filter(id => !countedLocIds.has(id));
       
       // Flag if this product acts as a parent for others (it's a "Produced" product)
       const isProducedProduct = recipes.some(r => r.producto_padre_id === p.articuloid);

       const data = {
         product: p,
         totalBox,
         totalUnit,
         totalPieces: totalPieces, // The direct count
         finalTotalPieces: finalTotalPieces, // Count + Recipe components
         extraFromBOM,
         isProducedProduct,
         countedLocNames: Array.from(countedLocIds).map(id => locations.find(l => String(l.id) === id)?.nombre || id),
         missingLocNames: missingLocs.map(id => locations.find(l => String(l.id) === id)?.nombre || id),
       };

       if (relatedCountRecords.length === 0) {
          missing.push(data);
       } else if (missingLocs.length > 0) {
          partial.push(data);
       } else {
          ok.push(data);
       }
    });

    return { missing, partial, ok };
  }, [report, products, locations, recipes]);

  const handleExportCSV = () => {
    if (!report) return;
    
    // Create CSV content for ALL audited products
    const items = [...analysis.partial, ...analysis.ok];
    
    const header = ['ID_Articulo', 'Nombre', 'Categoria', 'Unidad_Medida', 'Total_Cajas', 'Total_Sueltas', 'Total_Piezas_Netas', 'Ubicaciones_Contadas', 'Falto_En'].join(',');
    
    const rows = items.map(d => {
      return [
        `"${d.product.articuloid}"`,
        `"${d.product.itemname.replace(/"/g, '""')}"`,
        `"${d.product.ItmsGrpNam}"`,
        `"${d.product.unidad_venta}"`,
        d.totalBox,
        d.totalUnit,
        d.totalPieces,
        `"${d.countedLocNames.join(' | ')}"`,
        `"${d.missingLocNames.join(' | ')}"`
      ].join(',');
    });
    
    const csvContent = [header, ...rows].join('\n');
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Cierre_Subway_${session.tipo}_${session.fecha_conteo.split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
     return <div className="card" style={{textAlign: 'center', padding: '3rem'}}>Calculando Reporte Global Auditado...</div>;
  }

  return (
    <div className="summary-section">
      <div className="card" style={{marginBottom: '1.5rem', background: 'var(--subway-yellow)', color: '#1a1a1a', border: 'none'}}>
        <h2 style={{marginBottom: '0.5rem', color: '#1a1a1a'}}>Reporte Final de Auditoría 📊</h2>
        <p><strong>Sesión:</strong> {session?.tipo} - {session?.fecha_conteo?.split('T')[0]}</p>
        <p><strong>Sucursal:</strong> {branch?.nombre}</p>
        <p><strong>Generado por:</strong> {currentUser?.nombre}</p>
      </div>

      <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
         <button className="fab" onClick={handleExportCSV} style={{position: 'static', width: 'auto', flex: 1, padding: '1rem'}}>
           ⬇️ Descargar Archivo CSV Excel
         </button>
      </div>

      <div className="card" style={{marginBottom: '1rem', borderLeft: '6px solid #ef4444', background: 'var(--card-bg)'}}>
         <h3 style={{color: '#ef4444', marginBottom: '0.5rem'}}>🟥 Peligro: Artículos Ausentes Totales ({analysis.missing.length})</h3>
         <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
           Estos productos están en catálogo pero absolutamente ningún cajero los encontró ni los digitó en la sucursal de hoy.
         </p>
         <div style={{maxHeight: '300px', overflowY: 'auto'}}>
            {analysis.missing.map(m => (
               <div key={m.product.articuloid} style={{padding: '10px 0', borderBottom: '1px solid var(--border-color)'}}>
                  <strong>{m.product.itemname}</strong>
                  <div style={{fontSize: '0.8rem', color: '#ef4444'}}>
                     Se requería buscar en: {m.missingLocNames.join(', ')}
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="card" style={{marginBottom: '1rem', borderLeft: '6px solid #eab308', background: 'var(--card-bg)'}}>
         <h3 style={{color: '#d97706', marginBottom: '0.5rem'}}>🟨 Atención: Zonas Sin Revisar Simultáneas ({analysis.partial.length})</h3>
         <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
           Se contaron por alguien en algún cuarto, pero faltó que buscaran en el resto de cuartos que les corresponde.
         </p>
         <div style={{maxHeight: '300px', overflowY: 'auto'}}>
            {analysis.partial.map(m => (
               <div key={m.product.articuloid} style={{padding: '10px 0', borderBottom: '1px solid var(--border-color)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                     <strong style={{flex: 1}}>{m.product.itemname}</strong>
                     <div style={{textAlign: 'right'}}>
                        <strong style={{color: '#d97706'}}>{m.finalTotalPieces} {m.product.unidad_venta}</strong>
                        {m.extraFromBOM > 0 && <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Incluye {m.extraFromBOM} de recetas</div>}
                     </div>
                  </div>
                  <div style={{fontSize: '0.8rem', color: 'var(--subway-green)'}}>✅ Contado en: {m.countedLocNames.join(', ')}</div>
                  <div style={{fontSize: '0.8rem', color: '#d97706'}}>⚠️ Nadie lo buscó en: {m.missingLocNames.join(', ')}</div>
               </div>
            ))}
         </div>
      </div>

      <div className="card" style={{marginBottom: '1rem', borderLeft: '6px solid var(--subway-green)', background: 'var(--card-bg)'}}>
         <h3 style={{color: 'var(--subway-green)', marginBottom: '0.5rem'}}>🟩 Limpios: Auditados Exactamente ({analysis.ok.length})</h3>
         <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
           Estos productos se contaron en todas y cada una de las rejas y cuartos que exigía su ficha técnica de esta sucursal.
         </p>
         <div style={{maxHeight: '300px', overflowY: 'auto'}}>
            {analysis.ok.map(m => (
               <div key={m.product.articuloid} style={{padding: '10px 0', borderBottom: '1px solid var(--border-color)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                     <div style={{flex: 1}}>
                       <strong style={{display: 'flex', alignItems: 'center'}}>
                         {m.product.itemname}
                         {m.isProducedProduct && <span style={{marginLeft: '8px', fontSize: '0.65rem', padding: '2px 6px', background: 'var(--inner-bg)', color: 'var(--subway-green)', border: '1px solid var(--border-color)', borderRadius: '4px'}}>PRODUCIDO</span>}
                       </strong>
                       <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                          Directo: {m.totalPieces} | Cajas: {m.totalBox} | Sueltos: {m.totalUnit}
                       </div>
                     </div>
                     <div style={{textAlign: 'right'}}>
                        <strong style={{color: 'var(--subway-green)', fontSize: '1.1rem'}}>{m.finalTotalPieces} {m.product.unidad_venta}</strong>
                        {m.extraFromBOM > 0 && <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold'}}>+ {m.extraFromBOM} desde Recetas</div>}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}

export default Summary;
