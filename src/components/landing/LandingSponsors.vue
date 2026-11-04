<script setup>
const lugares = [1, 2, 3, 4];
</script>

<template>
    <section class="bg-surface" aria-labelledby="sponsors-titulo">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:py-20">
            <div class="flex max-w-2xl flex-col gap-3">
                <h2 id="sponsors-titulo">Nos acompañan</h2>
                <p class="text-muted">El espacio para quienes acompañan el proyecto.</p>
            </div>
            <ul class="grid list-none grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                <li
                    v-for="lugar in lugares"
                    :key="lugar"
                    class="flex min-h-16 items-center justify-center text-center text-muted"
                >
                    Próximamente
                </li>
            </ul>
        </div>
    </section>
</template>
