import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';

function obtenerFechaDeHoy() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

export function useMedicamentos() {
    const medicamentos = ref([]);
    const cargando = ref(false);
    const error = ref('');
    const busqueda = ref('');

    const medicamentosFiltrados = computed(function () {
        const texto = busqueda.value.trim().toLowerCase();

        if (texto === '') {
            return medicamentos.value;
        }

        return medicamentos.value.filter(function (medicamento) {
            const nombre = medicamento.nombre_comercial.toLowerCase();
            const principioActivo = medicamento.principio_activo.toLowerCase();
            return nombre.includes(texto) || principioActivo.includes(texto);
        });
    });

    async function cargarMedicamentos() {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await supabase
            .from('medicamentos')
            .select('id, nombre_comercial, principio_activo, concentracion, forma_farmaceutica, cantidad_disponible, fecha_vencimiento, fotos_envase')
            .eq('estado', 'disponible')
            .gte('fecha_vencimiento', obtenerFechaDeHoy())
            .order('fecha_vencimiento');

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar los medicamentos. Intentá de nuevo en unos minutos.';
            medicamentos.value = [];
        } else {
            medicamentos.value = data;
        }

        cargando.value = false;
    }

    return {
        medicamentos,
        cargando,
        error,
        busqueda,
        medicamentosFiltrados,
        cargarMedicamentos,
    };
}
