import { ref } from 'vue';
import { supabase } from '../lib/supabase';

export function useSolicitudes() {
    const solicitudes = ref([]);
    const cargando = ref(false);
    const cargado = ref(false);
    const error = ref('');

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

    return {
        solicitudes,
        cargando,
        cargado,
        error,
        cargarMisSolicitudes,
    };
}
