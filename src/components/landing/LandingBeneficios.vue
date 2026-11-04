<script setup>
import { Sprout, MessagesSquare, Search } from '@lucide/vue';

const beneficios = [
    { titulo: 'Doná medicamentos en buen estado', texto: 'Publicá lo que está en buen estado y ya no vas a usar.', icono: Sprout },
    { titulo: 'Encontrá lo disponible', texto: 'Buscá en el catálogo medicamentos disponibles y no vencidos.', icono: Search },
    { titulo: 'Coordiná entre personas', texto: 'La entrega se acuerda en el chat, sin puntos fijos.', icono: MessagesSquare },
];
</script>

<template>
    <section class="relative isolate overflow-hidden bg-icon/5" aria-labelledby="beneficios-titulo">
        <div class="pointer-events-none absolute -top-12 -left-[10%] -z-10 h-20 w-[120%] rounded-[50%] bg-surface" aria-hidden="true"></div>
        <div class="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-16">
            <h2 id="beneficios-titulo" class="text-2xl">Compartir con sentido</h2>
            <p class="mt-2 text-muted">Doná, buscá y coordiná la entrega entre personas.</p>
            <ul class="mt-9 grid list-none gap-7 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
                <li v-for="beneficio in beneficios" :key="beneficio.titulo" class="flex gap-4 md:flex-col md:px-8 md:first:pl-0 md:last:pr-0">
                    <component :is="beneficio.icono" :size="34" :stroke-width="1.5" class="shrink-0 text-icon" aria-hidden="true" />
                    <div class="max-w-xs">
                        <h3>{{ beneficio.titulo }}</h3>
                        <p class="mt-2 text-muted">{{ beneficio.texto }}</p>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>
