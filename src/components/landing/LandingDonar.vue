<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';
import LandingTelefono from './LandingTelefono.vue';

const router = useRouter();

const pasos = [
    {
        titulo: 'Elegí el medicamento',
        texto: 'Ingresá y buscalo en el vademécum.',
    },
    {
        titulo: 'Subí la foto del envase',
        texto: 'La foto acompaña la publicación.',
    },
    {
        titulo: 'Publicá la donación',
        texto: 'Si hace falta revisión, queda pendiente hasta que se apruebe.',
    },
];

function irADonar() {
    router.push({ name: 'donar' });
}
</script>

<template>
    <section class="bg-surface" aria-labelledby="donar-titulo">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-20">
            <div class="flex max-w-xl flex-col gap-8">
                <div class="flex flex-col gap-3">
                    <h2 id="donar-titulo">Cómo donar</h2>
                    <p class="text-muted">Publicá un medicamento que ya no vas a usar.</p>
                </div>
                <ol class="grid list-none gap-6">
                    <li v-for="(paso, indice) in pasos" :key="paso.titulo" class="flex gap-4">
                        <span class="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft font-heading text-primary">
                            {{ indice + 1 }}
                        </span>
                        <div class="flex flex-col gap-1">
                            <h3>{{ paso.titulo }}</h3>
                            <p class="text-muted">{{ paso.texto }}</p>
                        </div>
                    </li>
                </ol>
                <BaseButton class="w-full sm:w-auto" size="lg" @click="irADonar">
                    Donar
                </BaseButton>
            </div>
            <LandingTelefono />
        </div>
    </section>
</template>
