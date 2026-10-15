import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function usePerfil() {
    const { sesion, perfil } = useAuth();
    const cargando = ref(false);
    const error = ref('');
    const mensaje = ref('');

    async function actualizarDatos(datos) {
        error.value = '';
        mensaje.value = '';

        const telefono = datos.telefono.trim();
        const direccion = datos.direccion.trim();
        const localidad = datos.localidad.trim();

        if (telefono === '' || direccion === '' || localidad === '') {
            error.value = 'Completá teléfono, dirección y localidad.';
            return false;
        }

        cargando.value = true;

        const { data, error: errorUpdate } = await supabase
            .from('profiles')
            .update({
                telefono: telefono,
                direccion: direccion,
                localidad: localidad,
            })
            .eq('id', sesion.value.user.id)
            .select('id, name, dni, telefono, direccion, localidad, rol, is_validado')
            .single();

        cargando.value = false;

        if (errorUpdate) {
            console.error(errorUpdate);
            error.value = 'No pudimos guardar tus datos. Intentá de nuevo en unos minutos.';
            return false;
        }

        perfil.value = data;
        mensaje.value = 'Tus datos se guardaron correctamente.';
        return true;
    }

    return {
        cargando,
        error,
        mensaje,
        actualizarDatos,
    };
}
