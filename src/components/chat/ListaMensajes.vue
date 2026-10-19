<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';

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
    if (contenedor.value !== null) {
        contenedor.value.scrollTop = contenedor.value.scrollHeight;
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
    <div ref="contenedor" class="flex max-h-80 flex-col gap-2 overflow-y-auto rounded border p-3">
        <p v-if="mensajes.length === 0" class="rounded border border-secondary bg-secondary/10 p-4 text-secondary">
            Todavía no hay mensajes. Coordiná el día, la hora y el lugar del encuentro.
        </p>

        <article
            v-for="mensaje in mensajes"
            :key="mensaje.id"
            class="flex max-w-[85%] flex-col gap-1 rounded border p-2"
            :class="esPropio(mensaje) ? 'self-end border-primary' : 'self-start border-secondary'"
        >
            <p>{{ mensaje.mensaje }}</p>
            <p class="text-sm text-secondary">{{ formatearFecha(mensaje.created_at) }}</p>
        </article>
    </div>
</template>
