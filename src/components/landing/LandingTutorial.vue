<script setup>
import { computed, ref, watch } from 'vue';
import BaseButton from '../ui/BaseButton.vue';
import LandingTutorialCarrusel from './LandingTutorialCarrusel.vue';

const pasosDonar = [
    {
        titulo: 'Elegí el medicamento',
        texto: 'Ingresá y buscalo en el vademécum.',
        imagen: '/landing/tutorial/donar-1.webp',
    },
    {
        titulo: 'Subí la foto del envase',
        texto: 'La foto acompaña la publicación.',
        imagen: '/landing/tutorial/donar-2.webp',
    },
    {
        titulo: 'Publicá la donación',
        texto: 'Si hace falta revisión, queda pendiente hasta que se apruebe.',
        imagen: '/landing/tutorial/donar-3.webp',
    },
];

const pasosRecibir = [
    {
        titulo: 'Mirá lo disponible',
        texto: 'El catálogo muestra medicamentos disponibles y no vencidos.',
        imagen: '/landing/tutorial/recibir-1.webp',
    },
    {
        titulo: 'Enviá la solicitud',
        texto: 'Si requiere receta, adjuntá la foto.',
        imagen: '/landing/tutorial/recibir-2.webp',
    },
    {
        titulo: 'Coordiná el encuentro',
        texto: 'Acordá la entrega por el chat. Al recibir, compartí tu código de 6 dígitos para que el donante la confirme.',
        imagen: '/landing/tutorial/recibir-3.webp',
    },
];

const modo = ref('donar');
const indice = ref(0);

const pasos = computed(function () {
    return modo.value === 'donar' ? pasosDonar : pasosRecibir;
});

watch(modo, function () {
    indice.value = 0;
});

function elegirModo(valor) {
    modo.value = valor;
}
</script>

<template>
    <section id="como-funciona" class="scroll-mt-8 overflow-hidden bg-surface" aria-labelledby="tutorial-titulo">
        <div class="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 md:py-16">
            <div class="pointer-events-none absolute -top-16 -left-20 size-48 rounded-[45%] bg-primary/10 sm:size-64" aria-hidden="true"></div>
            <div class="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-[45%] bg-icon/10 sm:size-72" aria-hidden="true"></div>

            <div class="relative mx-auto max-w-2xl text-center">
                <h2 id="tutorial-titulo" class="font-heading text-xl text-balance sm:text-2xl md:text-3xl">
                    Cómo funciona nuestra app
                </h2>
                <p class="mx-auto mt-2 max-w-xl text-sm text-pretty text-muted sm:text-base">
                    De la publicación a la entrega, en pocos pasos.
                </p>

                <div
                    class="mt-6 inline-flex max-w-full items-center gap-1 rounded-full border border-line bg-background p-1 sm:mt-8"
                    role="group"
                    aria-label="Elegir recorrido"
                >
                    <BaseButton
                        size="md"
                        :variant="modo === 'donar' ? 'primary' : 'outline'"
                        class="!min-h-11 !rounded-full !px-5"
                        :aria-pressed="modo === 'donar'"
                        @click="elegirModo('donar')"
                    >
                        Donar
                    </BaseButton>
                    <BaseButton
                        size="md"
                        :variant="modo === 'recibir' ? 'primary' : 'outline'"
                        class="!min-h-11 !rounded-full !px-5"
                        :aria-pressed="modo === 'recibir'"
                        @click="elegirModo('recibir')"
                    >
                        Recibir
                    </BaseButton>
                </div>
            </div>

            <div class="relative mt-8 sm:mt-10">
                <Transition name="tutorial-modo" mode="out-in">
                    <LandingTutorialCarrusel
                        :key="modo"
                        :pasos="pasos"
                        :indice="indice"
                        @actualizar:indice="indice = $event"
                    />
                </Transition>
            </div>
        </div>
    </section>
</template>

<style scoped>
.tutorial-modo-enter-active,
.tutorial-modo-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.tutorial-modo-enter-from,
.tutorial-modo-leave-to {
    opacity: 0;
    transform: translateY(0.5rem);
}

@media (prefers-reduced-motion: reduce) {
    .tutorial-modo-enter-active,
    .tutorial-modo-leave-active {
        transition: none;
    }

    .tutorial-modo-enter-from,
    .tutorial-modo-leave-to {
        transform: none;
    }
}
</style>
