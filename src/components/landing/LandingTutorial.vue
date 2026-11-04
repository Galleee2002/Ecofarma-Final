<script setup>
const pasos = [
    {
        titulo: 'Elegí el medicamento',
        texto: 'Buscalo en el catálogo.',
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
</script>

<template>
    <section class="bg-primary-soft" aria-labelledby="tutorial-titulo">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:py-16">
            <div class="flex max-w-2xl flex-col gap-3">
                <h2 id="tutorial-titulo">Cómo solicitar y coordinar</h2>
                <p class="text-muted">De la búsqueda a la entrega, en cuatro pasos.</p>
            </div>
            <ol class="grid list-none gap-6 lg:grid-cols-2">
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
        </div>
    </section>
</template>
