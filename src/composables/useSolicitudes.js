import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const TAMANIO_MAXIMO_RECETA = 5 * 1024 * 1024;
const TIPOS_DE_RECETA = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_RECETAS = 'recetas-medicas';
const MENSAJE_ERROR_CREAR = 'No pudimos crear la solicitud. Intentá de nuevo en unos minutos.';

function obtenerExtension(archivo) {
    if (archivo.type === 'image/png') {
        return 'png';
    }
    if (archivo.type === 'image/webp') {
        return 'webp';
    }
    return 'jpg';
}

function validarSolicitud(datos, archivoReceta) {
    if (datos.aceptoDdjj !== true) {
        return 'Tenés que aceptar la Declaración Jurada para solicitar el medicamento.';
    }

    if (datos.esParaTercero === true && datos.nombreDestinatario.trim() === '') {
        return 'Indicá el nombre de la persona para quien pedís el medicamento.';
    }

    if (datos.requiereReceta === true) {
        if (archivoReceta === null) {
            return 'Este medicamento requiere la foto de una receta médica.';
        }
        if (!TIPOS_DE_RECETA.includes(archivoReceta.type)) {
            return 'La receta tiene que ser una imagen JPG, PNG o WEBP.';
        }
        if (archivoReceta.size > TAMANIO_MAXIMO_RECETA) {
            return 'La foto de la receta puede pesar como máximo 5 MB.';
        }
    }

    return '';
}

async function borrarReceta(ruta) {
    if (ruta === '') {
        return;
    }

    const { error: errorBorrar } = await supabase.storage.from(BUCKET_RECETAS).remove([ruta]);
    if (errorBorrar) {
        console.error(errorBorrar);
    }
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

    return MENSAJE_ERROR_CREAR;
}

export function useSolicitudes() {
    const solicitudes = ref([]);
    const cargando = ref(false);
    const cargado = ref(false);
    const error = ref('');
    const creando = ref(false);
    const errorCrear = ref('');
    const mensajeCrear = ref('');
    const tipoMensajeCrear = ref('exito');

    async function obtenerCodigo(solicitud) {
        solicitud.codigo = null;
        solicitud.errorCodigo = false;

        if (solicitud.estado !== 'pendiente_coordinacion' && solicitud.estado !== 'en_camino') {
            return;
        }

        const { data, error: errorCodigo } = await supabase.rpc('obtener_codigo_confirmacion', {
            p_solicitud_id: solicitud.id,
        });

        if (errorCodigo || data === null) {
            console.error(errorCodigo);
            solicitud.errorCodigo = true;
        } else {
            solicitud.codigo = data;
        }
    }

    async function cargarMisSolicitudes(userId) {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await supabase
            .from('solicitudes')
            .select('id, estado, created_at, fecha_entrega, es_para_tercero, nombre_destinatario_final, medicamentos(nombre_comercial, principio_activo)')
            .eq('receptor_id', userId)
            .order('created_at', { ascending: false });

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar tus solicitudes. Intentá de nuevo en unos minutos.';
            solicitudes.value = [];
        } else {
            for (const solicitud of data) {
                await obtenerCodigo(solicitud);
            }
            solicitudes.value = data;
        }

        cargando.value = false;
        cargado.value = true;
    }

    async function crearSolicitud(userId, datos, archivoReceta) {
        errorCrear.value = '';
        mensajeCrear.value = '';

        const errorValidacion = validarSolicitud(datos, archivoReceta);
        if (errorValidacion !== '') {
            errorCrear.value = errorValidacion;
            return false;
        }

        creando.value = true;

        let rutaReceta = '';
        let urlReceta = '';

        if (archivoReceta !== null) {
            rutaReceta = userId + '/' + crypto.randomUUID() + '.' + obtenerExtension(archivoReceta);

            const { error: errorSubida } = await supabase.storage.from(BUCKET_RECETAS).upload(rutaReceta, archivoReceta);
            if (errorSubida) {
                console.error(errorSubida);
                errorCrear.value = 'No pudimos subir la foto de la receta. Intentá de nuevo en unos minutos.';
                creando.value = false;
                return false;
            }

            const { data: datosUrl } = supabase.storage.from(BUCKET_RECETAS).getPublicUrl(rutaReceta);
            urlReceta = datosUrl.publicUrl;
        }

        const { data: respuesta, error: errorFuncion } = await supabase.functions.invoke('crear-solicitud', {
            body: {
                medicamento_id: datos.medicamentoId,
                acepto_ddjj_receptor: true,
                es_para_tercero: datos.esParaTercero === true,
                nombre_destinatario_final: datos.esParaTercero === true ? datos.nombreDestinatario.trim() : '',
                receta_medica_url: urlReceta,
            },
        });

        if (errorFuncion) {
            errorCrear.value = await leerMensajeDeError(errorFuncion);
            await borrarReceta(rutaReceta);
            creando.value = false;
            return false;
        }

        if (!respuesta || !respuesta.id) {
            errorCrear.value = MENSAJE_ERROR_CREAR;
            await borrarReceta(rutaReceta);
            creando.value = false;
            return false;
        }

        tipoMensajeCrear.value = 'exito';
        mensajeCrear.value = 'Tu solicitud quedó registrada. El código de retiro lo vas a ver en Mis solicitudes, dentro de tu perfil.';
        creando.value = false;
        return true;
    }

    return {
        solicitudes,
        cargando,
        cargado,
        error,
        creando,
        errorCrear,
        mensajeCrear,
        tipoMensajeCrear,
        cargarMisSolicitudes,
        crearSolicitud,
    };
}
