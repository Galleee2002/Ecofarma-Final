<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useAuth } from '../../composables/useAuth';

const emit = defineEmits(['listo']);

const { esperarSesionInicial } = useAuth();
const saliendo = ref(false);
const minimoMs = 1200;
const salidaMs = 400;

let temporizador = 0;
let cancelado = false;

function esperar(ms) {
    return new Promise(function (resolver) {
        temporizador = window.setTimeout(resolver, ms);
    });
}

onMounted(async function () {
    const inicio = Date.now();

    await esperarSesionInicial();

    if (cancelado) {
        return;
    }

    const restante = minimoMs - (Date.now() - inicio);

    if (restante > 0) {
        await esperar(restante);
    }

    if (cancelado) {
        return;
    }

    saliendo.value = true;
    await esperar(salidaMs);

    if (cancelado) {
        return;
    }

    emit('listo');
});

onBeforeUnmount(function () {
    cancelado = true;
    window.clearTimeout(temporizador);
});
</script>

<template>
    <div
        class="fixed inset-0 z-[60] flex items-center justify-center bg-surface pb-20 transition-opacity duration-[400ms] ease-out motion-reduce:transition-none"
        :class="saliendo ? 'pointer-events-none opacity-0' : 'opacity-100'"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Cargando ecofarma"
    >
        <div class="flex flex-col items-center gap-16 px-6">
            <div class="inicio-entrada">
                <img
                    src="/logo-ecofarma-inicio.png"
                    alt=""
                    class="w-36 max-w-[50vw] sm:w-40"
                />
            </div>
            <div class="h-0.5 w-32 overflow-hidden rounded-full bg-primary/30" aria-hidden="true">
                <div class="inicio-barra h-full w-2/5 bg-primary"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.inicio-entrada {
    animation: inicio-entrar 420ms ease-out both;
}

.inicio-barra {
    animation: inicio-barra 1200ms ease-in-out infinite;
}

@keyframes inicio-entrar {
    from {
        opacity: 0;
        transform: translateY(0.5rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes inicio-barra {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(250%);
    }
}

@media (prefers-reduced-motion: reduce) {
    .inicio-entrada,
    .inicio-barra {
        animation: none;
    }
}
</style>
