

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

let cartonLlenoFigura = []; // Almacenará los cartones ganadores por figura o llena

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

$(document).ready(function () {
    renderizarTableroMaestro();
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

    //cargarCartonesPrueba();
});

// --- 1. FUNCIÓN PARA GENERAR EL TABLERO MAESTRO ---
function renderizarTableroMaestro() {
    let html = `<div class="tablero-maestro">
                    <table>
                        <thead>
                            <tr><th>B</th><th>I</th><th>N</th><th>G</th><th>O</th></tr>
                        </thead>
                        <tbody>`;

    let letras = ["B", "I", "N", "G", "O"];

    // El bingo tiene 15 filas (del 1 al 15, del 16 al 30...)
    for (let fila = 0; fila < 15; fila++) {
        html += `<tr>`;
        letras.forEach((columna) => {
            let numInicio = rangos[columna][0]; // Ej: B inicia en 1, I en 16
            let numero = numInicio + fila;

            // Creamos un botón circular por cada número
            html += `<td>
                        <button type="button" class="btn-bola" id="btn-bola-${columna}-${numero}" 
                                onclick="cantarNumeroTablero('${columna}', ${numero})">
                            ${numero}
                        </button>
                     </td>`;
        });
        html += `</tr>`;
    }

    html += `</tbody></table></div>`;
    document.getElementById("tableroControlNumeros").innerHTML = html;
}

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


$('#btnGuardarConfiguracion').on('click', function () {
    // Filtramos el catálogo viendo cuáles checkboxes del modal están marcados
    figurasDelDia = catalogoFiguras.filter(f => document.getElementById("cfg_" + f.id).checked);

    // Ejecutamos la carga en la pantalla principal
    cargarCheckboxesPantallaPrincipal();

    // Cerramos el modal
    $('#modalConfigurarFiguras').modal('hide');

    MensajeToast("¡Listo!", "Jugadas agregadas.", "success");

    //swal("¡Listo!", "Panel de jugadas actualizado para hoy.", "success");
});

function cargarCheckboxesPantallaPrincipal() {
    let contenedor = document.getElementById("contenedorFiguras");
    let html = '';

    figurasDelDia.forEach((figura) => {
        html += `
        <div class="col-6 col-md-4 mb-2">
            <div class="form-check">
                <input class="form-check-input check-figura" type="checkbox" value="${figura.id}" id="${figura.id}">
                <label class="form-check-label text-truncate w-100" title="${figura.nombre}" for="${figura.id}">
                    ${figura.nombre}
                </label>
            </div>
        </div>`;
    });

    if (figurasDelDia.length === 0) {
        contenedor.innerHTML = '<div class="col-12 text-center text-muted">No hay jugadas configuradas. Usa el botón superior.</div>';
    } else {
        contenedor.innerHTML = html;
    }
}

// --- ABRIR MODAL DE REGISTRO ---
$("#btnAddCarton").on("click", function () {
    // 1. Limpiamos campos de texto
    $("#nuevoCartonId").val("");
    $("#nuevoCartonVendedor").val("");
    
    // 2. Limpiamos todos los inputs del cartón
    $(".input-carton").val("");
    
    // 3. Habilitamos el botón por si quedó bloqueado
    $('#btnRegistrarCarton').prop('disabled', false);
    
    // 4. Mostramos modal
    $("#modalAddCarton").modal("show");
});

// --- LÓGICA DE REGISTRO DESDE EL MODAL ---
$('#btnRegistrarCarton').on("click", function () {
    let btn = $(this);
    btn.prop('disabled', true); // Bloqueo inmediato para evitar doble clic

    let id = document.getElementById("nuevoCartonId").value.trim();
    let vendedor = document.getElementById("nuevoCartonVendedor").value.trim();

    if (id === "") {
        mostrarAlerta("Mensaje", "Debe ingresar el Código del cartón.", "warning");
        $("#nuevoCartonId").focus();
        btn.prop('disabled', false);
        return;
    }

    let carton_encontrado = cartones.filter(carton => carton.id === id);
    if (carton_encontrado.length > 0) {
        mostrarAlerta("Mensaje", "El Código del Cartón ya fue registrado previamente.", "warning");
        btn.prop('disabled', false);
        return;
    }

    let estructura = { B: [], I: [], N: [], G: [], O: [] };
    let numerosUnicos = new Set();
    let hayError = false; // Bandera para abortar si falla alguna validación

    // Recorremos las columnas y extraemos de los inputs usando sus IDs (ej. inp_B0)
    for (let col of ["B", "I", "N", "G", "O"]) {
        let [min, max] = rangos[col];

        for (let fila = 0; fila < 5; fila++) {
            if (col === "N" && fila === 2) {
                estructura[col].push(null); // Casilla de estrella libre
            } else {
                let inputId = `inp_${col}${fila}`;
                //console.log("Después de limpiar:", inputId);
                let valStr = document.getElementById(inputId).value.trim();
                
                // 1. Validar que no esté vacío
                if (valStr === "") {
                    //mostrarAlerta("Casilla Vacía", `Falta ingresar un número en la columna ${col}.`, "warning");
                    MensajeToast("Alerta", `Falta ingresar un número en la columna ${col}.`, "warning");
                    document.getElementById(inputId).focus();
                    hayError = true;
                    break;
                }

                let num = parseInt(valStr, 10);

                // 2. Validar que sea número válido
                if (isNaN(num)) {
                    mostrarAlerta("Error", `Valor inválido en la columna ${col}.`, "error");
                    hayError = true; break;
                }

                // 3. Validar rango
                if (num < min || num > max) {
                    //mostrarAlerta("Fuera de Rango", `El número ${num} es inválido para la columna ${col}. Rango permitido: ${min}-${max}.`, "error");
                    MensajeToast("Inválido", `El Número ${num} es inválido en la columna ${col}. Rango permitido: ${min}-${max}.`, "error");
                    document.getElementById(inputId).focus();
                    hayError = true; break;
                }

                // 4. Validar duplicados en el mismo cartón
                if (numerosUnicos.has(num)) {
                    //mostrarAlerta("Número Repetido", `El número ${num} se encuentra duplicado en este cartón.`, "error");
                    MensajeToast("Repetido", `El número ${num} se encuentra duplicado en este cartón.`, "error");
                    document.getElementById(inputId).focus();
                    hayError = true; break;
                }

                numerosUnicos.add(num);
                estructura[col].push(num);
            }
        }
        if (hayError) break; // Si hubo error en las filas, rompemos el ciclo principal
    }

    // Si hubo error, abortamos el registro y liberamos el botón
    if (hayError) {
        btn.prop('disabled', false);
        return;
    }

    // Si todo es correcto, guardamos el cartón incluyendo al vendedor
    cartones.push({ 
        id: id, 
        vendedor: vendedor, // <--- Dato opcional guardado
        numeros: estructura, 
        marcados: [], 
        ganador: false 
    });

    // Actualizamos la vista
    mostrarCartones();
    verCartonesBtn();
    
    $("#modalAddCarton").modal("hide");
    btn.prop('disabled', false);
    MensajeToast("Éxito", "Cartón registrado correctamente.", "success");
    //mostrarAlerta("Éxito", "Cartón registrado correctamente.", "success");
});

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

// verificar si en esta funcion llamamos a mostrarTodosGanadores();
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

// --- FUNCIÓN EXCLUSIVA PARA PRUEBAS ---
function cargarCartonesPrueba() {
    // Tu lista predefinida de cartones
    const datosPrueba = [
        { id: "7345", numeros: "15,13,2,14,6,24,27,28,30,26,31,40,38,39,58,57,54,52,56,68,72,67,62,73" },
        { id: "1343", numeros: "14,5,2,3,8,21,29,25,28,19,38,34,45,37,59,51,46,55,48,68,72,75,61,70" },
        { id: "2564", numeros: "7,12,8,10,6,29,18,19,28,16,31,45,36,41,52,47,51,56,55,68,74,69,65,72" },
        { id: "3783", numeros: "11,5,2,12,1,18,27,29,23,22,45,32,44,43,59,56,53,49,48,73,75,61,64,70" },
        { id: "5004", numeros: "15,12,13,7,8,18,24,30,29,23,36,40,42,35,59,60,58,55,57,73,62,72,68,61" },
        { id: "5615", numeros: "5,9,15,2,1,28,16,21,25,17,45,42,34,40,49,60,58,57,47,75,68,62,63,69" },
        { id: "4395", numeros: "2,1,4,11,14,25,30,23,22,26,38,33,31,35,55,54,58,46,52,63,66,69,67,64" },
        { id: "5284", numeros: "13,3,10,12,2,28,26,30,21,17,38,43,42,34,55,56,58,57,52,67,73,75,72,71" },
        { id: "1124", numeros: "14,2,13,11,8,17,22,28,29,23,35,37,32,33,54,48,55,50,49,68,71,70,61,75" },
        { id: "5845", numeros: "9,11,13,10,5,29,24,25,26,22,35,41,40,36,54,47,58,56,59,68,62,74,63,72" },
        { id: "8801", numeros: "6,11,9,8,2,16,19,29,23,20,35,41,40,36,54,47,58,56,59,68,62,74,63,72" }
    ];

    datosPrueba.forEach(datos => {
        // Validación: Evitamos agregar el cartón si ya existe en el arreglo
        let carton_encontrado = cartones.filter(carton => carton.id === datos.id);
        if (carton_encontrado.length > 0) return; // Salta a la siguiente iteración

        let arrayNumeros = datos.numeros.split(",").map(n => n.trim());
        let estructura = { B: [], I: [], N: [], G: [], O: [] };
        let index = 0;

        // Estructura en columnas (Misma lógica original)
        for (let col of ["B", "I", "N", "G", "O"]) {
            for (let fila = 0; fila < 5; fila++) {
                if (col === "N" && fila === 2) {
                    estructura[col].push(null);
                } else {
                    estructura[col].push(parseInt(arrayNumeros[index]));
                    index++;
                }
            }
        }

        // Agregamos al arreglo global
        //cartones.push({ id: datos.id, numeros: estructura, marcados: [], ganador: false });
        // Agregamos al arreglo global con el vendedor estático para pruebas
        cartones.push({
            id: datos.id,
            vendedor: "Marco", // <--- Propiedad agregada
            numeros: estructura,
            marcados: [],
            ganador: false
        });

    });

    // Refrescamos la vista
    mostrarCartones();
    verCartonesBtn();
}

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

// function verificarJugadas(cartones) {
function verificarJugadas(cartones, numCantado) {
    let resultados = [];

    // Obtenemos solo las figuras que tienen el checkbox marcado
    let figurasSeleccionadas = catalogoFiguras.filter(f => {
        let check = document.getElementById(f.id);
        return check && check.checked;
    });

    if (figurasSeleccionadas.length === 0) return resultados; // Retornamos arreglo vacío

    cartones.forEach(carton => {
        let jugadasGanadas = [];

        figurasSeleccionadas.forEach(regla => {
            // Llamamos al validador universal pasando el cartón y la regla completa
            if (validarRegla(carton, regla)) {
                jugadasGanadas.push(regla.nombre);
                // nueva logica
                cartonLlenoFigura.push({
                    id: carton.id,
                    tipoGanador: "figura",
                    jugadas: regla.nombre,
                    reglaId: regla.id,          // <-- Guardamos el ID del checkbox
                    numeroVictoria: numCantado  // <-- Guardamos con qué número ganó
                });
                //cartonLlenoFigura.push({ id: carton.id, tipoGanador: "figura", jugadas: regla.nombre });
                document.getElementById(regla.id).checked = false; // Desmarcar
            }
        });

        if (jugadasGanadas.length > 0) {
            resultados.push({ id: carton.id, jugadas: jugadasGanadas });
        }
    });

    return resultados; // Retornamos los datos para usarlos fuera
}

// FUNCIÓN PARA CANTAR EL NÚMERO CON UN CLIC ---
function cantarNumeroTablero(col, num) {
    if (cartones.length === 0) {
        swal("Mensaje", "⚠️ No hay Cartones para Jugar.", "warning");
        return;
    }

    let clave = `${col}${num}`;
    if (historial.includes(clave)) return; // Prevención extra

    historial.push(clave);

    // Cambiar estilo del botón en el tablero para que se vea "marcado"
    $(`#btn-bola-${col}-${num}`).addClass('cantada');

    let ganadoresBingo = [];

    cartones.forEach(carton => {
        if (carton.ganador) return;

        // Marcar en la memoria del cartón
        if (carton.numeros[col].includes(num)) {
            if (!carton.marcados.includes(num)) carton.marcados.push(num);
        }
        // Casilla del centro libre siempre marcada
        if (!carton.marcados.includes(null)) carton.marcados.push(null);

        // Verificar cartón lleno nuevo agregar a cartonLlenoFigura = [];
        let totalMarcados = carton.marcados.filter(n => n !== null).length;
        if (totalMarcados >= 24) {
            carton.ganador = true; // marcamos como ganador
            ganadoresBingo.push(carton.id);  // lo agregamos a la lista de ganadores
            // nueva logica
            // Guardamos también el "numeroVictoria"
            cartonLlenoFigura.push({
                id: carton.id,
                tipoGanador: "lleno",
                jugadas: "Cartón Lleno",
                numeroVictoria: num
            });
        }
    });

    // 1. Obtenemos las figuras ganadas en este turno
    // let ganadoresFiguras = verificarJugadas(cartones);
    let ganadoresFiguras = verificarJugadas(cartones, num);

    // 2. Evaluamos si hay ALGÚN tipo de ganador (Bingo o Figura)
    if (ganadoresBingo.length > 0 || ganadoresFiguras.length > 0) {
        let mensajeConsolidado = "";

        // Bloque para Cartón Lleno
        if (ganadoresBingo.length > 0) {
            mensajeConsolidado += "🏆 ¡BINGO (Cartón Lleno)!\nGanadores: " + ganadoresBingo.join(", ") + "\n\n";
        }

        // Bloque para Figuras
        if (ganadoresFiguras.length > 0) {
            mensajeConsolidado += "🎉 ¡Figuras Completadas!\n";
            ganadoresFiguras.forEach(r => {
                mensajeConsolidado += `Cartón ${r.id} → ${r.jugadas.join(", ")}\n`;
            });
        }

        mostrarTodosGanadores();

        mostrarAlerta("¡Felicidades!", mensajeConsolidado, "success");
    }

    mostrarCartones();
}

function mostrarTodosGanadores() {
    $("#contCartonesLlenos").empty();
    $("#contFigurasGanadas").empty();

    if (cartonLlenoFigura && cartonLlenoFigura.length > 0) {
        cartonLlenoFigura.forEach((evento) => {
            let eventoDiv = '';

            if (evento.tipoGanador === "lleno") {
                eventoDiv = `
                <div class="d-flex align-items-center mb-2 bg-light p-2 rounded border">
                    <i class="fa fa-trophy fa-lg text-warning me-3 ms-1"></i>
                    <div class="lh-1">
                        <span class="font-monospace small text-muted">Cod:</span> <b class="text-dark">${evento.id}</b>
                    </div>
                </div>`;
                $("#contCartonesLlenos").append(eventoDiv);
            }
            else if (evento.tipoGanador === "figura") {
                eventoDiv = `
                <div class="d-flex align-items-center mb-2 bg-light p-2 rounded border">
                    <i class="fa fa-star fa-lg text-theme me-3 ms-1"></i>
                    <div class="lh-1">
                        <span class="font-monospace small text-muted">Cod:</span> <b class="text-dark">${evento.id}</b><br>
                        <small class="text-muted fw-bold">${evento.jugadas}</small>
                    </div>
                </div>`;
                $("#contFigurasGanadas").append(eventoDiv);
            }
        });
    }

    if ($("#contCartonesLlenos").is(':empty')) {
        $("#contCartonesLlenos").html('<div class="text-center text-muted fs-12px fst-italic mt-3">Sin ganadores aún</div>');
    }
    if ($("#contFigurasGanadas").is(':empty')) {
        $("#contFigurasGanadas").html('<div class="text-center text-muted fs-12px fst-italic mt-3">Sin ganadores aún</div>');
    }
}

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
            let ultimaClave = historial.pop(); // ej: "B8"
            let col = ultimaClave[0];          // "B"
            let num = parseInt(ultimaClave.slice(1)); // "8" → 8

            // Restaurar el botón en el tablero maestro
            $(`#btn-bola-${col}-${num}`).removeClass('cantada');

            // nueva logica
            // 1. Buscamos si este número provocó alguna victoria y restauramos el checkbox
            let eventosDeshacer = cartonLlenoFigura.filter(g => g.numeroVictoria === num);
            eventosDeshacer.forEach(evento => {
                if (evento.tipoGanador === "figura" && evento.reglaId) {
                    let chk = document.getElementById(evento.reglaId);
                    if (chk) chk.checked = true; // Volvemos a marcar la figura para que siga en juego
                }
            });

            // 2. Quitamos del panel a los que ganaron con este número
            cartonLlenoFigura = cartonLlenoFigura.filter(g => g.numeroVictoria !== num);
            mostrarTodosGanadores(); // Refrescamos el HTML

            // fin nueva logica

            cartones.forEach(carton => {
                let index = carton.marcados.indexOf(num);
                if (index !== -1) {
                    carton.marcados.splice(index, 1);
                }

                // 2. RE-EVALUAR ESTADO DE GANADOR
                let totalMarcados = carton.marcados.filter(n => n !== null).length;

                // Solo si cae por debajo de 24 marcas pierde su estatus de ganador absoluto
                if (totalMarcados < 24) {
                    carton.ganador = false;
                }

            });

            mostrarCartones();
            swal("Hecho", `✅ Se deshizo el número ${col}-${num}.`, "success");
        }
    });
}

$('#btnAtras').on('click', function () {
    volverAtras();
})

function reiniciarCarton() {

    swal({
        title: "¿Estás seguro?",
        text: "🔄 Se riniciara para un nuevo juego limpiando los cartones marcados.",
        icon: "info",
        buttons: ["Cancelar", "Sí, reiniciar"],
        dangerMode: true,
    }).then((confirmado) => {
        if (confirmado) {

            cartonLlenoFigura = [];
            mostrarTodosGanadores();

            // Limpiar las marcas de cada cartón
            cartones.forEach(carton => {
                carton.marcados = []; // Vacía los números marcados
                carton.ganador = false; // también reiniciamos el estado de ganador
            });

            // Limpiar historial de números cantados
            historial = [];

            // Limpiar TODAS las bolas marcadas en el tablero
            $('.btn-bola').removeClass('cantada');

            // Actualizar la vista
            mostrarCartones();
            swal("Mensaje", "🔄 Juego reiniciado. Puedes volver a jugar con los mismos cartones.", "warning");
        }
    });
}

$('#btnNuevoJuego').on('click', function () {
    reiniciarCarton();
})

// restricciones y navegacion de input del modal para cartones

// NAVEGACIÓN ESTILO EXCEL PARA EL CARTÓN

// 1. Restringir para que solo acepte números (reemplaza tu plugin propuesto de forma más directa)
$(document).on("input", ".input-carton", function () {
    this.value = this.value.replace(/[^0-9]/g, '');
    //console.log("Valor del Input:", this.value);
});

// 2. Lógica de navegación con flechas
const arrayColumnas = ["B", "I", "N", "G", "O"];

$(document).on("keydown", ".input-carton", function (e) {
    // Obtenemos el ID actual, ej: "inp_B0"
    let partesId = e.target.id.split('_'); 
    if (partesId.length !== 2) return;
    
    let colActual = partesId[1].charAt(0); // "B"
    let filaActual = parseInt(partesId[1].charAt(1)); // 0
    
    let indexCol = arrayColumnas.indexOf(colActual);
    let proxFila = filaActual;
    let proxIndexCol = indexCol;

    // Detectar qué flecha se presionó
    if (e.key === "ArrowUp") {
        proxFila--;
        e.preventDefault(); // Evita que el cursor se mueva al inicio del texto
    } else if (e.key === "ArrowDown") {
        proxFila++;
        e.preventDefault();
    } else if (e.key === "ArrowLeft") {
        proxIndexCol--;
        e.preventDefault();
    } else if (e.key === "ArrowRight") {
        proxIndexCol++;
        e.preventDefault();
    } else {
        return; // Si no es flecha, dejamos que escriba normal
    }

    // Saltar la casilla de la estrella (N2)
    if (arrayColumnas[proxIndexCol] === "N" && proxFila === 2) {
        if (e.key === "ArrowUp") proxFila--;
        else if (e.key === "ArrowDown") proxFila++;
        else if (e.key === "ArrowLeft") proxIndexCol--;
        else if (e.key === "ArrowRight") proxIndexCol++;
    }

    // Verificar que no nos salgamos de los bordes del cartón (0 a 4)
    if (proxFila >= 0 && proxFila <= 4 && proxIndexCol >= 0 && proxIndexCol <= 4) {
        let idDestino = `inp_${arrayColumnas[proxIndexCol]}${proxFila}`;
        let inputDestino = document.getElementById(idDestino);
        
        if (inputDestino) {
            inputDestino.focus();
            inputDestino.select(); // Selecciona el texto para sobrescribir rápidamente
        }
    }
});