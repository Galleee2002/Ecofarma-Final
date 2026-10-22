<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { Alert } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

const props = defineProps({
    mensajes: {
        type: Array,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
});

const contenedor = ref(null);

function esPropio(mensaje) {
    return mensaje.user_id === props.userId;
}

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString('es-AR');
}

async function bajarAlFinal() {
    await nextTick();
    if (contenedor.value === null) {
        return;
    }

    const viewport = contenedor.value.querySelector('[data-slot="scroll-area-viewport"]');
    if (viewport !== null) {
        viewport.scrollTop = viewport.scrollHeight;
    }
}

onMounted(function () {
    bajarAlFinal();
});

watch(function () {
    return props.mensajes.length;
}, function () {
    bajarAlFinal();
});
</script>

<template>
    <div ref="contenedor">
        <ScrollArea class="h-80">
            <div class="flex flex-col gap-2 p-3">
                <Alert v-if="mensajes.length === 0" variant="muted">
                    <p>Todavía no hay mensajes. Proponé el día, la hora y el lugar con el formulario de encuentro.</p>
                </Alert>

                <article
                    v-for="mensaje in mensajes"
                    :key="mensaje.id"
                    class="flex max-w-[85%] flex-col gap-1 rounded-lg border p-3 shadow-sm"
                    :class="esPropio(mensaje) ? 'self-end border-primary bg-primary-soft' : 'self-start border-border bg-surface'"
                >
                    <p>{{ mensaje.mensaje }}</p>
                    <p class="text-sm text-muted">{{ formatearFecha(mensaje.created_at) }}</p>
                </article>
            </div>
        </ScrollArea>
    </div>
</template>
