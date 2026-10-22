# Sistema de Bingo Dinámico

Una aplicación web interactiva para la gestión, juego y validación automática de partidas de Bingo. Este sistema permite a un anfitrión registrar cartones, cantar números a través de un tablero de control visual y validar múltiples jugadas o figuras en tiempo real utilizando un motor de reglas basado en JSON.

## 🚀 Características Principales

* **Tablero Maestro Interactivo:** Tablero de 75 números que permite marcar las bolas cantadas con un clic, preveniendo clics accidentales y errores de tipeo.
* **Validación de Reglas Automática:** El sistema evalúa instantáneamente todos los cartones activos para detectar ganadores de "Cartón Lleno" o figuras preconfiguradas.
* **Motor Orientado a Datos (Data-Driven):** Las figuras ganadoras (como "La L", "Diagonal", "Doble Vertical") se cargan dinámicamente desde un archivo `figuras.json`. Soporta validación por coordenadas exactas, cantidad de filas o cantidad de columnas.
* **Creador de Figuras Integrado:** Incluye una interfaz (`crear_figura.html`) donde el administrador puede dibujar nuevas figuras haciendo clic en una cuadrícula y generar automáticamente el código JSON correspondiente.
* **Historial y Prevención de Errores:** Panel de ganadores persistente y un botón de "Deshacer" que permite revertir el último número cantado, recalculando el estado de victoria de todos los cartones al instante.
* **Interfaz Responsiva:** Diseño limpio y moderno adaptado con Bootstrap 5, utilizando contenedores con scroll nativo para manejar grandes volúmenes de cartones sin deformar la pantalla.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Framework CSS:** Bootstrap 5 (Estilo basado en Color Admin).
* **Librerías Adicionales:** 
  * [SweetAlert](https://sweetalert.js.org/) para notificaciones y modales de confirmación.
  * [FontAwesome](https://fontawesome.com/) para iconografía.

## 📂 Estructura del Proyecto

* `/assets/` - Contiene los estilos base, fuentes y librerías externas (Bootstrap, utilidades).
* `/js/` - Lógica principal del juego (`imperialmejor.js`) y del creador de figuras (`crearjugada.js`).
* `bingo_mejor.html` - Pantalla principal del juego (Tablero, cartones, historial).
* `crear_figura.html` - Herramienta visual para diseñar nuevas figuras y exportar JSON.
* `figuras.json` - Catálogo de reglas y figuras permitidas en el juego.

## ⚙️ Instalación y Uso

Al ser un proyecto frontend estático que utiliza la API `fetch` para leer el archivo `figuras.json`, necesita ejecutarse en un servidor web local para evitar restricciones de CORS del navegador.

1. Clona este repositorio: `git clone https://github.com/tu-usuario/sistemabingo.git`
2. Abre la carpeta del proyecto en tu editor de código (ej. Visual Studio Code).
3. Inicia un servidor local. Si usas VS Code, puedes instalar la extensión **Live Server** y hacer clic en "Go Live" sobre el archivo `bingo_mejor.html`.
4. En el modal inicial, selecciona las figuras con las que deseas jugar la ronda.
5. Registra los cartones (puedes usar el botón de prueba para cargar cartones predeterminados) y comienza a cantar los números desde el tablero.

## 🧠 Lógica de Configuración de Figuras (`figuras.json`)

El motor de reglas soporta distintos tipos de validación. Puedes agregar nuevas figuras al JSON sin tocar el código JavaScript:

```json
{
    "id": "chk_doblevertical",
    "nombre": "Doble Vertical",
    "tipo": "n_columnas",
    "columnasValidas": ["B", "I", "G", "O"],
    "cantidadRequerida": 2
}