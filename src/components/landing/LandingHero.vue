<script setup>
import { ArrowRight } from '@lucide/vue';
</script>

<template>
    <section class="relative isolate overflow-x-clip bg-background" aria-labelledby="hero-titulo">
        <div class="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-8 md:py-16 lg:gap-12 lg:py-20">
            <div class="flex max-w-xl flex-col items-start gap-5">
                <h1 id="hero-titulo" class="text-3xl leading-tight text-foreground lg:text-[2.75rem]">
                    Dale una segunda vida <span class="lg:block lg:whitespace-nowrap">a tus medicamentos.</span><br class="lg:hidden">
                    <span class="text-icon">Más oportunidades <span class="block whitespace-nowrap">para las personas</span></span>
                </h1>
                <p class="max-w-md text-base text-pretty text-muted sm:text-lg">
                    Conectamos a quienes tienen medicamentos disponibles con quienes los necesitan. Una forma simple y responsable de compartir, cuidar y generar un impacto positivo.
                </p>
                <div class="mt-2 flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
                    <RouterLink
                        :to="{ name: 'donar' }"
                        class="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-6 font-semibold text-surface shadow-sm hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-auto"
                    >
                        Descargar app
                    </RouterLink>
                    <RouterLink
                        :to="{ name: 'inicio', hash: '#impacto' }"
                        class="inline-flex min-h-12 items-center gap-2 font-semibold text-primary hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                        Conocé nuestro propósito
                        <ArrowRight :size="18" aria-hidden="true" />
                    </RouterLink>
                </div>
            </div>

            <div class="relative mx-auto w-full max-w-md md:max-w-none">
                <div
                    class="pointer-events-none absolute top-[48%] left-1/2 z-0 aspect-square w-[108%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-icon/10"
                    aria-hidden="true"
                ></div>
                <img
                    src="/ecofarma_tramas_puntas_finas_editable.svg"
                    alt=""
                    width="1585"
                    height="992"
                    aria-hidden="true"
                    class="pointer-events-none absolute top-1/2 left-1/2 z-[1] h-auto w-[190%] max-w-none -translate-x-[68%] -translate-y-1/2 select-none md:w-[220%] lg:w-[230%]"
                >
                <img
                    src="/landing/tutorial/mockup-landing.webp"
                    alt="Dos celulares con el inicio de sesión y el catálogo de ecofarma"
                    width="1589"
                    height="1510"
                    fetchpriority="high"
                    loading="eager"
                    class="relative z-10 w-full"
                >
            </div>
        </div>
    </section>
</template>
