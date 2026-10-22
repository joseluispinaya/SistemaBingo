
let cartones = [];
let historial = []; // aquí guardamos todos los números cantados con su columna

// Rangos válidos por columna
const rangos = {
    B: [1, 15],
    I: [16, 30],
    N: [31, 45],
    G: [46, 60],
    O: [61, 75]
};

// Variable global que se llenará con los datos del JSON
let catalogoFiguras = [];
let figurasDelDia = []; // Almacenará solo la selección actual

function mostrarAlerta(titulo, mensaje, tipo) {

    let btnClass = 'btn-default';

    // Asignamos el color del botón según el estilo de Color Admin
    if (tipo === 'success') btnClass = 'btn-success';
    else if (tipo === 'warning') btnClass = 'btn-warning';
    else if (tipo === 'error') btnClass = 'btn-danger';
    else if (tipo === 'info') btnClass = 'btn-info';

    swal({
        title: titulo,
        text: mensaje,
        icon: tipo,
        closeOnClickOutside: false,
        buttons: {
            confirm: {
                text: 'Aceptar',
                value: true,
                visible: true,
                className: 'btn ' + btnClass, // Estilo Color Admin
                closeModal: true
            }
        }
    });
}

$(document).ready(function() {
    fetch('figuras.json') 
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar el archivo de figuras");
            return response.json();
        })
        .then(data => {
            catalogoFiguras = data;
            cargarFigurasEnModal(); 
            // Solo pintamos los checkboxes DESPUÉS de tener los datos
            cargarCheckboxesPantallaPrincipal();
        })
        .catch(error => {
            console.error("Detalle del error:", error);
            swal("Error", "No se pudo cargar el catálogo de figuras.", "error");
        });
});

// 1. Pinta TODAS las figuras dentro del Modal (En 4 columnas)
function cargarFigurasEnModal() {
    let contenedor = document.getElementById("contenedorModalFiguras");
    let html = ''; // Iniciamos un solo string vacío

    catalogoFiguras.forEach((figura) => {
        // Envolvemos el form-check en un div de columna
        // col-6 (2 columnas en móvil), col-sm-4 (3 columnas en tablet), col-md-3 (4 columnas en escritorio)
        html += `
        <div class="col-6 col-sm-4 col-md-3 mb-2">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${figura.id}" id="cfg_${figura.id}">
                <label class="form-check-label text-truncate w-100" title="${figura.nombre}" for="cfg_${figura.id}">
                    ${figura.nombre}
                </label>
            </div>
        </div>`;
    });

    contenedor.innerHTML = html;
}


$('#btnGuardarConfiguracion').on('click', function() {
    // Filtramos el catálogo viendo cuáles checkboxes del modal están marcados
    figurasDelDia = catalogoFiguras.filter(f => document.getElementById("cfg_" + f.id).checked);
    
    // Ejecutamos la carga en la pantalla principal
    cargarCheckboxesPantallaPrincipal();
    
    // Cerramos el modal
    $('#modalConfigurarFiguras').modal('hide');
    swal("¡Listo!", "Panel de jugadas actualizado para hoy.", "success");
});

function cargarCheckboxesPantallaPrincipal() {
    let contenedor = document.getElementById("contenedorFiguras");
    let htmlCol1 = '<div class="col-sm-6">';
    let htmlCol2 = '<div class="col-sm-6">';
    
    let mitad = Math.ceil(figurasDelDia.length / 2);

    figurasDelDia.forEach((figura, index) => {
        // Aquí usamos el ID original exacto para que el validador lo reconozca
        let checkboxHTML = `
        <div class="form-check mb-2">
            <input class="form-check-input check-figura" type="checkbox" value="${figura.id}" id="${figura.id}">
            <label class="form-check-label" for="${figura.id}">
                ${figura.nombre}
            </label>
        </div>`;

        if (index < mitad) htmlCol1 += checkboxHTML;
        else htmlCol2 += checkboxHTML;
    });

    // Si no seleccionó nada, mostramos un mensaje
    if (figurasDelDia.length === 0) {
        contenedor.innerHTML = '<div class="col-12 text-center text-muted">No hay jugadas configuradas. Usa el botón superior.</div>';
    } else {
        contenedor.innerHTML = htmlCol1 + '</div>' + htmlCol2 + '</div>';
    }
}

// registro de cartones
function registrarCarton() {
    let id = document.getElementById("cartonId").value.trim();
    //let id = $("#cartonId").val().trim();
    let numeros = document.getElementById("numerosCarton").value.trim().split(",").map(n => n.trim());

    if (numeros.length !== 24) {
        swal("Mensaje", "Debe ingresar exactamente 24 números.", "warning");
        return;
    }

    if (id === "") {
        mostrarAlerta("Mensaje", "Debe ingresar el Codigo del carton.", "warning");
        //swal("Mensaje", "Debe ingresar el Codigo del carton.", "warning");
        $("#cartonId").focus();
        return;
    }

    let carton_encontrado = cartones.filter(carton => carton.id === id)
    if (carton_encontrado.length > 0) {
        swal("Mensaje", "El Codigo del Carton ya fue Agregado", "warning")
        return;
    }

    // Estructura en columnas
    let estructura = { B: [], I: [], N: [], G: [], O: [] };
    let index = 0;
    for (let col of ["B", "I", "N", "G", "O"]) {
        for (let fila = 0; fila < 5; fila++) {
            if (col === "N" && fila === 2) {
                estructura[col].push(null); // casilla libre
            } else {
                estructura[col].push(parseInt(numeros[index]));
                index++;
            }
        }
    }

    cartones.push({ id, numeros: estructura, marcados: [], ganador: false }); // 👈 agregado "ganador"
    //cartones.push({ id, numeros: estructura, marcados: [] });
    mostrarCartones();
    verCartonesBtn();
    document.getElementById("cartonId").value = "";
    document.getElementById("numerosCarton").value = "";
}

function mostrarCartones() {
    let cont = document.getElementById("cartones");
    cont.innerHTML = "";
    cartones.forEach(carton => {
        let tabla = `<div class="carton"><h6>${carton.id}</h6><table><tr><th>B</th><th>I</th><th>N</th><th>G</th><th>O</th></tr>`;
        for (let fila = 0; fila < 5; fila++) {
            tabla += "<tr>";
            for (let col of ["B", "I", "N", "G", "O"]) {
                let num = carton.numeros[col][fila];
                let marcado = carton.marcados.includes(num) ? "marked" : "";
                tabla += `<td class="${marcado}">${num === null ? '<i class="fa fa-star text-warning"></i>' : num}</td>`;
                //tabla += `<td class="${marcado}">${num === null ? "" : num}</td>`;
            }
            tabla += "</tr>";
        }
        tabla += "</table></div>";
        cont.innerHTML += tabla;
    });
}

function verCartonesBtn() {
    $("#listaCartonesBtn").empty();

    cartones.forEach(carton => {
        // Solo el botón, sin el div contenedor
        const cardHtml = `
        <button type="button" class="btn btn-danger btn-sm btn-quitar" data-id="${carton.id}">
            <i class="fas fa-trash-alt me-1"></i>${carton.id}
        </button>`;

        $("#listaCartonesBtn").append(cardHtml);
    });
}

function quitarCarton(IdCarton) {
    // confirmación antes de borrar
    swal({
        title: "¿Estás seguro?",
        text: "Se eliminará el cartón con ID: " + IdCarton,
        icon: "warning",
        buttons: ["Cancelar", "Eliminar"],
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            // filtrar para dejar solo los que no coinciden
            cartones = cartones.filter(carton => carton.id != IdCarton);

            // refrescar la vista
            mostrarCartones();
            verCartonesBtn();
            swal("Hecho", "✅ Cartón eliminado correctamente", "success");

        }
    });
}

$(document).on("click", "#listaCartonesBtn .btn-quitar", function () {
    const id = $(this).data("id");
    quitarCarton(id);
});

$('#btnAgregarCarton').on('click', function () {
    registrarCarton();
})

// Esta función reemplaza a esFigura y maneja todos los casos
function validarRegla(carton, regla) {
    
    // 1. Si la regla es por CONTEO (como tu tiene10Marcados)
    if (regla.tipo === "conteo") {
        let marcadosValidos = carton.marcados.filter(n => n !== null).length;
        return marcadosValidos >= regla.cantidadObjetivo;
    }

    // 2. Si la regla es por N COLUMNAS (Doble Vertical, etc.)
    if (regla.tipo === "n_columnas") {
        let columnasCompletas = regla.columnasValidas.filter(col => {
            return [0, 1, 2, 3, 4].every(fila => {
                let num = carton.numeros[col][fila];
                return num === null || carton.marcados.includes(num);
            });
        });
        // Usamos >= por si completó 3 columnas, igual debería ganar la de 2
        return columnasCompletas.length >= regla.cantidadRequerida;
    }

    // 3. NUEVA: Si la regla es por N FILAS (Doble Horizontal)
    if (regla.tipo === "n_filas") {
        let filasCompletas = regla.filasValidas.filter(fila => {
            // Para cada fila válida, verificamos que sus 5 columnas (B,I,N,G,O) estén marcadas
            return ["B", "I", "N", "G", "O"].every(col => {
                let num = carton.numeros[col][fila];
                return num === null || carton.marcados.includes(num);
            });
        });
        // Retorna true si logró al menos la cantidad de filas completas requeridas
        return filasCompletas.length >= regla.cantidadRequerida;
    }

    // 3. Si la regla es por COORDENADAS (como las figuras creadas en el HTML)
    if (regla.coordenadas) {
        return regla.coordenadas.every(([col, fila]) => {
            let num = carton.numeros[col][fila];
            return num === null || carton.marcados.includes(num);
        });
    }

    // Si se agrega un nuevo "tipo" en el futuro (ej. "solo_letras"), se añade aquí.
    return false;
}

function verificarJugadas(cartones) {
    let resultados = [];
    
    // Obtenemos solo las figuras que tienen el checkbox marcado
    let figurasSeleccionadas = catalogoFiguras.filter(f => {
        let check = document.getElementById(f.id);
        return check && check.checked;
    });

    if (figurasSeleccionadas.length === 0) return resultados; // Retornamos arreglo vacío
    //if (figurasSeleccionadas.length === 0) return;

    cartones.forEach(carton => {
        let jugadasGanadas = [];

        figurasSeleccionadas.forEach(regla => {
            // Llamamos al validador universal pasando el cartón y la regla completa
            if (validarRegla(carton, regla)) {
                jugadasGanadas.push(regla.nombre);
                document.getElementById(regla.id).checked = false; // Desmarcar
            }
        });

        if (jugadasGanadas.length > 0) {
            resultados.push({ id: carton.id, jugadas: jugadasGanadas });
        }
    });

    return resultados; // Retornamos los datos para usarlos fuera
}

function marcarNumero() {
    let col = document.getElementById("columna").value;
    let num = parseInt(document.getElementById("numeroCantado").value);

    if (isNaN(num)) {
        swal("Mensaje", "Debe ingresar un Numero", "warning")
        return;
    }

    if (cartones.length === 0) {
        swal("Mensaje", "⚠️ No hay Cartones para Jugar.", "warning")
        return;
    }

    // 1. Validar rango de la columna
    let [min, max] = rangos[col];
    if (num < min || num > max) {
        swal("Advertencia", `❌ El número ${num} no corresponde a la columna ${col} (rango válido: ${min}-${max}).`, "warning");
        return;
    }

    // 2. Validar que no se cante el mismo número dos veces
    let clave = `${col}${num}`;
    if (historial.includes(clave)) {
        swal("Advertencia", `⚠️ El número ${col}-${num} ya fue cantado.`, "warning");
        return;
    }
    historial.push(clave); // guardamos en el historial

    let ganadoresBingo = []; // Separamos los ganadores de Cartón Lleno

    cartones.forEach(carton => {
        // si ya es ganador, no lo volvemos a comprobar
        if (carton.ganador) return;

        // Buscar y marcar el número en la columna correspondiente
        if (carton.numeros[col].includes(num)) {
            if (!carton.marcados.includes(num)) carton.marcados.push(num);
        }
        // Casilla del centro libre siempre marcada
        if (!carton.marcados.includes(null)) carton.marcados.push(null);

        // Verificar si completó todo y ganó
        let totalMarcados = carton.marcados.filter(n => n !== null).length;
        if (totalMarcados >= 24) {
            carton.ganador = true; // marcamos como ganador
            ganadoresBingo.push(carton.id); // lo agregamos a la lista de ganadores
        }

    });

    // 1. Obtenemos las figuras ganadas en este turno
    let ganadoresFiguras = verificarJugadas(cartones);

    // 2. Evaluamos si hay ALGÚN tipo de ganador (Bingo o Figura)
    if (ganadoresBingo.length > 0 || ganadoresFiguras.length > 0) {
        let mensajeConsolidado = "";

        // Bloque para Cartón Lleno
        if (ganadoresBingo.length > 0) {
            mensajeConsolidado += "🏆 ¡BINGO (Cartón Lleno)!\n";
            mensajeConsolidado += "Ganadores: " + ganadoresBingo.join(", ") + "\n\n";
        }

        // Bloque para Figuras
        if (ganadoresFiguras.length > 0) {
            mensajeConsolidado += "🎉 ¡Figuras Completadas!\n";
            ganadoresFiguras.forEach(r => {
                mensajeConsolidado += `Cartón ${r.id} → ${r.jugadas.join(", ")}\n`;
            });
        }

        // Disparamos UN SOLO swal con toda la información
        mostrarAlerta("¡Felicidades!", mensajeConsolidado, "success");
        //swal("¡Felicidades!", mensajeConsolidado, "success");
    }

    mostrarCartones();
    document.getElementById("numeroCantado").value = "";
}

$('#btnNumeroCantado').on('click', function () {
    marcarNumero();
})

function volverAtras() {
    if (historial.length === 0) {
        swal("Advertencia", "⚠️ No hay números para deshacer.", "warning");
        return;
    }

    swal({
        title: "¿Estás seguro?",
        text: "↩️ Se deshará el último número cantado.",
        icon: "warning",
        buttons: ["Cancelar", "Sí, deshacer"],
        dangerMode: true,
    }).then((confirmado) => {
        if (confirmado) {
            // Sacar el último número cantado
            let ultimaClave = historial.pop(); // ej: "B8"
            let col = ultimaClave[0];          // "B"
            let num = parseInt(ultimaClave.slice(1)); // "8" → 8

            // Quitar el número de todos los cartones
            cartones.forEach(carton => {
                let index = carton.marcados.indexOf(num);
                if (index !== -1) {
                    carton.marcados.splice(index, 1);
                }
                carton.ganador = false; // resetear ganador
            });

            // Actualizar la vista
            mostrarCartones();

            swal("Hecho", `✅ Se deshizo el número ${col}-${num}.`, "success");
        }
    });
}

$('#btnAtras').on('click', function () {
    volverAtras();
})

function reiniciarCarton() {
    // Limpiar las marcas de cada cartón
    cartones.forEach(carton => {
        carton.marcados = []; // Vacía los números marcados
        carton.ganador = false; // también reiniciamos el estado de ganador
    });

    // Limpiar historial de números cantados
    historial = [];

    // Actualizar la vista
    mostrarCartones();

    swal("Mensaje", "🔄 Juego reiniciado. Puedes volver a jugar con los mismos cartones.", "warning");
}

$('#btnNuevoJuego').on('click', function () {
    reiniciarCarton();
})
