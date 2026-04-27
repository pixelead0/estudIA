# Skill: Web Platform Management

This instruction defines how to manage and extend the estudIA web platform.

## Architecture
- **Framework**: Vite + Vanilla JS/CSS.
- **Content Source**: Markdown files in the `1/` directory.
- **Index Generation**: `scripts/generate-content-index.js` (generates `subjects.json`).
- **Deployment**: GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages.

## UI/UX Features
- **Home Grid**: A visual menu of all subjects.
- **Filtered Sidebar**: The sidebar only shows modules of the currently selected subject.
- **Theme Toggle**: Support for Dark/Light mode with persistence in `localStorage`.
- **Aesthetic**: Premium "Cyber-School" design with glassmorphism and gradients.

## Workflows

### 1. Adding New Content
When a new subject or module is added:
1. Place the `.md` file in the appropriate folder under `1/`.
2. Run `npm run pre-index` (or `make web-build`) to update `subjects.json`.
3. Verify local rendering with `make web-dev`.

### 2. Updating UI/UX
- **Styles**: Modify `style.css`.
- **Logic**: Modify `main.js`.
- **Theme**: Light mode variables are defined in `:root[data-theme='light']`.

### 3. Build & Deploy
- **Local Build**: `make web-build`.
- **Deploy**: Automatic on push to `main`.

## Verification Standards
- **Manual over Automatic**: DO NOT use automatic browser testing tools (e.g., `browser_subagent`) to verify UI changes unless the USER explicitly requests it. Rely on terminal build checks and descriptive walkthroughs.
- All interactive elements must have unique IDs.
- Ensure the Markdown renderer (`marked`) supports all custom pedagogical elements.
