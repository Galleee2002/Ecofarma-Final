import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const MENSAJE_ERROR_ALTA = 'No pudimos agregar el medicamento al vademécum. Intentá de nuevo en unos minutos.';

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

    return MENSAJE_ERROR_ALTA;
}

export function useVademecum() {
    const filas = ref([]);
    const cargando = ref(false);
    const error = ref('');
    const guardando = ref(false);
    const errorAlta = ref('');
    const tipoErrorAlta = ref('error');
    const mensajeAlta = ref('');

    async function cargarSugerencias() {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await supabase
            .from('medicamentos_habilitados')
            .select('id, nombre_comercial, principio_activo, concentracion, forma_farmaceutica, presentacion, requiere_receta')
            .order('principio_activo', { ascending: true });

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar el vademécum. Podés completar los datos igual.';
            filas.value = [];
        } else {
            filas.value = data;
        }

        cargando.value = false;
    }

    async function darDeAlta(datos) {
        errorAlta.value = '';
        mensajeAlta.value = '';

        if (datos.principio_activo.trim() === '') {
            errorAlta.value = 'Indicá el principio activo.';
            tipoErrorAlta.value = 'advertencia';
            return false;
        }

        guardando.value = true;

        const { error: errorFuncion } = await supabase.functions.invoke('alta-medicamento-habilitado', {
            body: {
                nombre_comercial: datos.nombre_comercial.trim(),
                principio_activo: datos.principio_activo.trim(),
                concentracion: datos.concentracion.trim(),
                forma_farmaceutica: datos.forma_farmaceutica.trim(),
                presentacion: datos.presentacion.trim(),
                requiere_receta: datos.requiere_receta === true,
            },
        });

        if (errorFuncion) {
            errorAlta.value = await leerMensajeDeError(errorFuncion);
            tipoErrorAlta.value = 'error';
            guardando.value = false;
            return false;
        }

        mensajeAlta.value = 'El medicamento se agregó al vademécum.';
        await cargarSugerencias();
        guardando.value = false;
        return true;
    }

    return {
        filas,
        cargando,
        error,
        guardando,
        errorAlta,
        tipoErrorAlta,
        mensajeAlta,
        cargarSugerencias,
        darDeAlta,
    };
}
