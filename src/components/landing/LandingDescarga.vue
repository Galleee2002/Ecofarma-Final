<script setup>
const tiendas = [
    {
        nombre: 'Google Play',
        src: '/landing/badge-google-play.png',
        ancho: 341,
        alto: 110,
    },
    {
        nombre: 'App Store',
        src: '/landing/badge-app-store.png',
        ancho: 345,
        alto: 110,
    },
];
</script>

<template>
    <section id="descarga" class="scroll-mt-8 bg-surface" aria-labelledby="descarga-titulo">
        <div class="mx-auto max-w-7xl px-5 pt-2 pb-12 sm:px-8 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20">
            <div class="mx-auto w-full max-w-5xl overflow-visible rounded-lg bg-primary">
                <div class="grid items-center gap-6 px-5 py-6 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] sm:gap-6 sm:px-8 sm:py-8 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-10 lg:px-10">
                    <div class="order-2 mx-auto w-full max-w-[16rem] sm:order-1 sm:mx-0 sm:max-w-none sm:-mt-24 sm:-mb-16 md:-mb-20">
                        <img
                            src="/landing/descarga-telefonos.png"
                            alt="Dos celulares con el catálogo de medicamentos y el formulario para publicar una donación"
                            width="606"
                            height="728"
                            loading="lazy"
                            class="w-full"
                        >
                    </div>

                    <div class="order-1 flex min-w-0 flex-col items-start gap-3 sm:order-2 sm:gap-4">
                        <h2 id="descarga-titulo" class="font-heading text-[1.65rem] leading-tight text-surface sm:text-[1.85rem]">
                            Descargá nuestra app
                        </h2>
                        <p class="max-w-md text-pretty text-surface">
                            Doná, recibí y sé parte de una comunidad que le da una segunda vida a los medicamentos.
                        </p>
                        <div class="flex flex-row flex-wrap gap-3">
                            <RouterLink
                                v-for="tienda in tiendas"
                                :key="tienda.nombre"
                                :to="{ name: 'donar' }"
                                class="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface"
                            >
                                <img
                                    :src="tienda.src"
                                    :alt="`Descargar en ${tienda.nombre}`"
                                    :width="tienda.ancho"
                                    :height="tienda.alto"
                                    class="h-11 w-auto sm:h-12"
                                >
                            </RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
