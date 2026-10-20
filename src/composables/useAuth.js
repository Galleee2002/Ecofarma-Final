import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const sesion = ref(null);
const perfil = ref(null);
const errorPerfil = ref('');
const mensajeExito = ref('');
const tipoMensaje = ref('exito');
let authIniciado = false;

let resolverSesionInicial;
const sesionInicial = new Promise(function (resolver) {
    resolverSesionInicial = resolver;
});

let resolverPerfil;
let perfilListo = new Promise(function (resolver) {
    resolverPerfil = resolver;
});

function marcarPerfilListo() {
    resolverPerfil();
}

function resetearEsperaPerfil() {
    perfilListo = new Promise(function (resolver) {
        resolverPerfil = resolver;
    });
}

function traducirError(errorAuth, mensajePorDefecto) {
    console.error(errorAuth);

    if (errorAuth.code === 'invalid_credentials') {
        return 'El email o la contraseña no son correctos.';
    }
    if (errorAuth.code === 'user_already_exists' || errorAuth.code === 'email_exists') {
        return 'Ya existe una cuenta con ese email.';
    }
    if (errorAuth.code === 'weak_password') {
        return 'La contraseña es muy débil. Usá al menos 6 caracteres.';
    }
    if (errorAuth.code === 'email_address_invalid') {
        return 'El email ingresado no es válido.';
    }
    if (errorAuth.code === 'over_request_rate_limit') {
        return 'Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.';
    }
    if (errorAuth.code === 'unexpected_failure') {
        return 'No pudimos crear la cuenta. Verificá que el DNI no esté registrado.';
    }
    if (errorAuth.status === 0) {
        return 'No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.';
    }

    return mensajePorDefecto;
}

async function cargarPerfil() {
    errorPerfil.value = '';

    if (sesion.value === null) {
        perfil.value = null;
        marcarPerfilListo();
        return;
    }

    const { data, error: errorConsulta } = await supabase
        .from('profiles')
        .select('id, name, dni, telefono, direccion, localidad, rol, is_validado')
        .eq('id', sesion.value.user.id)
        .single();

    if (errorConsulta) {
        console.error(errorConsulta);
        perfil.value = null;
        errorPerfil.value = 'No pudimos cargar tus datos. Recargá la página para intentar de nuevo.';
    } else {
        perfil.value = data;
    }

    marcarPerfilListo();
}

function actualizarSesion(nuevaSesion) {
    let idAnterior = null;
    if (sesion.value !== null) {
        idAnterior = sesion.value.user.id;
    }

    sesion.value = nuevaSesion;

    if (nuevaSesion === null) {
        perfil.value = null;
        errorPerfil.value = '';
        marcarPerfilListo();
    } else if (nuevaSesion.user.id !== idAnterior) {
        resetearEsperaPerfil();
        setTimeout(cargarPerfil, 0);
    }
}

function esperarPerfil() {
    if (sesion.value === null) {
        return Promise.resolve();
    }
    if (perfil.value !== null && perfil.value.id === sesion.value.user.id) {
        return Promise.resolve();
    }
    if (errorPerfil.value !== '') {
        return Promise.resolve();
    }
    return perfilListo;
}

function mostrarAviso(texto, tipo) {
    mensajeExito.value = texto;
    tipoMensaje.value = tipo;
}

function iniciarAuth() {
    if (authIniciado) {
        return;
    }
    authIniciado = true;

    supabase.auth.onAuthStateChange(function (evento, nuevaSesion) {
        actualizarSesion(nuevaSesion);

        if (evento === 'INITIAL_SESSION') {
            resolverSesionInicial();
        }
    });
}

function esperarSesionInicial() {
    iniciarAuth();
    return sesionInicial;
}

function validarRegistro(datos) {
    const camposObligatorios = [
        datos.name,
        datos.dni,
        datos.telefono,
        datos.direccion,
        datos.localidad,
        datos.email,
        datos.password,
    ];

    for (const campo of camposObligatorios) {
        if (campo.trim() === '') {
            return 'Completá todos los campos para crear tu cuenta.';
        }
    }

    if (datos.password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (datos.aceptoDdjj !== true) {
        return 'Para registrarte tenés que aceptar los Términos y la Declaración Jurada.';
    }

    return '';
}

export function useAuth() {
    const cargando = ref(false);
    const error = ref('');

    async function registrarse(datos) {
        error.value = '';
        mensajeExito.value = '';

        const errorValidacion = validarRegistro(datos);
        if (errorValidacion !== '') {
            error.value = errorValidacion;
            return false;
        }

        cargando.value = true;

        const { error: errorRegistro } = await supabase.auth.signUp({
            email: datos.email.trim(),
            password: datos.password,
            options: {
                data: {
                    name: datos.name.trim(),
                    dni: datos.dni.trim(),
                    telefono: datos.telefono.trim(),
                    direccion: datos.direccion.trim(),
                    localidad: datos.localidad.trim(),
                    acepto_ddjj: true,
                },
            },
        });

        cargando.value = false;

        if (errorRegistro) {
            error.value = traducirError(errorRegistro, 'No pudimos crear tu cuenta. Intentá de nuevo en unos minutos.');
            return false;
        }

        tipoMensaje.value = 'exito';
        mensajeExito.value = 'Tu cuenta se creó correctamente. ¡Te damos la bienvenida a EcoFARMA!';
        return true;
    }

    async function iniciarSesion(email, password) {
        error.value = '';
        mensajeExito.value = '';

        if (email.trim() === '' || password === '') {
            error.value = 'Ingresá tu email y tu contraseña.';
            return false;
        }

        cargando.value = true;

        const { error: errorLogin } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
        });

        cargando.value = false;

        if (errorLogin) {
            error.value = traducirError(errorLogin, 'No pudimos iniciar sesión. Intentá de nuevo en unos minutos.');
            return false;
        }

        tipoMensaje.value = 'exito';
        mensajeExito.value = 'Iniciaste sesión correctamente.';
        return true;
    }

    async function cerrarSesion() {
        error.value = '';
        mensajeExito.value = '';
        cargando.value = true;

        const { error: errorLogout } = await supabase.auth.signOut();

        cargando.value = false;

        if (errorLogout) {
            error.value = traducirError(errorLogout, 'No pudimos cerrar la sesión. Intentá de nuevo.');
            return false;
        }

        tipoMensaje.value = 'cierre';
        mensajeExito.value = 'Cerraste sesión correctamente.';
        return true;
    }

    function ocultarMensajeExito() {
        mensajeExito.value = '';
    }

    return {
        sesion,
        perfil,
        errorPerfil,
        mensajeExito,
        tipoMensaje,
        cargando,
        error,
        esperarSesionInicial,
        esperarPerfil,
        mostrarAviso,
        registrarse,
        iniciarSesion,
        cerrarSesion,
        ocultarMensajeExito,
    };
}
