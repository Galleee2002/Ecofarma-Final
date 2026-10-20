import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const MENSAJE_ERROR_GENERAL = 'No pudimos actualizar la donación. Intentá de nuevo en unos minutos.';

function obtenerFechaDeHoy() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

function textoOVacio(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }
    return String(valor);
}

function validarCorreccion(datos) {
    const camposObligatorios = [
        textoOVacio(datos.nombre_comercial),
        textoOVacio(datos.principio_activo),
        textoOVacio(datos.cantidad_disponible),
        textoOVacio(datos.fecha_vencimiento),
    ];

    for (const campo of camposObligatorios) {
        if (campo.trim() === '') {
            return 'Completá el nombre comercial, el principio activo, la cantidad y la fecha de vencimiento.';
        }
    }

    const cantidad = Number(datos.cantidad_disponible);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        return 'La cantidad tiene que ser un número entero mayor o igual a 1.';
    }

    if (textoOVacio(datos.fecha_vencimiento) <= obtenerFechaDeHoy()) {
        return 'No se pueden donar medicamentos vencidos o que vencen hoy. Revisá la fecha de vencimiento.';
    }

    return '';
}

async function leerMensajeDeError(errorFuncion) {
    console.error(errorFuncion);

    try {
        const cuerpo = await errorFuncion.context.json();
        if (cuerpo.error) {
            return cuerpo.error;
        }
    } catch (errorLectura) {
        console.error(errorLectura);
    }

    return MENSAJE_ERROR_GENERAL;
}

function armarCuerpo(donacionId, datos) {
    return {
        medicamento_id: donacionId,
        nombre_comercial: textoOVacio(datos.nombre_comercial).trim(),
        principio_activo: textoOVacio(datos.principio_activo).trim(),
        concentracion: textoOVacio(datos.concentracion).trim(),
        forma_farmaceutica: textoOVacio(datos.forma_farmaceutica).trim(),
        cantidad_disponible: Number(datos.cantidad_disponible),
        lote: textoOVacio(datos.lote).trim(),
        fecha_vencimiento: textoOVacio(datos.fecha_vencimiento),
        descripcion: textoOVacio(datos.descripcion).trim(),
    };
}

export function useModeracion() {
    const donaciones = ref([]);
    const cargando = ref(false);
    const error = ref('');
    const guardando = ref(false);
    const errorAccion = ref('');
    const tipoErrorAccion = ref('error');
    const mensajeAccion = ref('');

    async function cargarDonaciones() {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await supabase
            .from('medicamentos')
            .select(
                'id, user_id, medicamento_habilitado_id, nombre_comercial, principio_activo, concentracion, forma_farmaceutica, cantidad_disponible, lote, fecha_vencimiento, fotos_envase, descripcion, estado, motivo_rechazo, created_at, profiles(name)',
            )
            .in('estado', ['pendiente_revision', 'disponible', 'rechazado'])
            .order('created_at', { ascending: false });

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar las donaciones. Intentá de nuevo en unos minutos.';
            donaciones.value = [];
        } else {
            donaciones.value = data;
        }

        cargando.value = false;
    }

    async function invocarAccion(cuerpo, mensajeExito) {
        errorAccion.value = '';
        mensajeAccion.value = '';
        guardando.value = true;

        const { error: errorFuncion } = await supabase.functions.invoke('moderar-donacion', {
            body: cuerpo,
        });

        if (errorFuncion) {
            errorAccion.value = await leerMensajeDeError(errorFuncion);
            tipoErrorAccion.value = 'error';
            guardando.value = false;
            return false;
        }

        mensajeAccion.value = mensajeExito;
        await cargarDonaciones();
        guardando.value = false;
        return true;
    }

    async function corregirDonacion(donacionId, datos) {
        const errorValidacion = validarCorreccion(datos);
        if (errorValidacion !== '') {
            errorAccion.value = errorValidacion;
            tipoErrorAccion.value = 'advertencia';
            mensajeAccion.value = '';
            return false;
        }

        const cuerpo = armarCuerpo(donacionId, datos);
        cuerpo.accion = 'corregir';
        return invocarAccion(cuerpo, 'Los datos de la donación se actualizaron.');
    }

    async function aprobarDonacion(donacionId, datos) {
        const errorValidacion = validarCorreccion(datos);
        if (errorValidacion !== '') {
            errorAccion.value = errorValidacion;
            tipoErrorAccion.value = 'advertencia';
            mensajeAccion.value = '';
            return false;
        }

        if (textoOVacio(datos.medicamento_habilitado_id).trim() === '') {
            errorAccion.value = 'Elegí un medicamento del vademécum para aprobar la donación.';
            tipoErrorAccion.value = 'advertencia';
            mensajeAccion.value = '';
            return false;
        }

        const cuerpo = armarCuerpo(donacionId, datos);
        cuerpo.accion = 'aprobar';
        cuerpo.medicamento_habilitado_id = Number(datos.medicamento_habilitado_id);
        return invocarAccion(cuerpo, 'La donación se publicó en el catálogo.');
    }

    async function rechazarDonacion(donacionId, datos) {
        if (textoOVacio(datos.motivo_rechazo).trim() === '') {
            errorAccion.value = 'Indicá el motivo del rechazo.';
            tipoErrorAccion.value = 'advertencia';
            mensajeAccion.value = '';
            return false;
        }

        return invocarAccion(
            {
                medicamento_id: donacionId,
                accion: 'rechazar',
                motivo_rechazo: textoOVacio(datos.motivo_rechazo).trim(),
            },
            'La donación fue rechazada. El donante va a ver el motivo en Mis donaciones.',
        );
    }

    return {
        donaciones,
        cargando,
        error,
        guardando,
        errorAccion,
        tipoErrorAccion,
        mensajeAccion,
        cargarDonaciones,
        corregirDonacion,
        aprobarDonacion,
        rechazarDonacion,
    };
}
