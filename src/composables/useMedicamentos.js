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
    const medicamento = ref(null);
    const cargando = ref(false);
    const error = ref('');
    const busqueda = ref('');
    const filtroReceta = ref('todos');
    const orden = ref('recientes');

    const medicamentosFiltrados = computed(function () {
        const texto = busqueda.value.trim().toLowerCase();
        const filtrados = medicamentos.value.filter(function (item) {
            const nombre = item.nombre_comercial.toLowerCase();
            const principioActivo = item.principio_activo.toLowerCase();
            const requiereReceta = item.medicamentos_habilitados?.requiere_receta === true;
            const coincideBusqueda = texto === '' || nombre.includes(texto) || principioActivo.includes(texto);
            const coincideFiltro = filtroReceta.value === 'todos'
                || (filtroReceta.value === 'con_receta' && requiereReceta)
                || (filtroReceta.value === 'sin_receta' && !requiereReceta);

            return coincideBusqueda && coincideFiltro;
        });

        filtrados.sort(function (a, b) {
            if (orden.value === 'recientes') {
                return new Date(b.created_at) - new Date(a.created_at);
            }

            return a.fecha_vencimiento.localeCompare(b.fecha_vencimiento);
        });

        return filtrados;
    });

    async function cargarMedicamentos() {
        cargando.value = true;
        error.value = '';

        const { data, error: errorConsulta } = await supabase
            .from('medicamentos')
            .select('id, nombre_comercial, principio_activo, concentracion, forma_farmaceutica, cantidad_disponible, fecha_vencimiento, fotos_envase, created_at, medicamentos_habilitados(requiere_receta)')
            .eq('estado', 'disponible')
            .gte('fecha_vencimiento', obtenerFechaDeHoy());

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar los medicamentos. Intentá de nuevo en unos minutos.';
            medicamentos.value = [];
        } else {
            medicamentos.value = data;
        }

        cargando.value = false;
    }

    async function cargarMedicamentoPorId(id) {
        cargando.value = true;
        error.value = '';
        medicamento.value = null;

        const { data, error: errorConsulta } = await supabase
            .from('medicamentos')
            .select('id, nombre_comercial, principio_activo, concentracion, forma_farmaceutica, cantidad_disponible, fecha_vencimiento, fotos_envase, lote, descripcion, medicamento_habilitado_id, medicamentos_habilitados(requiere_receta)')
            .eq('id', id)
            .eq('estado', 'disponible')
            .gte('fecha_vencimiento', obtenerFechaDeHoy())
            .maybeSingle();

        if (errorConsulta) {
            console.error(errorConsulta);
            error.value = 'No pudimos cargar el medicamento. Intentá de nuevo en unos minutos.';
            medicamento.value = null;
        } else if (data === null) {
            error.value = 'No encontramos ese medicamento o ya no está disponible.';
            medicamento.value = null;
        } else {
            medicamento.value = data;
        }

        cargando.value = false;
    }

    return {
        medicamentos,
        medicamento,
        cargando,
        error,
        busqueda,
        filtroReceta,
        orden,
        medicamentosFiltrados,
        cargarMedicamentos,
        cargarMedicamentoPorId,
    };
}
