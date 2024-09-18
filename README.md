# Equipo
David Coronel  
Emanuel Pinasco  
Tomas Martinez  
Sara  
Lucas  
Paulo  
Pablo  
Emiliano  
Juan

# Anti-clickbait Plugin

Este repositorio contiene el código fuente para un plugin de Google Chrome llamado Anti-clickbait Plugin, que evalúa el nivel de clickbait de los titulares en medios digitales y muestra un porcentaje indicativo del nivel de engaño o exageración.

## Descripción

El Anti-clickbait Plugin está diseñado para detectar y mostrar el porcentaje de clickbait en los títulos de artículos de medios digitales. Utiliza una combinación de análisis de contenido y evaluación basada en criterios como el sensacionalismo, la expectativa vs. la realidad, y la desconexión entre el título y el contenido real del artículo.

### Características:
- Detecta y evalúa el nivel de clickbait en artículos web.
- Muestra el porcentaje de engaño directamente en la página web.
- Permite a los usuarios evaluar si un título es engañoso o si está alineado con el contenido del artículo.
  
## Estructura del Proyecto

El repositorio incluye los siguientes archivos clave:

- `manifest.json`: Define los permisos y configuraciones del plugin, incluyendo el uso de scripts de contenido para interactuar con las páginas web.
- `content.js`: Contiene el código encargado de analizar los títulos de los artículos y determinar el porcentaje de clickbait.
- `popup.html`: Proporciona la interfaz de usuario que muestra el porcentaje de clickbait detectado.
- `popup.js`: Maneja la lógica que conecta el contenido analizado con la visualización en el popup.

## Cómo Funciona

El plugin se instala como una extensión de Chrome que actúa en las páginas web de medios digitales. Al detectar un título potencialmente engañoso, el sistema realiza los siguientes pasos:

1. **Análisis del Título y Contenido**: Se evalúa el título en función de su relación con el contenido utilizando criterios como sensacionalismo, relevancia y coherencia.
2. **Cálculo del Porcentaje de Clickbait**: Se calcula un porcentaje basado en el nivel de exageración del título.
3. **Visualización del Resultado**: El porcentaje de clickbait se muestra visualmente sobre la página, con un indicador de color que va de verde (bajo clickbait) a rojo (alto clickbait).
4. **Modificación de Títulos**: En caso de un título engañoso, el sistema sugiere un nuevo título más preciso.

## Instalación

Para instalar el plugin en tu navegador Google Chrome:

1. Clona este repositorio en tu máquina local.
   ```bash
   git clone https://github.com/tu-repo/anti-clickbait-plugin.git
   ```
2. Abre Google Chrome y navega a `chrome://extensions/`.
3. Activa el modo de desarrollador en la esquina superior derecha.
4. Haz clic en "Cargar extensión descomprimida" y selecciona la carpeta donde clonaste este repositorio.
5. El plugin debería instalarse y estar listo para usar.

## Uso

1. Navega a un sitio web de noticias.
2. El plugin analizará los títulos de los artículos y mostrará el porcentaje de clickbait directamente en la página.
3. Además, puedes abrir el popup de la extensión para ver un resumen del porcentaje de clickbait en toda la página.

## Permisos

Este plugin requiere el permiso de acceso a la pestaña activa (`activeTab`) para poder analizar el contenido de las páginas web.

## Contribuciones

Si deseas contribuir a este proyecto:

1. Crea un fork de este repositorio.
2. Realiza tus cambios en una nueva rama.
3. Envía un pull request describiendo los cambios propuestos.
