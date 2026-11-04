<script setup>
import { HeartHandshake, MessagesSquare, Search } from '@lucide/vue';

const beneficios = [
    {
        titulo: 'Segunda vida a medicamentos',
        texto: 'Publicá lo que está en buen estado y ya no vas a usar.',
        icono: HeartHandshake,
    },
    {
        titulo: 'Encontrá lo disponible',
        texto: 'Buscá en el catálogo medicamentos disponibles y no vencidos.',
        icono: Search,
    },
    {
        titulo: 'Coordinás entre personas',
        texto: 'La entrega se acuerda en el chat, sin puntos fijos.',
        icono: MessagesSquare,
    },
];
</script>

<template>
    <section class="bg-background" aria-labelledby="beneficios-titulo">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:py-20">
            <div class="flex max-w-2xl flex-col gap-3">
                <h2 id="beneficios-titulo">Compartir con sentido</h2>
                <p class="text-muted">Doná, buscá y coordiná la entrega entre personas.</p>
            </div>
            <ul class="grid list-none gap-10 lg:grid-cols-3 lg:gap-12">
                <li
                    v-for="beneficio in beneficios"
                    :key="beneficio.titulo"
                    class="flex flex-col items-start gap-3"
                >
                    <component
                        :is="beneficio.icono"
                        class="size-8 text-icon"
                        aria-hidden="true"
                    />
                    <h3>{{ beneficio.titulo }}</h3>
                    <p class="text-muted">{{ beneficio.texto }}</p>
                </li>
            </ul>
        </div>
    </section>
</template>
