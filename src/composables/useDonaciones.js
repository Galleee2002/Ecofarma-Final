import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const MAXIMO_FOTOS = 3;
const TAMANIO_MAXIMO_FOTO = 5 * 1024 * 1024;
const TIPOS_DE_FOTO = ['image/jpeg', 'image/png', 'image/webp'];

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
        String(datos.cantidad_disponible),
        datos.fecha_vencimiento,
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

    if (datos.fecha_vencimiento <= obtenerFechaDeHoy()) {
        return 'No se pueden donar medicamentos vencidos o que vencen hoy. Revisá la fecha de vencimiento.';
    }

    if (fotos.length === 0) {
        return 'Subí al menos una foto del envase.';
    }

    if (fotos.length > MAXIMO_FOTOS) {
        return 'Podés subir hasta 3 fotos del envase.';
    }

    for (const foto of fotos) {
        if (!TIPOS_DE_FOTO.includes(foto.type)) {
            return 'Las fotos tienen que ser imágenes JPG, PNG o WEBP.';
        }
        if (foto.size > TAMANIO_MAXIMO_FOTO) {
            return 'Cada foto puede pesar como máximo 5 MB.';
        }
    }

    return '';
}

export function useDonaciones() {
    const donaciones = ref([]);
    const cargando = ref(false);
    const cargado = ref(false);
    const error = ref('');
    const publicando = ref(false);
    const errorPublicar = ref('');
    const mensajePublicar = ref('');

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
            donaciones.value = data;
        }

        cargando.value = false;
        cargado.value = true;
    }

    async function publicarDonacion(datos, fotos) {
        errorPublicar.value = '';
        mensajePublicar.value = '';

        const errorValidacion = validarDonacion(datos, fotos);
        if (errorValidacion !== '') {
            errorPublicar.value = errorValidacion;
            return false;
        }

        mensajePublicar.value = 'Los datos están completos. La publicación se habilita en la próxima etapa.';
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
        cargarMisDonaciones,
        publicarDonacion,
    };
}
