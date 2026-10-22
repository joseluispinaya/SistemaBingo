
function MensajeToast(titulo, mensaje, tipo) {

    // Configuración Global (Se aplica a todos los toasts)
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true, // Muestra los nuevos arriba
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000", // 5 segundos visible
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    // Mapeo de tipos para llamar al método correcto de toastr
    switch (tipo.toLowerCase()) {
        case 'success':
            toastr.success(mensaje, titulo || "Éxito");
            break;
        case 'warning':
            toastr.warning(mensaje, titulo || "Advertencia");
            break;
        case 'error':
            toastr.error(mensaje, titulo || "Error");
            break;
        case 'info':
        default:
            toastr.info(mensaje, titulo || "Información");
            break;
    }
}

function alertaTimer(titulo, mensaje, tipo, tiempo = 3000) {

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
        timer: tiempo,
        buttons: {
            confirm: {
                text: 'Aceptar',
                value: true,
                visible: true,
                className: 'btn btn-sm ' + btnClass, // Estilo Color Admin
                closeModal: true
            }
        }
    });
}

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