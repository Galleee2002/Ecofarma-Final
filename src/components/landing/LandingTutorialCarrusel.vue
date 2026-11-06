<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from '@lucide/vue';

const props = defineProps({
    pasos: {
        type: Array,
        required: true,
    },
    indice: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(['actualizar:indice']);

const total = computed(function () {
    return props.pasos.length;
});

function irA(indice) {
    if (indice < 0 || indice >= total.value) {
        return;
    }
    emit('actualizar:indice', indice);
}

function anterior() {
    const siguiente = props.indice === 0 ? total.value - 1 : props.indice - 1;
    emit('actualizar:indice', siguiente);
}

function siguiente() {
    const siguienteIndice = props.indice === total.value - 1 ? 0 : props.indice + 1;
    emit('actualizar:indice', siguienteIndice);
}

function offsetDe(indice) {
    return indice - props.indice;
}

function esLateralIzquierdo(indice) {
    const offset = offsetDe(indice);
    return offset === -1 || (props.indice === 0 && indice === total.value - 1 && total.value > 2);
}

function esLateralDerecho(indice) {
    const offset = offsetDe(indice);
    return offset === 1 || (props.indice === total.value - 1 && indice === 0 && total.value > 2);
}

function clasesSlide(indice) {
    if (offsetDe(indice) === 0) {
        return 'relative z-20 scale-100 opacity-100';
    }
    if (esLateralIzquierdo(indice)) {
        return [
            'absolute inset-x-0 top-0 z-10 hidden',
            '-translate-x-[58%] scale-[0.88] opacity-45',
            'md:block md:-translate-x-[62%] lg:-translate-x-[68%]',
        ].join(' ');
    }
    if (esLateralDerecho(indice)) {
        return [
            'absolute inset-x-0 top-0 z-10 hidden',
            'translate-x-[58%] scale-[0.88] opacity-45',
            'md:block md:translate-x-[62%] lg:translate-x-[68%]',
        ].join(' ');
    }
    return 'absolute inset-x-0 top-0 z-0 hidden scale-75 opacity-0 pointer-events-none';
}

function alTeclado(evento) {
    if (evento.key === 'ArrowLeft') {
        evento.preventDefault();
        anterior();
    }
    if (evento.key === 'ArrowRight') {
        evento.preventDefault();
        siguiente();
    }
}
</script>

<template>
    <div
        class="relative outline-none"
        tabindex="0"
        role="region"
        aria-roledescription="carrusel"
        :aria-label="'Paso ' + (indice + 1) + ' de ' + total"
        @keydown="alTeclado"
    >
        <div class="relative mx-auto w-full max-w-lg md:max-w-3xl lg:max-w-4xl">
            <article
                v-for="(paso, i) in pasos"
                :key="paso.imagen + '-' + i"
                class="mx-auto w-full cursor-pointer transition duration-300 ease-out motion-reduce:transition-none"
                :class="clasesSlide(i)"
                :aria-hidden="i !== indice"
                @click="i !== indice && irA(i)"
            >
                <div
                    class="grid items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-md sm:gap-5 sm:p-5 md:grid-cols-[auto_1fr] md:gap-6 md:p-6 lg:gap-8"
                >
                    <div class="mx-auto w-32 sm:w-40 md:mx-0 md:w-36 lg:w-44">
                        <img
                            :src="paso.imagen"
                            :alt="paso.titulo"
                            class="aspect-[9/19] w-full object-contain"
                            width="176"
                            height="372"
                            decoding="async"
                        />
                    </div>
                    <div class="min-w-0 text-center md:text-left">
                        <p class="text-sm font-semibold text-primary">Paso {{ i + 1 }} de {{ total }}</p>
                        <h3 class="mt-2 font-heading text-lg text-foreground sm:text-xl md:text-2xl">{{ paso.titulo }}</h3>
                        <p class="mt-2 text-sm text-muted sm:text-base">{{ paso.texto }}</p>
                    </div>
                </div>
            </article>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3 sm:gap-4">
            <button
                type="button"
                class="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-sm transition hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Paso anterior"
                @click="anterior"
            >
                <ChevronLeft :size="22" aria-hidden="true" />
            </button>
            <div class="flex items-center gap-2.5" role="tablist" aria-label="Pasos del tutorial">
                <button
                    v-for="(_, i) in pasos"
                    :key="'dot-' + i"
                    type="button"
                    class="flex size-11 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
                    role="tab"
                    :aria-selected="i === indice"
                    :aria-label="'Ir al paso ' + (i + 1)"
                    @click="irA(i)"
                >
                    <span
                        class="block size-2.5 rounded-full"
                        :class="i === indice ? 'scale-125 bg-primary' : 'bg-muted/50'"
                        aria-hidden="true"
                    />
                </button>
            </div>
            <button
                type="button"
                class="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface text-primary shadow-sm transition hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Paso siguiente"
                @click="siguiente"
            >
                <ChevronRight :size="22" aria-hidden="true" />
            </button>
        </div>
    </div>
</template>
