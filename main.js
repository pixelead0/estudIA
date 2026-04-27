import { marked } from 'marked';

const sidebar = document.getElementById('sidebar');
const contentView = document.getElementById('content-view');
const logo = document.querySelector('.logo');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

let globalSubjects = [];
let currentSubjectId = null;

async function init() {
    // Initialize Theme
    initTheme();

    try {
        const response = await fetch('/subjects.json');
        globalSubjects = await response.json();
        
        // Handle initial routing
        handleRouting();

        // Logo click to go home
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '';
        });

        // Theme Toggle
        themeToggle.addEventListener('click', toggleTheme);

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function handleRouting() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const [subjectId, moduleId] = hash.split('/');
        if (subjectId && moduleId) {
            loadModule(subjectId, moduleId);
        } else if (subjectId) {
            const subject = globalSubjects.find(s => s.id === subjectId);
            if (subject && subject.modules.length > 0) {
                window.location.hash = `${subjectId}/${subject.modules[0].id}`;
            }
        }
    } else {
        renderHome(globalSubjects);
    }
}

function renderSidebar(subjectId) {
    if (!subjectId) {
        sidebar.innerHTML = '<div class="sidebar-empty">Selecciona una materia para ver sus módulos.</div>';
        return;
    }

    const subject = globalSubjects.find(s => s.id === subjectId);
    if (!subject) return;

    sidebar.innerHTML = `
        <div class="subject-item">
            <h3 class="subject-title">${subject.name}</h3>
            <ul class="module-list">
                ${subject.modules.map(module => `
                    <li>
                        <a class="module-link ${window.location.hash.includes(module.id) ? 'active' : ''}" 
                           data-subject="${subject.id}" 
                           data-module="${module.id}"
                           href="#${subject.id}/${module.id}">
                            ${module.title}
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function renderHome(subjects) {
    currentSubjectId = null;
    renderSidebar(null);

    contentView.innerHTML = `
        <div class="welcome-screen">
            <h1>Bienvenido a estudIA</h1>
            <p>Selecciona una materia para explorar sus contenidos y potenciar tu aprendizaje.</p>
            
            <div class="subject-grid">
                ${subjects.map(subject => `
                    <a href="#${subject.id}/${subject.modules[0]?.id || ''}" class="subject-card">
                        <div>
                            <div class="module-count">${subject.modules.length} Módulos</div>
                            <h2>${subject.name}</h2>
                        </div>
                        <div class="view-button">Explorar Materia</div>
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}

async function loadModule(subjectId, moduleId) {
    if (currentSubjectId !== subjectId) {
        currentSubjectId = subjectId;
        renderSidebar(subjectId);
    } else {
        document.querySelectorAll('.module-link').forEach(link => {
            link.classList.toggle('active', 
                link.dataset.subject === subjectId && link.dataset.module === moduleId);
        });
    }

    contentView.innerHTML = '<div class="loading">Cargando contenido...</div>';

    try {
        const response = await fetch(`/1/${subjectId}/${moduleId}`);
        if (!response.ok) throw new Error('Contenido no encontrado');
        const markdown = await response.text();
        
        const html = marked.parse(markdown);
        contentView.innerHTML = `
            <div class="content-wrapper markdown-body">
                ${html}
            </div>
        `;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        contentView.innerHTML = `
            <div class="error-screen">
                <h2>Ups! Algo salió mal</h2>
                <p>${error.message}</p>
                <button onclick="window.location.hash=''">Volver al Inicio</button>
            </div>
        `;
    }
}

window.addEventListener('hashchange', handleRouting);

init();
