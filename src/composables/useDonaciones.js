import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const MAXIMO_FOTOS = 3;
const TAMANIO_MAXIMO_FOTO = 5 * 1024 * 1024;
const TIPOS_DE_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET_FOTOS = 'fotos-envases';
const MENSAJE_ERROR_PUBLICAR = 'No pudimos publicar la donación. Intentá de nuevo en unos minutos.';

function obtenerFechaDeHoy() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

function validarDonacion(datos, fotos) {
    const camposObligatorios = [
        datos.nombre_comercial,
        datos.principio_activo,
        datos.concentracion,
        datos.forma_farmaceutica,
        datos.lote,
        String(datos.cantidad_disponible),
        datos.fecha_vencimiento,
    ];

    for (const campo of camposObligatorios) {
        if (campo.trim() === '') {
            return 'Completá el nombre comercial, el principio activo, la concentración, la forma farmacéutica, el lote, la cantidad y la fecha de vencimiento.';
        }
    }

    const cantidad = Number(datos.cantidad_disponible);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        return 'La cantidad tiene que ser un número entero mayor o igual a 1.';
    }

    if (datos.fecha_vencimiento <= obtenerFechaDeHoy()) {
        return 'No se pueden donar medicamentos vencidos o que vencen hoy. Revisá la fecha de vencimiento.';
    }

    if (fotos.length === 0) {
        return 'Subí al menos una foto del envase.';
    }

    if (fotos.length > MAXIMO_FOTOS) {
        return 'Podés subir hasta 3 fotos del envase.';
    }

    const nombres = [];
    for (const foto of fotos) {
        if (!TIPOS_DE_FOTO.includes(foto.type)) {
            return 'Las fotos tienen que ser imágenes JPG, PNG o WEBP.';
        }
        if (foto.size > TAMANIO_MAXIMO_FOTO) {
            return 'Cada foto puede pesar como máximo 5 MB.';
        }
        if (nombres.includes(foto.name.toLowerCase())) {
            return 'No podés subir dos fotos con el mismo nombre.';
        }
        nombres.push(foto.name.toLowerCase());
    }

    return '';
}

function obtenerExtension(foto) {
    if (foto.type === 'image/png') {
        return 'png';
    }
    if (foto.type === 'image/webp') {
        return 'webp';
    }
    return 'jpg';
}

async function borrarFotos(rutas) {
    if (rutas.length === 0) {
        return;
    }

    const { error: errorBorrar } = await supabase.storage.from(BUCKET_FOTOS).remove(rutas);
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

    return MENSAJE_ERROR_PUBLICAR;
}

export function useDonaciones() {
    const donaciones = ref([]);
    const cargando = ref(false);
    const cargado = ref(false);
    const error = ref('');
    const publicando = ref(false);
    const errorPublicar = ref('');
    const mensajePublicar = ref('');
    const tipoMensajePublicar = ref('exito');

    async function adjuntarSolicitudesActivas(filas) {
        for (const donacion of filas) {
            donacion.solicitud_id = null;
        }

        const idsReservados = [];
        for (const donacion of filas) {
            if (donacion.estado === 'reservado') {
                idsReservados.push(donacion.id);
            }
        }

        if (idsReservados.length === 0) {
            return;
        }

        const { data, error: errorSolicitudes } = await supabase
            .from('solicitudes')
            .select('id, medicamento_id, estado')
            .in('medicamento_id', idsReservados)
            .in('estado', ['pendiente_coordinacion', 'en_camino']);

        if (errorSolicitudes) {
            console.error(errorSolicitudes);
            return;
        }

        for (const donacion of filas) {
            for (const solicitud of data) {
                if (solicitud.medicamento_id === donacion.id) {
                    donacion.solicitud_id = solicitud.id;
                }
            }
        }
    }

    async function cargarMisDonaciones(userId) {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await supabase
            .from('medicamentos')
            .select('id, nombre_comercial, principio_activo, concentracion, cantidad_disponible, fecha_vencimiento, estado, motivo_rechazo, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar tus donaciones. Intentá de nuevo en unos minutos.';
            donaciones.value = [];
        } else {
            await adjuntarSolicitudesActivas(data);
            donaciones.value = data;
        }

        cargando.value = false;
        cargado.value = true;
    }

    async function publicarDonacion(userId, datos, fotos) {
        errorPublicar.value = '';
        mensajePublicar.value = '';

        const errorValidacion = validarDonacion(datos, fotos);
        if (errorValidacion !== '') {
            errorPublicar.value = errorValidacion;
            return false;
        }

        publicando.value = true;

        const rutas = [];
        const urls = [];
        const nombres = [];

        for (const foto of fotos) {
            const ruta = userId + '/' + crypto.randomUUID() + '.' + obtenerExtension(foto);

            const { error: errorSubida } = await supabase.storage.from(BUCKET_FOTOS).upload(ruta, foto);
            if (errorSubida) {
                console.error(errorSubida);
                await borrarFotos(rutas);
                errorPublicar.value = 'No pudimos subir las fotos del envase. Intentá de nuevo en unos minutos.';
                publicando.value = false;
                return false;
            }

            const { data: datosUrl } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(ruta);
            rutas.push(ruta);
            urls.push(datosUrl.publicUrl);
            nombres.push(foto.name);
        }

        const { data: respuesta, error: errorFuncion } = await supabase.functions.invoke('publicar-medicamento', {
            body: {
                nombre_comercial: datos.nombre_comercial.trim(),
                principio_activo: datos.principio_activo.trim(),
                concentracion: datos.concentracion.trim(),
                forma_farmaceutica: datos.forma_farmaceutica.trim(),
                cantidad_disponible: Number(datos.cantidad_disponible),
                lote: datos.lote.trim(),
                fecha_vencimiento: datos.fecha_vencimiento,
                descripcion: datos.descripcion.trim(),
                fotos_envase: urls,
                nombres_fotos: nombres,
            },
        });

        if (errorFuncion) {
            errorPublicar.value = await leerMensajeDeError(errorFuncion);
            await borrarFotos(rutas);
            publicando.value = false;
            return false;
        }

        if (respuesta.estado === 'disponible') {
            tipoMensajePublicar.value = 'exito';
            mensajePublicar.value = 'Tu donación ya está publicada en el catálogo.';
        } else {
            tipoMensajePublicar.value = 'informativo';
            mensajePublicar.value = 'Recibimos tu donación. Un administrador la va a revisar antes de publicarla en el catálogo.';
        }

        publicando.value = false;
        return true;
    }

    return {
        donaciones,
        cargando,
        cargado,
        error,
        publicando,
        errorPublicar,
        mensajePublicar,
        tipoMensajePublicar,
        cargarMisDonaciones,
        publicarDonacion,
    };
}
