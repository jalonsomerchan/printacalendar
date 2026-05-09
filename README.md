# Print a Calendar

Generador de calendarios imprimibles construido con Svelte, TypeScript, Vite y `pdf-lib`.

## Desarrollo local

```bash
npm install
npm run dev
```

## Comprobar y compilar

```bash
npm run check
npm run build
npm run preview
```

## Despliegue

Este proyecto es una aplicación Vite. En producción no debe servirse la raíz del repositorio directamente, porque `index.html` referencia `/src/main.ts` solo para el servidor de desarrollo de Vite. Si un hosting estático sirve ese archivo TypeScript sin compilar, el navegador puede bloquearlo con un error de MIME como:

```text
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "video/mp2t".
```

La solución es publicar siempre la carpeta `dist` generada por `npm run build`.

El workflow de GitHub Pages incluido en `.github/workflows/deploy.yml` instala dependencias, ejecuta `npm run build` y despliega únicamente `dist`. El dominio personalizado se conserva copiando `public/CNAME` al build final.
