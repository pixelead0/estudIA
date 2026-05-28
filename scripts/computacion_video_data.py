"""Datos de vídeos tutoriales — Computación Básica I (52 TikTok únicos)."""

from __future__ import annotations

# YouTube por módulo (4 IDs únicos globales)
YT_BY_MOD: dict[str, list[tuple[str, str, str]]] = {
    "01": [
        ("Hardware y software explicado", "Identifica qué puedes tocar y qué son solo instrucciones.", "https://www.youtube.com/watch?v=gVaE2F0jOJs"),
        ("Diferencias hardware vs software", "Compara ejemplos reales en tu equipo.", "https://www.youtube.com/watch?v=6DcGWI7Z3XE"),
        ("Computadoras: datos y dispositivos", "Entrada, salida y almacenamiento en la práctica.", "https://www.youtube.com/watch?v=C19lKwVZE60"),
        ("Input y output", "Cómo fluye la información al guardar una tarea.", "https://www.youtube.com/watch?v=GFuDda1_yJQ"),
    ],
    "02": [
        ("Configurar escritorio Windows 11", "Personaliza iconos y barra de tareas.", "https://www.youtube.com/watch?v=lXq6r9Zm33M"),
        ("Windows 11 para principiantes", "Recorrido por menús esenciales.", "https://www.youtube.com/watch?v=ShaCjM6DIwQ"),
        ("Icono Este equipo", "Accede a discos desde el escritorio.", "https://www.youtube.com/watch?v=PutOMAQVW8s"),
        ("Configurar laptop nueva", "Pasos iniciales de seguridad.", "https://www.youtube.com/watch?v=EMThojsqBTY"),
    ],
    "03": [
        ("Explorador de archivos — curso", "Navega carpetas y unidades.", "https://www.youtube.com/watch?v=79u6_79nKW4"),
        ("Explorador: primeros pasos", "Crea y mueve archivos sin perder tareas.", "https://www.youtube.com/watch?v=y69J8zziatU"),
        ("Explorador desde cero", "Ruta completa para ordenar tu PC.", "https://www.youtube.com/watch?v=j9aILD8S9Gc"),
        ("Tutorial completo Explorador", "Vistas, búsqueda y propiedades.", "https://www.youtube.com/watch?v=7lXnfF5BDEw"),
    ],
    "04": [
        ("Chrome en español", "Cambia el idioma del navegador.", "https://www.youtube.com/watch?v=_Dd_k8mCMFY"),
        ("Idioma Chrome paso a paso", "Menús y ayuda en tu idioma.", "https://www.youtube.com/watch?v=NhcFAsuvXOc"),
        ("Curso completo Chrome", "Pestañas, favoritos y descargas.", "https://www.youtube.com/watch?v=LpxedaKMMCk"),
        ("Interfaz de Chrome", "Barra de direcciones y privacidad.", "https://www.youtube.com/watch?v=SwTMDvrTuHk"),
    ],
    "05": [
        ("Operadores de búsqueda Google", "Filtra resultados con símbolos.", "https://www.youtube.com/watch?v=G9jRss4S-FY"),
        ("Operador site:", "Busca solo en sitios confiables.", "https://www.youtube.com/watch?v=9ZPpxk4FbRI"),
        ("Buscar con comillas", "Frases exactas para verificar datos.", "https://www.youtube.com/watch?v=iuxjhGV7DD8"),
        ("Trucazos de Google", "Estrategias para investigación escolar.", "https://www.youtube.com/watch?v=CfhEzDd-hFM"),
    ],
    "06": [
        ("Gmail paso a paso", "Redacta y adjunta archivos.", "https://www.youtube.com/watch?v=QWpO5x-h2K4"),
        ("Correo para principiantes", "Partes de un mensaje electrónico.", "https://www.youtube.com/watch?v=Kdn81wnb0gY"),
        ("Introducción a Gmail", "Mapa de funciones con maestros.", "https://www.youtube.com/watch?v=oderjwOggiQ"),
        ("Vista general Gmail", "Etiquetas y búsqueda.", "https://www.youtube.com/watch?v=TUj77DVG5dA"),
    ],
    "07": [
        ("Negrita, cursiva y subrayado", "Formato desde la cinta Inicio.", "https://www.youtube.com/watch?v=1VZ0XgSYvLg"),
        ("Poner negrita en Word", "Resalta títulos importantes.", "https://www.youtube.com/watch?v=4LbtW0bYKcA"),
        ("Formato básico en Word", "Fuente, tamaño y estilos.", "https://www.youtube.com/watch?v=lxXfPb_xUmg"),
        ("Revisión ortográfica y guardar", "Subrayados rojos y Ctrl+S.", "https://www.youtube.com/watch?v=Qbqj-oVz5yY"),
    ],
    "08": [
        ("Márgenes y bordes en Word", "Espacio imprimible de la hoja.", "https://www.youtube.com/watch?v=EEuRVT3AFD8"),
        ("Configurar márgenes", "Márgenes estándar antes de imprimir.", "https://www.youtube.com/watch?v=40x3NsAsBDM"),
        ("Bordes de página", "Marco profesional para portadas.", "https://www.youtube.com/watch?v=dYY2T69873c"),
        ("Márgenes normas APA", "Referencia para trabajos formales.", "https://www.youtube.com/watch?v=crLW6tG14LM"),
    ],
    "09": [
        ("Imágenes en celdas de Word", "Tablas e ilustraciones.", "https://www.youtube.com/watch?v=puwvEmz8L1k"),
        ("Tablas con imágenes", "Layout de datos visuales.", "https://www.youtube.com/watch?v=ehylka9_34U"),
        ("Copiar tablas de Excel a Word", "Integra números en reportes.", "https://www.youtube.com/watch?v=a8YkLFy-z-o"),
        ("Tabla bonita en Word", "Insertar desde el menú Insertar.", "https://www.youtube.com/watch?v=E91YT52s25Q"),
    ],
    "10": [
        ("Presentaciones impactantes", "Jerarquía visual en diapositivas.", "https://www.youtube.com/watch?v=P1rjWm9jqJo"),
        ("Portadas profesionales", "Primera impresión al exponer.", "https://www.youtube.com/watch?v=CxlfFN6-e2E"),
        ("Tutorial PowerPoint completo", "De blanco a presentación lista.", "https://www.youtube.com/watch?v=bm2KoMWV6MU"),
        ("Antes y después universidad", "Contraste diseño amateur vs pro.", "https://www.youtube.com/watch?v=2Uu5u6h84Ig"),
    ],
    "11": [
        ("Transiciones y animaciones", "Movimiento sin distraer.", "https://www.youtube.com/watch?v=6783-cvOum0"),
        ("Animar presentaciones", "Efectos con moderación.", "https://www.youtube.com/watch?v=LomiAAgjZUc"),
        ("Animaciones y transiciones", "Pasos en cinta Animaciones.", "https://www.youtube.com/watch?v=hnuGIbJORao"),
        ("Transición Morph", "Continuidad entre diapositivas.", "https://www.youtube.com/watch?v=G8nUjjJ8jx0"),
    ],
    "12": [
        ("Botones de acción", "Enlaces clicables en la presentación.", "https://www.youtube.com/watch?v=MpWFglBPcYQ"),
        ("Botones de acción Tip TOP", "Menús interactivos en clase.", "https://www.youtube.com/watch?v=O92JvwDjJM0"),
        ("Crear botones de acción", "Formas con hipervínculos.", "https://www.youtube.com/watch?v=5LUG16cugpo"),
        ("Hipervínculos y botones", "Enlaces web e internos.", "https://www.youtube.com/watch?v=d8fpbOOuU1Y"),
    ],
    "13": [
        ("Truco presentaciones PowerPoint", "Diseño rápido para proyecto final.", "https://www.youtube.com/watch?v=xIthSXwv4m0"),
        ("Portada Word o PowerPoint", "Identidad visual unificada.", "https://www.youtube.com/watch?v=CYcV9rI3Lac"),
        ("Word a presentación", "Reutiliza esquemas del informe.", "https://www.youtube.com/watch?v=uNlsnD-8Gwc"),
        ("Presentación con formas", "Creatividad con herramientas básicas.", "https://www.youtube.com/watch?v=adZpBRhbBQ0"),
    ],
}

# 52 TikTok únicos (título, reflexión, url)
TT_POOL: list[tuple[str, str, str]] = [
    ("Trucos Windows 11", "Ajustes del sistema que usarás a diario.", "https://www.tiktok.com/@jorgeizquierdo.tech/video/7358898032588377377"),
    ("Quitar formato en Word", "Pega texto limpio desde la web.", "https://www.tiktok.com/@mtholfsen/video/6946562335381196038"),
    ("Cinco tips de Word", "Atajos para tareas escolares.", "https://www.tiktok.com/@kevinstratvert/video/7234026043320012078"),
    ("Pegar solo texto", "Ctrl+Mayús+V en Word.", "https://www.tiktok.com/@mtholfsen/video/7332634447256341791"),
    ("Copilot y productividad", "Visión del ecosistema Microsoft 365.", "https://www.tiktok.com/@mtholfsen/video/7312590843699891502"),
    ("Transición en PowerPoint", "Efecto entre diapositivas.", "https://www.tiktok.com/@mtholfsen/video/7298860293273242922"),
    ("Minimizar ventanas", "Enfócate en una sola app con Win+Inicio.", "https://www.tiktok.com/@mtholfsen/video/6984140664455875846"),
    ("Tips que ahorran tiempo en PPT", "Flujo más rápido al diseñar.", "https://www.tiktok.com/@mtholfsen/video/7194595853833637162"),
    ("Enviar PPT por correo o PDF", "Comparte tu presentación en un clic.", "https://www.tiktok.com/@mtholfsen/video/6951907647121706245"),
    ("Fórmulas en Excel con IA", "Complemento para tablas en informes.", "https://www.tiktok.com/@mtholfsen/video/7190890071304801582"),
    ("Microsoft 365 Copilot", "Cómo la IA apoya Word y Teams.", "https://www.tiktok.com/@mtholfsen/video/7211269928127712555"),
    ("Funciones de chat en Teams", "Comunicación escolar organizada.", "https://www.tiktok.com/@mtholfsen/video/7230935961289510187"),
    ("Casillas en Excel", "Listas de verificación en proyectos.", "https://www.tiktok.com/@mtholfsen/video/7124439254750547243"),
    ("Outlook salva carreras", "Gestión de correo profesional.", "https://www.tiktok.com/@mtholfsen/video/7005321745871703302"),
    ("Truco de correo Outlook", "Organiza bandeja de entrada.", "https://www.tiktok.com/@mtholfsen/video/7039847444997360901"),
    ("Paint con capas", "Dibujo simple en Windows 11.", "https://www.tiktok.com/@mtholfsen/video/7311474299330874670"),
    ("Recortes con audio", "Graba pantalla sin apps extra.", "https://www.tiktok.com/@mtholfsen/video/7306661854326115627"),
    ("Excel: hojas bonitas", "Formato visual para datos.", "https://www.tiktok.com/@mtholfsen/video/7320753336515300639"),
    ("Privacidad en Google", "Protege tu cuenta y huella digital.", "https://www.tiktok.com/@newesc/video/7456839888454044974"),
    ("Juegos ocultos en Chrome", "Conoce el navegador más allá de buscar.", "https://www.tiktok.com/@aldotecnomaniacos/video/7132176345286642950"),
    ("Metadatos en fotos por correo", "Cuidado al adjuntar imágenes.", "https://www.tiktok.com/@paugarciamila/video/7299523462622743840"),
    ("Correo en iPhone", "Sincronización útil si usas móvil.", "https://www.tiktok.com/@simplealpaca/video/7466595934504275242"),
    ("Arreglar Gmail", "Si no llegan mensajes, revisa configuración.", "https://www.tiktok.com/@simplealpaca/video/7231314457790614826"),
    ("Insertar líneas en Word", "Separa secciones del documento.", "https://www.tiktok.com/@seewhatiseeee/video/7407160404763249921"),
    ("Línea de firma en Word", "Cierra documentos formales.", "https://www.tiktok.com/@seewhatiseeee/video/7464588134668340487"),
    ("Firma en Word online", "Variante para trabajo colaborativo.", "https://www.tiktok.com/@seewhatiseeee/video/7464593730188741895"),
    ("Negrita con Ctrl+B", "Atajo correcto en Word.", "https://www.tiktok.com/@seewhatiseeee/video/7407157175514189057"),
    ("Quitar marca de agua", "Limpia plantillas descargadas.", "https://www.tiktok.com/@seewhatiseeee/video/7469236107704732946"),
    ("Márgenes superior e inferior", "Ajusta espacio antes de imprimir.", "https://www.tiktok.com/@seewhatiseeee/video/7465674464101977351"),
    ("Número de página sin portada", "Formato típico de reportes.", "https://www.tiktok.com/@seewhatiseeee/video/7464242600917142791"),
    ("Encabezado y pie en Word", "Numera hojas en TCC o reportes.", "https://www.tiktok.com/@deborah.monografia/video/7514858086356503813"),
    ("Morph en PowerPoint", "Transición suave entre slides.", "https://www.tiktok.com/@lourrutia.ppt/video/7164312858510118146"),
    ("Animación hover en PPT", "Interactividad al pasar el mouse.", "https://www.tiktok.com/@rob.ppt/video/7161805087147298053"),
    ("Layout con Morph", "Mueve objetos, no los borres.", "https://www.tiktok.com/@theporamat/video/7301679810634566917"),
    ("Tutorial PPT que salva", "Ideas de diseño para exponer.", "https://www.tiktok.com/@lourrutia.ppt/video/7598491632530377991"),
    ("Slide profesional en PPT", "Mejora portadas en minutos.", "https://www.tiktok.com/@lourrutia.ppt/video/7574369970327522567"),
    ("Tips de Excel", "Tablas para datos del proyecto.", "https://www.tiktok.com/@exceltutoriales/video/7606819374598573330"),
    ("Win+E abre Explorador", "Practica el atajo que abre carpetas al instante.", "https://www.tiktok.com/@gabybiondi/video/7326260147284675846"),
    ("Copilot+ PCs", "Hardware nuevo y Windows.", "https://www.tiktok.com/@mtholfsen/video/7371196048162688298"),
    ("Khan en Copilot educativo", "IA responsable en el aula.", "https://www.tiktok.com/@mtholfsen/video/7371498376162053418"),
    ("Power elevado en Word", "Símbolos matemáticos en informes.", "https://www.tiktok.com/@seewhatiseeee/video/7466837295023410450"),
    ("Contar palabras en Word iPad", "Control de extensión en ensayos.", "https://www.tiktok.com/@seewhatiseeee/video/7491210448201682192"),
    ("Duplicados en hoja de cálculo", "Limpia listas de datos.", "https://www.tiktok.com/@seewhatiseeee/video/7490012118431927559"),
    ("Girar cuadro de texto", "Diagramas en documentos.", "https://www.tiktok.com/@seewhatiseeee/video/7489699612194802960"),
    ("Orientación horizontal", "Tablas anchas en una página.", "https://www.tiktok.com/@seewhatiseeee/video/7489273552995208465"),
    ("Mayúsculas en hoja de cálculo", "Formato de encabezados.", "https://www.tiktok.com/@seewhatiseeee/video/7488902741071236369"),
    ("Logo en cada página", "Identidad en informes largos.", "https://www.tiktok.com/@seewhatiseeee/video/7492324842516073744"),
    ("Gmail: recibir y enviar", "Solución si tu bandeja no actualiza.", "https://www.tiktok.com/@simplealpaca/video/7490651402705014062"),
    ("Fondo IA en Fotos Windows", "Herramienta visual incluida en Windows 11.", "https://www.tiktok.com/@mtholfsen/video/7301461450302721"),
    ("Ajustar columnas en Excel", "Deja que Excel calcule el ancho ideal.", "https://www.tiktok.com/@mtholfsen/video/7371758376162053418"),
    ("Copiar y pegar en Windows", "Función esencial que usa todo procesador de textos.", "https://www.tiktok.com/@windows/video/7351123794695654698"),
    ("Win+K para proyectar pantalla", "Conecta tu PC a un televisor o proyector.", "https://www.tiktok.com/@windows/video/736742629814831031"),
]

_ids = [u.split("/video/")[-1].split("?")[0] for _, _, u in TT_POOL]
_seen: set[str] = set()
_deduped: list[tuple[str, str, str]] = []
for item in TT_POOL:
    vid = item[2].split("/video/")[-1].split("?")[0]
    if vid in _seen:
        continue
    _seen.add(vid)
    _deduped.append(item)
TT_POOL = _deduped
_ids = [u.split("/video/")[-1].split("?")[0] for _, _, u in TT_POOL]
if len(TT_POOL) < 52:
    raise SystemExit(f"TikTok pool: faltan {52 - len(TT_POOL)} entradas (hay {len(TT_POOL)})")
if len(set(_ids)) != len(TT_POOL):
    from collections import Counter
    raise SystemExit(f"TikTok duplicados: {[k for k,v in Counter(_ids).items() if v>1]}")


def build_module_videos() -> dict[str, dict[str, list[tuple[str, str, str]]]]:
    out: dict[str, dict[str, list[tuple[str, str, str]]]] = {}
    ti = 0
    for mod, yt_items in YT_BY_MOD.items():
        clips_yt = yt_items[:2]
        cine_yt = yt_items[2:4]
        clips_tt = TT_POOL[ti : ti + 2]
        ti += 2
        cine_tt = TT_POOL[ti : ti + 2]
        ti += 2
        out[mod] = {
            "clips": clips_yt + clips_tt,
            "cine": cine_yt + cine_tt,
        }
    return out

VIDEOS = build_module_videos()
