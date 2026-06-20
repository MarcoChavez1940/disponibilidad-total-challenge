# Disponibilidad Total

## Puedes probar la aplicación en vivo en la siguiente URL:
```text
https://disponibilidad-total-challenge.vercel.app/
```

Dashboard web construido con Next.js, React, TypeScript y Tailwind CSS para consultar la disponibilidad y ventas de tiendas. La aplicacion permite revisar un listado de tiendas, filtrar por nombre y region, ordenar columnas, abrir el detalle de una tienda y analizar sus productos vendidos.

Tambien incluye un tablero de productos de todas las tiendas, accesible desde el menu del encabezado, para buscar productos por nombre o SKU y ordenar la informacion por tienda, ciudad, region, SKU, producto, categoria, unidades vendidas o venta total.

## Componentes del proyecto

- `SalesDashboard`: componente principal del tablero. Centraliza el estado, la carga de datos, filtros, seleccion de tienda, ordenamientos y cambio entre tableros.
- `DashboardHeader`: encabezado superior con el titulo, metricas generales y menu para alternar entre el tablero de tiendas y el tablero de productos.
- `StoreFilters`: controles para buscar tiendas por nombre y filtrar por region.
- `StoresTable`: tabla del listado de tiendas. Permite ordenar por columnas, mantiene fija la columna de nombre y permite abrir el detalle al hacer clic en una fila.
- `StoreDetailPanel`: panel de detalle de la tienda seleccionada. Muestra resumen de ventas, unidades, cantidad de productos y estados de carga/error.
- `ProductsTable`: tabla de productos dentro del detalle de tienda. Permite buscar por nombre o SKU, alternar entre Top 5 y todos los productos, y ordenar columnas.
- `AllProductsDashboard`: tablero global de productos de todas las tiendas. Lista productos por tienda y permite busqueda y ordenamiento.
- `SortableTableHeader`: encabezado reutilizable para tablas ordenables, con iconos de orden ascendente y descendente.

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
