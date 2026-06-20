# Disponibilidad Total

## Puedes probar la aplicación en vivo en la siguiente URL:
```text
https://disponibilidad-total-challenge.vercel.app/
```

## Capturas de pantalla desktop y mobile

<img width="1470" height="784" alt="Captura de pantalla 2026-06-20 a la(s) 11 36 52 a m" src="https://github.com/user-attachments/assets/d81fa041-cb2c-4a07-89fd-376845a740aa" />

<img width="1470" height="879" alt="Captura de pantalla 2026-06-20 a la(s) 11 37 08 a m" src="https://github.com/user-attachments/assets/5953659b-a2d4-4ded-ae7b-609e35922a46" />

<img width="1470" height="879" alt="Captura de pantalla 2026-06-20 a la(s) 11 37 31 a m" src="https://github.com/user-attachments/assets/fa83587b-8b7d-45f9-a2d8-373e9ab2d3b9" />

<img width="1470" height="877" alt="Captura de pantalla 2026-06-20 a la(s) 11 38 05 a m" src="https://github.com/user-attachments/assets/cd93803c-8146-42e7-b25f-afd14617b5e5" />


| Tiendas | Productos | Analytics 1 | Analytics 2 |
| :---: | :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/fdc4f8f0-10fc-4f67-aa18-6af226605f6c" width="200"> | <img src="https://github.com/user-attachments/assets/314e7ded-4a0a-44f4-8de9-c881c639a845" width="200"> | <img src="https://github.com/user-attachments/assets/a5886451-507e-4f28-876e-9ec8963deaef" width="200"> | <img src="https://github.com/user-attachments/assets/e0c7a86b-9a3e-4853-863c-69eaad562851" width="200">


Dashboard web construido con Next.js, React, TypeScript, Tailwind CSS y Recharts para consultar la disponibilidad y ventas de tiendas. La aplicacion permite revisar un listado de tiendas, filtrar por nombre y region, ordenar columnas, abrir el detalle de una tienda, analizar sus productos vendidos y exportar informacion en CSV.

Tambien incluye un tablero de productos de todas las tiendas y una seccion de Analytics con graficas de ventas. Ambas secciones son accesibles desde el menu de hamburguesa del encabezado.

## Funcionalidades principales

- Listado de tiendas con busqueda, filtro por region y ordenamiento ascendente/descendente por columnas.
- Detalle de tienda con resumen de ventas, unidades, productos vendidos, busqueda por producto o SKU y alternancia entre Top 5 y todos los productos.
- Tablero global de productos para consultar productos vendidos en todas las tiendas, con busqueda y ordenamiento por tienda, ciudad, region, SKU, producto, categoria, unidades vendidas o venta total.
- Exportacion CSV de la vista actual del listado de tiendas, del detalle de una tienda y del tablero global de productos.
- Seccion de graficas para analizar ventas totales por tienda y, al seleccionar una tienda, ventas por producto y ventas agrupadas por categoria.

## Componentes del proyecto

- `SalesDashboard`: componente principal del tablero. Centraliza el estado, la carga de datos, filtros, seleccion de tienda, ordenamientos y cambio entre tableros.
- `DashboardHeader`: encabezado superior con el titulo, metricas generales y menu para alternar entre el tablero de tiendas, el tablero de productos y la seccion de graficas.
- `StoreFilters`: controles para buscar tiendas por nombre y filtrar por region.
- `StoresTable`: tabla del listado de tiendas. Permite ordenar por columnas, mantiene fija la columna de nombre, permite abrir el detalle al hacer clic en una fila y exporta el listado visible a CSV.
- `StoreDetailPanel`: panel de detalle de la tienda seleccionada. Muestra resumen de ventas, unidades, cantidad de productos, estados de carga/error y exportacion CSV de los productos visibles.
- `ProductsTable`: tabla de productos dentro del detalle de tienda. Permite buscar por nombre o SKU, alternar entre Top 5 y todos los productos, y ordenar columnas.
- `AllProductsDashboard`: tablero global de productos de todas las tiendas. Lista productos por tienda, permite busqueda, ordenamiento y exportacion CSV de los productos visibles.
- `StoreChartsDashboard`: seccion de Analytics y graficas. Muestra ventas totales por tienda, listado clicable de tiendas y graficas de detalle por producto y categoria.
- `SortableTableHeader`: encabezado reutilizable para tablas ordenables, con iconos de orden ascendente y descendente.
- `ExportCsvButton`: boton reutilizable con icono de descarga para exportar datos en formato CSV.

## Datos y APIs locales

Los datos del proyecto se leen desde `src/data/stores.json`.

La aplicacion expone endpoints locales con Route Handlers de Next.js:

- `GET /api/stores`: devuelve el resumen de tiendas.
- `GET /api/stores/[id]`: devuelve el detalle de una tienda por ID numerico.
- `GET /api/products`: devuelve productos de todas las tiendas.

Actualmente no se requieren variables de entorno para ejecutar el proyecto.

## Instalacion y ejecucion local

Requisitos recomendados:

- Node.js `20.9.0` o superior.
- npm.

Instalar dependencias:

```bash
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Abrir la aplicacion en:

```text
http://localhost:3000
```

Comandos utiles:

```bash
npm run lint
npm run build
npm run start
```

## Deploy en Vercel

Este proyecto ya esta conectado a Vercel desde el repositorio de GitHub:

```text
https://github.com/MarcoChavez1940/disponibilidad-total-challenge.git
```

La rama principal es `main`. Cada vez que se sube un commit a `main`, Vercel ejecuta automaticamente un nuevo deploy de produccion. Dichos commits solo pueden llegar a `main` a través de un Pull Request.

<img width="767" height="232" alt="Captura de pantalla 2026-06-20 a la(s) 9 53 56 a m" src="https://github.com/user-attachments/assets/bedf509a-9322-46a5-8d69-17a3e10d2746" />

No hay variables de entorno requeridas en este momento. Los archivos `.env*` y `.vercel` estan ignorados por Git para evitar subir secretos o configuracion local.
