import pandas as pd
import json
import math
import sys

def main():
    file_path = "/Users/gabriel/Documents/AntiGravity/Inventario/Datos .xlsx"
    out_path = "/Users/gabriel/Documents/AntiGravity/Inventario/data.json"
    
    try:
        xl = pd.ExcelFile(file_path)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)
        
    data = {}
    
    # 1. Parse Sucursales
    try:
        df_suc = xl.parse("Sucursales")
        sucursales = []
        for _, row in df_suc.iterrows():
            sucursales.append({
                "bodega": str(row.get("bodega", "")),
                "nombre": str(row.get("nombre", "")),
                "direccion": str(row.get("direccion", ""))
            })
        data["sucursales"] = sucursales
    except Exception as e:
        print(f"Warning parsing Sucursales: {e}")
        data["sucursales"] = []

    # 2. Parse Ubicaciones
    try:
        df_ubi = xl.parse("Ubicaciones")
        ubicaciones = []
        for _, row in df_ubi.iterrows():
            ubicaciones.append({
                "id": str(row.get("id", "")),
                "nombre": str(row.get("Nombre", "")),
                "abierto": str(row.get("Abierto", "")).strip().lower() == "si",
                "cerrado": str(row.get("Cerrado", "")).strip().lower() == "si"
            })
        data["ubicaciones"] = ubicaciones
    except Exception as e:
        print(f"Warning parsing Ubicaciones: {e}")
        data["ubicaciones"] = []

    # 3. Parse Categorias
    try:
        df_cat = xl.parse("Categorias")
        categorias = []
        for _, row in df_cat.iterrows():
            categorias.append(str(row.get("Categorias", "")))
        data["categorias"] = categorias
    except Exception as e:
        print(f"Warning parsing Categorias: {e}")
        data["categorias"] = []

    # 4. Parse Productos
    try:
        df_prod = xl.parse("Productos")
        productos = []
        for _, row in df_prod.iterrows():
            # Handle NaN values
            def clean_val(val, default=""):
                if pd.isna(val):
                    return default
                if isinstance(val, (int, float)):
                    if math.isnan(val): return default
                    return val
                return str(val).strip()

            productos.append({
                "articuloid": clean_val(row.get("articuloid", "")),
                "itemname": clean_val(row.get("itemname", "")),
                "UnidadCompra": clean_val(row.get("UnidadCompra", "")),
                "cantidadCompra": float(clean_val(row.get("cantidadCompra", 1.0)) or 1.0),
                "unidad_venta": clean_val(row.get("unidad_venta", "")),
                "cantidadventa": float(clean_val(row.get("cantidadventa", 1.0)) or 1.0),
                "ItmsGrpNam": clean_val(row.get("ItmsGrpNam", "")), # Category
                "Ubicacion": str(clean_val(row.get("Ubicacion", ""))), # Maps to id in Ubicaciones
                "min": float(clean_val(row.get("min", 0.0)) or 0.0),
                "max": float(clean_val(row.get("max", 0.0)) or 0.0)
            })
        data["productos"] = productos
    except Exception as e:
        print(f"Warning parsing Productos: {e}")
        data["productos"] = []

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully wrote data to {out_path}")

if __name__ == "__main__":
    main()
