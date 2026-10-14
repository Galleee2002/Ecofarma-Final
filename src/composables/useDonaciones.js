import { ref } from 'vue';
import { supabase } from '../lib/supabase';

export function useDonaciones() {
    const donaciones = ref([]);
    const cargando = ref(false);
    const cargado = ref(false);
    const error = ref('');

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

    return {
        donaciones,
        cargando,
        cargado,
        error,
        cargarMisDonaciones,
    };
}
