# estudIA PDF Bundler Makefile
# Automatiza la generación de módulos educativos en formato PDF premium

.PHONY: all filosofia dhp computacion clean install help

# Variables
BIN_PATH = ./bin/generate-pdf.js
EXPORT_DIR = ./exports

all: filosofia dhp computacion

help:
	@echo "estudIA PDF Generation Commands:"
	@echo "  make all         - Genera todos los PDFs de las materias actuales"
	@echo "  make filosofia   - Genera el PDF de Filosofía I"
	@echo "  make dhp         - Genera el PDF de Desarrollo de Habilidades del Pensamiento"
	@echo "  make computacion - Genera el PDF de Computación Básica I"
	@echo "  make clean       - Elimina los archivos PDF generados"
	@echo "  make install     - Instala las dependencias necesarias"

filosofia:
	@echo "🚀 Generando PDF: Filosofía I..."
	@node $(BIN_PATH) 1 Filosofia_I

dhp:
	@echo "🚀 Generando PDF: DHP..."
	@node $(BIN_PATH) 1 Desarrollo_de_Habilidades_del_Pensamiento

computacion:
	@echo "🚀 Generando PDF: Computación Básica I..."
	@node $(BIN_PATH) 1 Computacion_Basica_I

clean:
	@echo "🧹 Limpiando carpeta de exportaciones..."
	@rm -rf $(EXPORT_DIR)/*.pdf

install:
	@echo "📦 Instalando dependencias de Node.js..."
	@cd bin && npm install
