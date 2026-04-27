# estudIA Management Makefile
# ---------------------------------------------------------
# Automatiza la generación de PDFs y la plataforma web.

# Colors
CYAN  := $(shell tput -Txterm setaf 6)
RESET := $(shell tput -Txterm sgr0)
GREEN := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)

.PHONY: all filosofia dhp computacion clean install help web-dev web-build web-preview

# Variables
BIN_PATH = ./bin/generate-pdf.js
EXPORT_DIR = ./exports

all: filosofia dhp computacion

help:
	@echo ""
	@echo "${CYAN}estudIA - Sistema de Gestión de Contenidos${RESET}"
	@echo "---------------------------------------------------------"
	@echo "${YELLOW}Comandos de Plataforma Web:${RESET}"
	@echo "  ${GREEN}make web-dev${RESET}     - Inicia el servidor de desarrollo (Hot Reload)"
	@echo "  ${GREEN}make web-build${RESET}   - Compila la web y genera el índice subjects.json"
	@echo "  ${GREEN}make web-preview${RESET} - Previsualiza la compilación de producción"
	@echo ""
	@echo "${YELLOW}Comandos de Generación PDF:${RESET}"
	@echo "  ${GREEN}make all${RESET}         - Genera los PDFs de todas las materias"
	@echo "  ${GREEN}make filosofia${RESET}   - Genera PDF de Filosofía I"
	@echo "  ${GREEN}make dhp${RESET}         - Genera PDF de DHP"
	@echo "  ${GREEN}make computacion${RESET} - Genera PDF de Computación Básica I"
	@echo ""
	@echo "${YELLOW}Mantenimiento:${RESET}"
	@echo "  ${GREEN}make install${RESET}     - Instala dependencias del proyecto"
	@echo "  ${GREEN}make clean${RESET}       - Limpia archivos temporales y exportaciones"
	@echo "---------------------------------------------------------"

filosofia:
	@echo "🚀 ${CYAN}Generando PDF: Filosofía I...${RESET}"
	@node $(BIN_PATH) 1 Filosofia_I

dhp:
	@echo "🚀 ${CYAN}Generando PDF: DHP...${RESET}"
	@node $(BIN_PATH) 1 Desarrollo_de_Habilidades_del_Pensamiento

computacion:
	@echo "🚀 ${CYAN}Generando PDF: Computación Básica I...${RESET}"
	@node $(BIN_PATH) 1 Computacion_Basica_I

web-dev:
	@echo "🌐 ${CYAN}Iniciando entorno de desarrollo web...${RESET}"
	@npm run dev

web-build:
	@echo "🏗️  ${CYAN}Compilando plataforma web...${RESET}"
	@npm run build

web-preview:
	@echo "👁️  ${CYAN}Previsualizando build de producción...${RESET}"
	@npm run preview

clean:
	@echo "🧹 ${YELLOW}Limpiando carpeta de exportaciones...${RESET}"
	@rm -rf $(EXPORT_DIR)/*.pdf

install:
	@echo "📦 ${GREEN}Instalando dependencias de Node.js...${RESET}"
	@npm install
	@cd bin && npm install
