<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const metricasBase = [
    { etiqueta: 'Donaciones realizadas', objetivo: 1250, retardo: 0 },
    { etiqueta: 'Clientes satisfechos', objetivo: 980, retardo: 200 },
    { etiqueta: 'Medicamentos reutilizados', objetivo: 3400, retardo: 400 },
];

const seccionRef = ref(null);
const visibles = ref(metricasBase.map(function () {
    return false;
}));
const valores = ref(metricasBase.map(function () {
    return 0;
}));

let observador = null;
const animaciones = [];
const temporizadores = [];

function reducirMovimiento() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function formatearNumero(valor) {
    return new Intl.NumberFormat('es-AR').format(Math.round(valor));
}

function animarConteo(indice, objetivo) {
    const duracion = 1400;
    const inicio = performance.now();

    function fotograma(ahora) {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        const suavizado = 1 - Math.pow(1 - progreso, 3);
        valores.value[indice] = objetivo * suavizado;
        if (progreso < 1) {
            animaciones[indice] = requestAnimationFrame(fotograma);
        } else {
            valores.value[indice] = objetivo;
        }
    }

    animaciones[indice] = requestAnimationFrame(fotograma);
}

function revelarMetricas() {
    if (reducirMovimiento()) {
        for (let i = 0; i < metricasBase.length; i += 1) {
            visibles.value[i] = true;
            valores.value[i] = metricasBase[i].objetivo;
        }
        return;
    }

    for (let i = 0; i < metricasBase.length; i += 1) {
        const metrica = metricasBase[i];
        const temporizador = setTimeout(function () {
            visibles.value[i] = true;
            animarConteo(i, metrica.objetivo);
        }, metrica.retardo);
        temporizadores.push(temporizador);
    }
}

onMounted(function () {
    if (seccionRef.value === null) {
        return;
    }

    observador = new IntersectionObserver(
        function (entradas) {
            const entrada = entradas[0];
            if (entrada === undefined || !entrada.isIntersecting) {
                return;
            }
            revelarMetricas();
            observador.disconnect();
            observador = null;
        },
        { threshold: 0.4 },
    );

    observador.observe(seccionRef.value);
});

onBeforeUnmount(function () {
    if (observador !== null) {
        observador.disconnect();
        observador = null;
    }
    for (let i = 0; i < temporizadores.length; i += 1) {
        clearTimeout(temporizadores[i]);
    }
    for (let i = 0; i < animaciones.length; i += 1) {
        if (animaciones[i] !== undefined) {
            cancelAnimationFrame(animaciones[i]);
        }
    }
});
</script>

<template>
    <section ref="seccionRef" class="bg-surface" aria-labelledby="metricas-titulo">
        <div class="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-16">
            <h2 id="metricas-titulo" class="text-2xl">Nuestro impacto</h2>
            <p class="mt-2 text-muted">Resultados que crecen con cada intercambio responsable.</p>
            <ul class="mt-10 grid list-none gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
                <li
                    v-for="(metrica, indice) in metricasBase"
                    :key="metrica.etiqueta"
                    class="text-center transition duration-700 ease-out motion-reduce:transition-none md:px-8 md:first:pl-0 md:last:pr-0"
                    :class="visibles[indice] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
                >
                    <p class="font-heading text-3xl font-bold leading-none text-primary tabular-nums sm:text-[2.75rem]">
                        {{ formatearNumero(valores[indice]) }}
                    </p>
                    <p class="mt-2 text-muted">{{ metrica.etiqueta }}</p>
                </li>
            </ul>
        </div>
    </section>
</template>
