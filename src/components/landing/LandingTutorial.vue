<script setup>
import LandingDonar from './LandingDonar.vue';
import LandingRecibir from './LandingRecibir.vue';
import LandingTelefono from './LandingTelefono.vue';
</script>

<template>
    <section id="como-funciona" class="scroll-mt-8 bg-surface" aria-labelledby="tutorial-titulo">
        <div class="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-16">
            <h2 id="tutorial-titulo" class="text-2xl">Cómo funciona</h2>
            <p class="mt-2 text-muted">De la publicación a la entrega, en pocos pasos.</p>
            <div class="mt-10 grid items-start gap-10 md:grid-cols-2 lg:grid-cols-[0.8fr_1fr_1fr] lg:gap-12">
                <LandingTelefono class="order-last md:col-span-2 lg:order-first lg:col-span-1" />
                <LandingDonar />
                <LandingRecibir class="border-t border-line pt-8 md:border-t-0 md:border-l md:pl-8 md:pt-0" />
            </div>
        </div>
    </section>
</template>
