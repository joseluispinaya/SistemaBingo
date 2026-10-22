const columnas = ["B", "I", "N", "G", "O"];

function generarCodigoFigura() {
    let idFigura = document.getElementById("figuraId").value.trim();
    let nombreFigura = document.getElementById("figuraNombre").value.trim();
    let coordenadas = [];

    if (idFigura === "" || nombreFigura === "") {
        swal("Atención", "⚠️ Debes ingresar un ID y un Nombre para la figura.", "warning");
        return;
    }

    columnas.forEach(col => {
        for (let fila = 0; fila < 5; fila++) {
            if (col === "N" && fila === 2) continue;

            let idCheckbox = col + fila;
            let checkbox = document.getElementById(idCheckbox);

            if (checkbox && checkbox.checked) {
                coordenadas.push([col, fila]);
            }
        }
    });

    if (coordenadas.length === 0) {
        swal("Mensaje", "⚠️ Debes seleccionar al menos una casilla en el cartón.", "warning");
        return;
    }

    // 1. Armamos el string de coordenadas de forma manual y compacta
    let stringCoordenadas = "[" + coordenadas.map(c => `["${c[0]}",${c[1]}]`).join(",") + "]";

    // 2. Armamos el objeto JSON base sin las coordenadas
    let objetoBase = {
        id: idFigura,
        nombre: nombreFigura,
        tipo: "coordenadas"
    };

    // 3. Convertimos el objeto base a texto con formato bonito
    let textoBase = JSON.stringify(objetoBase, null, 4);

    // 4. Inyectamos la línea de coordenadas antes de cerrar la llave del JSON
    //let textoSalida = textoBase.substring(0, textoBase.lastIndexOf("}")) + `    "coordenadas": ${stringCoordenadas}\n}`;

    let textoSalida = textoBase.replace(/\n\}/, `,\n    "coordenadas": ${stringCoordenadas}\n}`);
    document.getElementById("codigoSalida").value = textoSalida;
}

function generarCodigoFiguraOriginal() {
    let idFigura = document.getElementById("figuraId").value.trim();
    let nombreFigura = document.getElementById("figuraNombre").value.trim();
    let coordenadas = [];

    // Validar que se ingresen los datos básicos
    if (idFigura === "" || nombreFigura === "") {
        swal("Atención", "⚠️ Debes ingresar un ID y un Nombre para la figura.", "warning");
        return;
    }

    // Recolectar las coordenadas marcadas
    columnas.forEach(col => {
        for (let fila = 0; fila < 5; fila++) {
            if (col === "N" && fila === 2) continue; // Ignorar el centro

            let idCheckbox = col + fila;
            let checkbox = document.getElementById(idCheckbox);

            if (checkbox && checkbox.checked) {
                coordenadas.push([col, fila]);
            }
        }
    });

    if (coordenadas.length === 0) {
        swal("Mensaje", "⚠️ Debes seleccionar al menos una casilla en el cartón.", "warning");
        return;
    }

    // Crear el objeto con la estructura deseada
    let objetoJSON = {
        id: idFigura,
        nombre: nombreFigura,
        tipo: "coordenadas",
        coordenadas: coordenadas
    };

    // Convertir el objeto a String con formato (indentación de 4 espacios)
    let textoSalida = JSON.stringify(objetoJSON, null, 4);
    
    // Si necesitas que termine con coma para pegarlo en un arreglo directamente, descomenta la siguiente línea:
    // textoSalida = textoSalida + ",";

    document.getElementById("codigoSalida").value = textoSalida;
}

function copiarAlPortapapeles() {
    let texto = document.getElementById("codigoSalida").value;

    if (!texto) {
        swal("Atención", "No hay código generado para copiar.", "warning");
        return;
    }

    // API nativa del navegador para copiar al portapapeles
    navigator.clipboard.writeText(texto).then(() => {
        swal("¡Copiado!", "El código JSON se ha copiado al portapapeles listo para pegar en tu archivo figuras.json.", "success");
    }).catch(err => {
        console.error("Error al copiar: ", err);
        swal("Error", "No se pudo copiar el texto automáticamente.", "error");
    });
}

function limpiarFormulario() {
    // Desmarcar todos los checkboxes
    columnas.forEach(col => {
        for (let fila = 0; fila < 5; fila++) {
            if (col === "N" && fila === 2) continue;
            let idCheckbox = col + fila;
            let checkbox = document.getElementById(idCheckbox);
            if (checkbox) checkbox.checked = false;
        }
    });

    // Limpiar inputs y textarea
    document.getElementById("figuraId").value = "";
    document.getElementById("figuraNombre").value = "";
    document.getElementById("codigoSalida").value = "";
}

// Asignación de Eventos
$('#btnGenerar').on('click', generarCodigoFigura);
$('#btnCopiar').on('click', copiarAlPortapapeles);
$('#btnLimpiar').on('click', limpiarFormulario);