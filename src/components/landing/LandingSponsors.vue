<script setup>
const colaboradores = [
    { nombre: 'Bayer', src: '/bayer.webp' },
    { nombre: 'Bagó', src: '/bago.svg' },
    { nombre: 'Elea', src: '/elea.png' },
]
</script>

<template>
    <section class="bg-background" aria-label="Colaboradores">
        <div class="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
            <ul class="mx-auto grid max-w-4xl list-none grid-cols-3 divide-x divide-line" aria-label="Colaboradores">
                <li
                    v-for="(colaborador, indice) in colaboradores"
                    :key="colaborador.nombre ?? `proximo-${indice}`"
                    class="flex min-h-20 items-center justify-center px-3 lg:min-h-28 lg:px-6"
                >
                    <img
                        v-if="colaborador.src"
                        :src="colaborador.src"
                        :alt="colaborador.nombre"
                        class="h-12 w-full max-w-28 object-contain lg:h-20 lg:max-w-44"
                    >
                    <span v-else class="text-sm text-muted sm:text-base">Próximamente</span>
                </li>
            </ul>
        </div>
    </section>
</template>
