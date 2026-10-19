import { ref, onUnmounted } from 'vue';
import { supabase } from '../lib/supabase';

export function useMensajes() {
    const mensajes = ref([]);
    const solicitud = ref(null);
    const nombreOtro = ref('');
    const cargando = ref(false);
    const enviando = ref(false);
    const error = ref('');
    const errorEnvio = ref('');
    let canal = null;

    function agregarMensaje(mensaje) {
        for (const item of mensajes.value) {
            if (String(item.id) === String(mensaje.id)) {
                return;
            }
        }
        mensajes.value.push(mensaje);
    }

    function dejarDeEscuchar() {
        if (canal !== null) {
            supabase.removeChannel(canal);
            canal = null;
        }
    }

    function escucharMensajes(solicitudId) {
        dejarDeEscuchar();

        canal = supabase
            .channel('solicitud-mensajes:' + solicitudId)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'solicitud_mensajes',
                    filter: 'solicitud_id=eq.' + solicitudId,
                },
                function (payload) {
                    agregarMensaje(payload.new);
                },
            )
            .subscribe();
    }

    async function cargarChat(solicitudId, userId) {
        cargando.value = true;
        error.value = '';
        errorEnvio.value = '';
        mensajes.value = [];
        solicitud.value = null;
        nombreOtro.value = '';
        dejarDeEscuchar();

        const { data: fila, error: errorSolicitud } = await supabase
            .from('solicitudes')
            .select('id, estado, receptor_id, medicamentos(nombre_comercial, user_id)')
            .eq('id', solicitudId)
            .maybeSingle();

        if (errorSolicitud) {
            console.error(errorSolicitud);
            error.value = 'No pudimos abrir el chat. Intentá de nuevo en unos minutos.';
            cargando.value = false;
            return;
        }

        if (fila === null) {
            error.value = 'No encontramos esta conversación.';
            cargando.value = false;
            return;
        }

        solicitud.value = fila;

        const { data: participantes, error: errorParticipantes } = await supabase.rpc('participantes_solicitud', {
            p_solicitud_id: solicitudId,
        });

        if (errorParticipantes || participantes === null) {
            if (errorParticipantes) {
                console.error(errorParticipantes);
            }
        } else {
            for (const participante of participantes) {
                if (participante.id !== userId) {
                    nombreOtro.value = participante.name;
                }
            }
        }

        const { data: filas, error: errorMensajes } = await supabase
            .from('solicitud_mensajes')
            .select('id, solicitud_id, user_id, mensaje, created_at')
            .eq('solicitud_id', solicitudId)
            .order('created_at', { ascending: true });

        if (errorMensajes) {
            console.error(errorMensajes);
            error.value = 'No pudimos cargar los mensajes. Intentá de nuevo en unos minutos.';
            cargando.value = false;
            return;
        }

        mensajes.value = filas;
        escucharMensajes(solicitudId);
        cargando.value = false;
    }

    async function enviarMensaje(solicitudId, userId, texto) {
        errorEnvio.value = '';
        const mensaje = texto.trim();
        if (mensaje === '') {
            return false;
        }

        enviando.value = true;

        const { data, error: errorInsert } = await supabase
            .from('solicitud_mensajes')
            .insert({
                solicitud_id: solicitudId,
                user_id: userId,
                mensaje: mensaje,
            })
            .select('id, solicitud_id, user_id, mensaje, created_at')
            .single();

        enviando.value = false;

        if (errorInsert) {
            console.error(errorInsert);
            errorEnvio.value = 'No pudimos enviar el mensaje. Intentá de nuevo en unos minutos.';
            return false;
        }

        agregarMensaje(data);
        return true;
    }

    onUnmounted(function () {
        dejarDeEscuchar();
    });

    return {
        mensajes,
        solicitud,
        nombreOtro,
        cargando,
        enviando,
        error,
        errorEnvio,
        cargarChat,
        enviarMensaje,
    };
}
