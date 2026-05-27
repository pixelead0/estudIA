# estudIA Management Makefile
# ---------------------------------------------------------
# Automatiza la generación de PDFs y la plataforma web (Vite → dist/).

# Colors
CYAN  := $(shell tput -Txterm setaf 6)
RESET := $(shell tput -Txterm sgr0)
GREEN := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)

.DEFAULT_GOAL := help

.PHONY: help all filosofia dhp computacion clean install \
	web-dev web-build web-preview web-index web-clean web-rebuild

# Variables
BIN_PATH    = ./bin/generate-pdf.js
EXPORT_DIR  = ./exports
DIST_DIR    = ./dist

all: filosofia dhp computacion

help:
	@echo ""
	@echo "${CYAN}estudIA — contenidos y plataforma web${RESET}"
	@echo "---------------------------------------------------------"
	@echo "${YELLOW}Plataforma web (local: ${GREEN}http://localhost:5173${RESET}${YELLOW} con web-dev)${RESET}"
	@echo "  ${GREEN}make web-dev${RESET}      - Servidor Vite con recarga en caliente"
	@echo "  ${GREEN}make web-build${RESET}    - Genera subjects.json, compila a ${DIST_DIR}/ y copia 1/, assets/"
	@echo "  ${GREEN}make web-preview${RESET}  - Sirve ${DIST_DIR}/ (ejecuta web-build antes si no existe)"
	@echo "  ${GREEN}make web-index${RESET}    - Solo regenera subjects.json (npm run pre-index)"
	@echo "  ${GREEN}make web-clean${RESET}    - Borra ${DIST_DIR}/"
	@echo "  ${GREEN}make web-rebuild${RESET}  - web-clean + web-build"
	@echo ""
	@echo "${YELLOW}PDFs por materia${RESET}"
	@echo "  ${GREEN}make all${RESET}          - Todos los PDFs"
	@echo "  ${GREEN}make filosofia${RESET}      - Filosofía I"
	@echo "  ${GREEN}make dhp${RESET}            - Desarrollo de Habilidades del Pensamiento"
	@echo "  ${GREEN}make computacion${RESET}    - Computación Básica I"
	@echo ""
	@echo "${YELLOW}Mantenimiento${RESET}"
	@echo "  ${GREEN}make install${RESET}      - npm install en la raíz y en bin/"
	@echo "  ${GREEN}make clean${RESET}        - Quita PDFs en $(EXPORT_DIR)/"
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
	@echo "🌐 ${CYAN}Vite en http://localhost:5173 (Ctrl+C para salir)${RESET}"
	@npm run dev

web-build:
	@echo "🏗️  ${CYAN}Compilando plataforma web → $(DIST_DIR)/${RESET}"
	@npm run build

web-preview:
	@if [ ! -f $(DIST_DIR)/index.html ]; then \
		echo "${YELLOW}No hay build en $(DIST_DIR)/; ejecutando web-build…${RESET}"; \
		$(MAKE) web-build; \
	fi
	@echo "👁️  ${CYAN}Preview en http://localhost:4173 (Ctrl+C para salir)${RESET}"
	@npm run preview

web-index:
	@echo "📇 ${CYAN}Regenerando subjects.json${RESET}"
	@npm run pre-index

web-clean:
	@echo "🧹 ${YELLOW}Eliminando $(DIST_DIR)/${RESET}"
	@rm -rf $(DIST_DIR)

web-rebuild: web-clean web-build

clean:
	@echo "🧹 ${YELLOW}Limpiando carpeta de exportaciones...${RESET}"
	@rm -rf $(EXPORT_DIR)/*.pdf

install:
	@echo "📦 ${GREEN}Instalando dependencias de Node.js...${RESET}"
	@npm install
	@cd bin && npm install
