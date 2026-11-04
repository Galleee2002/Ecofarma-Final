<script setup>
const colaboradores = [
    { nombre: 'Bayer', src: '/bayer.webp' },
    { nombre: 'Bagó', src: '/bago.svg' },
    { nombre: 'Elea', src: '/elea.png' },
]
</script>

<template>
    <section class="bg-surface" aria-labelledby="sponsors-titulo">
        <div class="mx-auto max-w-7xl px-5 py-10 text-center sm:px-8 md:py-12">
            <h2 id="sponsors-titulo">Laboratorios que confían en nosotros</h2>
            <ul class="mx-auto mt-10 grid max-w-4xl list-none grid-cols-3 divide-x divide-line" aria-label="Colaboradores">
                <li
                    v-for="(colaborador, indice) in colaboradores"
                    :key="colaborador.nombre ?? `proximo-${indice}`"
                    class="flex min-h-28 items-center justify-center px-6"
                >
                    <img
                        v-if="colaborador.src"
                        :src="colaborador.src"
                        :alt="colaborador.nombre"
                        class="h-20 w-44 object-contain"
                    >
                    <span v-else class="text-sm text-muted sm:text-base">Próximamente</span>
                </li>
            </ul>
        </div>
    </section>
</template>
