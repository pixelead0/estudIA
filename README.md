# estudIA

[![Deploy to GitHub Pages](https://github.com/pixelead0/estudIA/actions/workflows/deploy.yml/badge.svg)](https://github.com/pixelead0/estudIA/actions/workflows/deploy.yml)
[![Sitio en vivo](https://img.shields.io/website?url=https%3A%2F%2Fpixelead0.github.io%2FestudIA%2F&label=estudIA)](https://pixelead0.github.io/estudIA/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue)](package.json)

Plataforma de estudio para preparatoria: módulos en **Markdown** con vista web interactiva (vídeos, práctica paso a paso, quizzes) y generación de **PDF** desde la misma fuente en `1/<Materia>/`.

## Sitio publicado

**[https://pixelead0.github.io/estudIA/](https://pixelead0.github.io/estudIA/)** — 3 materias, ~42 episodios.

## Materias actuales

| Materia | Carpeta |
|---------|---------|
| Computación Básica I | `1/Computacion_Basica_I/` |
| Desarrollo de Habilidades del Pensamiento | `1/Desarrollo_de_Habilidades_del_Pensamiento/` |
| Filosofía I | `1/Filosofia_I/` |

## Desarrollo local

**Requisitos:** [Node.js](https://nodejs.org/) ≥ 20.

```bash
npm install
npm run dev      # servidor Vite; sirve 1/, assets/ y subjects.json
npm run build    # genera dist/ (igual que en GitHub Pages)
npm run preview  # previsualiza dist/
```

El build ejecuta `scripts/generate-content-index.js` y copia el contenido a `dist/`.

## Despliegue

Cada **push a `main`** dispara el workflow [Deploy to GitHub Pages](.github/workflows/deploy.yml) y publica el artefacto en GitHub Pages.

Puedes seguir el estado en [Actions](https://github.com/pixelead0/estudIA/actions/workflows/deploy.yml).

## Estructura del repositorio

| Ruta | Descripción |
|------|-------------|
| `1/` | Módulos Markdown (fuente única web + PDF) |
| `assets/` | Imágenes y recursos estáticos |
| `main.js`, `style.css`, `index.html` | Aplicación web (Vite + marked) |
| `content/` | Pipeline compartido (`pipeline.js`, etiquetas de sección) |
| `scripts/` | Índice, auditoría y validación multimedia |
| `bin/` | Generación de PDF |
| `.agents/instructions/` | Esquema v3 y guías para agentes/editores |

## Documentación

- [Contenido y pipeline](content/README.md)
- [Scripts de validación](scripts/README.md)
- Esquema didáctico v3: `.agents/instructions/module_schema_v3.md`
- Plataforma web: `.agents/instructions/web_platform_management.md`

## Informe de avance (web)

- Ruta secreta: `#/informe-avance-estudIA`
- Acceso directo: botón **Informe** junto al toggle dark/light
- Exportación: botón **Guardar informe en PDF** (usa `window.print()`)
- Almacenamiento local: cookies + `localStorage` (sin backend)
- El informe solo lista episodios con **actividad medible** (tiempo/scroll/interacciones), ocultando filas vacías.
- El quiz guarda borrador por módulo y, si recargas, **continúa donde se quedó**.

## Contribuir contenido

1. Edita los `.md` en `1/<Materia>/`.
2. Ejecuta `npm run build` (opcional, para comprobar el índice y `dist/`).
3. Valida con los scripts descritos en [scripts/README.md](scripts/README.md) (`audit_modules.py`, `check_multimedia.py`).
4. Haz commit y push a `main` para publicar en el sitio.

No subas `scripts/__pycache__/` ni `dist/` (ver [.gitignore](.gitignore)).
