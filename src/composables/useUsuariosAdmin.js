import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const MENSAJE_ERROR_LISTAR = 'No pudimos cargar las cuentas. Intentá de nuevo en unos minutos.';
const MENSAJE_ERROR_ACCION = 'No pudimos completar la acción. Intentá de nuevo en unos minutos.';
const ACCIONES_VALIDAS = {
    suspender: true,
    rehabilitar: true,
    promover: true,
    revocar: true,
};
const MENSAJES_EXITO = {
    suspender: 'La cuenta quedó suspendida. Esa persona no puede donar ni solicitar.',
    rehabilitar: 'La cuenta se rehabilitó.',
    promover: 'Esa cuenta ahora es administradora.',
    revocar: 'Esa cuenta ya no es administradora.',
};

async function leerMensajeDeError(errorFuncion, mensajePorDefecto) {
    console.error(errorFuncion);

    try {
        const cuerpo = await errorFuncion.context.json();
        if (cuerpo.error) {
            return cuerpo.error;
        }
    } catch (errorLectura) {
        console.error(errorLectura);
    }

    return mensajePorDefecto;
}

export function useUsuariosAdmin() {
    const usuarios = ref([]);
    const cargando = ref(false);
    const error = ref('');
    const guardando = ref(false);
    const errorAccion = ref('');
    const tipoErrorAccion = ref('error');
    const mensajeAccion = ref('');

    async function cargarUsuarios() {
        cargando.value = true;
        error.value = '';

        const { data, error: errorFuncion } = await supabase.functions.invoke('gestionar-usuarios', {
            body: {
                accion: 'listar',
            },
        });

        if (errorFuncion) {
            error.value = await leerMensajeDeError(errorFuncion, MENSAJE_ERROR_LISTAR);
            usuarios.value = [];
            cargando.value = false;
            return;
        }

        if (data && data.usuarios) {
            usuarios.value = data.usuarios;
        } else {
            usuarios.value = [];
        }

        cargando.value = false;
    }

    async function aplicarAccion(usuarioId, accion) {
        errorAccion.value = '';
        mensajeAccion.value = '';

        if (typeof usuarioId !== 'string' || usuarioId.trim() === '' || !ACCIONES_VALIDAS[accion]) {
            errorAccion.value = 'Elegí una cuenta y una acción para continuar.';
            tipoErrorAccion.value = 'advertencia';
            return false;
        }

        guardando.value = true;

        const { error: errorFuncion } = await supabase.functions.invoke('gestionar-usuarios', {
            body: {
                accion: accion,
                usuario_id: usuarioId.trim(),
            },
        });

        if (errorFuncion) {
            errorAccion.value = await leerMensajeDeError(errorFuncion, MENSAJE_ERROR_ACCION);
            tipoErrorAccion.value = 'error';
            guardando.value = false;
            return false;
        }

        mensajeAccion.value = MENSAJES_EXITO[accion];
        await cargarUsuarios();
        guardando.value = false;
        return true;
    }

    return {
        usuarios,
        cargando,
        error,
        guardando,
        errorAccion,
        tipoErrorAccion,
        mensajeAccion,
        cargarUsuarios,
        aplicarAccion,
    };
}
