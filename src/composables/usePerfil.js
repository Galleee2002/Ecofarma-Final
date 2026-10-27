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

        const nombre = datos.name.trim();
        const email = datos.email.trim();
        const dni = datos.dni.trim();
        const telefono = datos.telefono.trim();
        const direccion = datos.direccion.trim();
        const localidad = datos.localidad.trim();

        if (nombre === '' || email === '' || dni === '' || telefono === '' || direccion === '' || localidad === '') {
            error.value = 'Completá todos los campos.';
            return false;
        }

        if (!email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
            error.value = 'El email ingresado no es válido.';
            return false;
        }

        cargando.value = true;

        const { data, error: errorUpdate } = await supabase
            .from('profiles')
            .update({
                name: nombre,
                dni: dni,
                telefono: telefono,
                direccion: direccion,
                localidad: localidad,
            })
            .eq('id', sesion.value.user.id)
            .select('id, name, dni, telefono, direccion, localidad, rol, is_validado')
            .single();

        if (errorUpdate) {
            console.error(errorUpdate);
            cargando.value = false;
            if (errorUpdate.code === '23505') {
                error.value = 'Ya hay una cuenta registrada con ese DNI.';
            } else {
                error.value = 'No pudimos guardar tus datos. Intentá de nuevo en unos minutos.';
            }
            return false;
        }

        perfil.value = data;

        if (email !== sesion.value.user.email) {
            const { data: datosAuth, error: errorEmail } = await supabase.auth.updateUser({
                email: email,
            });

            if (errorEmail) {
                console.error(errorEmail);
                cargando.value = false;
                if (errorEmail.code === 'email_exists' || errorEmail.code === 'user_already_exists') {
                    error.value = 'Ya existe una cuenta con ese email.';
                } else if (errorEmail.code === 'email_address_invalid') {
                    error.value = 'El email ingresado no es válido.';
                } else {
                    error.value = 'Guardamos el resto de tus datos, pero no pudimos actualizar el email.';
                }
                return false;
            }

            if (datosAuth.user) {
                sesion.value = {
                    ...sesion.value,
                    user: datosAuth.user,
                };
            }

            cargando.value = false;

            if (!datosAuth.user || datosAuth.user.email !== email) {
                mensaje.value = 'Guardamos tus datos. Confirmá el nuevo email desde el correo que te enviamos para poder usarlo.';
                return true;
            }

            mensaje.value = 'Tus datos se guardaron correctamente.';
            return true;
        }

        cargando.value = false;
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
