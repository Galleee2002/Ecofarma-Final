<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';

const router = useRouter();

const pasos = [
    {
        titulo: 'Mirá lo disponible',
        texto: 'El catálogo muestra medicamentos disponibles y no vencidos.',
    },
    {
        titulo: 'Enviá la solicitud',
        texto: 'Si requiere receta, adjuntá la foto.',
    },
    {
        titulo: 'Coordiná el encuentro',
        texto: 'El chat es el lugar para ponerse de acuerdo.',
    },
    {
        titulo: 'Confirmá la entrega',
        texto: 'El donante carga el código de 6 dígitos.',
    },
];

function irARecibir() {
    router.push({ name: 'recibir' });
}
</script>

<template>
    <section class="bg-primary-soft" aria-labelledby="recibir-titulo">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-20">
            <div class="flex max-w-2xl flex-col gap-3">
                <h2 id="recibir-titulo">Cómo recibir</h2>
                <p class="text-muted">De la búsqueda a la entrega, en cuatro pasos.</p>
            </div>
            <ol class="grid list-none gap-8 lg:grid-cols-2">
                <li v-for="(paso, indice) in pasos" :key="paso.titulo" class="flex gap-4">
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface font-heading text-primary">
                        {{ indice + 1 }}
                    </span>
                    <div class="flex flex-col gap-1">
                        <h3>{{ paso.titulo }}</h3>
                        <p class="text-muted">{{ paso.texto }}</p>
                    </div>
                </li>
            </ol>
            <BaseButton class="w-full sm:w-auto" size="lg" @click="irARecibir">
                Recibir
            </BaseButton>
        </div>
    </section>
</template>
