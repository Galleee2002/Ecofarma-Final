<script setup>
const ejes = [
    {
        numero: '01',
        titulo: 'Más acceso',
        texto: 'Acercar medicamentos a quienes los necesitan.',
    },
    {
        numero: '02',
        titulo: 'Menos desperdicio',
        texto: 'Promover el aprovechamiento responsable de los recursos.',
    },
    {
        numero: '03',
        titulo: 'Más comunidad',
        texto: 'Fortalecer los vínculos a través de la solidaridad.',
    },
];
</script>

<template>
    <section class="relative overflow-hidden bg-primary text-surface" aria-labelledby="impacto-titulo">
        <div
            class="pointer-events-none absolute -top-[8%] -left-[18%] h-[32%] w-[48%] -rotate-[18deg] bg-[url('/patron-hojas.png')] bg-repeat bg-[length:180px_auto] opacity-[0.12] mix-blend-screen sm:bg-[length:220px_auto] md:-top-[6%] md:-left-[8%] md:h-[28%] md:w-[38%] md:bg-[length:260px_auto]"
            aria-hidden="true"
        ></div>
        <div
            class="pointer-events-none absolute -right-[18%] -bottom-[8%] h-[32%] w-[48%] -rotate-[18deg] bg-[url('/patron-hojas.png')] bg-repeat bg-[length:180px_auto] opacity-[0.12] mix-blend-screen sm:bg-[length:220px_auto] md:-right-[8%] md:-bottom-[6%] md:h-[28%] md:w-[38%] md:bg-[length:260px_auto]"
            aria-hidden="true"
        ></div>

        <div class="relative mx-auto max-w-7xl px-5 py-14 text-center sm:px-8 md:py-20">
            <h2 id="impacto-titulo" class="mx-auto max-w-3xl font-heading text-2xl text-balance text-surface sm:text-3xl md:text-[2.5rem] md:leading-tight">
                Cada medicamento cuenta.<br class="hidden sm:block">
                Cada acción transforma.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-sm text-pretty text-surface/80 sm:mt-5 sm:text-base">
                Queremos que cada donación responsable genere un beneficio real: más acceso a la salud, menos desperdicio y una comunidad que se acompaña.
            </p>

            <ul class="mx-auto mt-12 grid max-w-3xl list-none gap-10 sm:mt-14 md:mt-16 md:max-w-4xl md:grid-cols-3 md:gap-6 lg:gap-8">
                <li
                    v-for="eje in ejes"
                    :key="eje.numero"
                    class="mx-auto flex w-full max-w-xs flex-col items-center md:max-w-none md:items-start md:text-left"
                >
                    <span class="mb-5 block h-px w-[85%] bg-surface/45" aria-hidden="true"></span>
                    <p class="font-heading text-4xl font-normal tracking-tighter text-surface/95 sm:text-5xl">
                        {{ eje.numero }}
                    </p>
                    <h3 class="mt-4 font-heading text-lg text-surface">{{ eje.titulo }}</h3>
                    <p class="mt-2 text-sm text-pretty text-surface/75 sm:text-base">{{ eje.texto }}</p>
                </li>
            </ul>
        </div>
    </section>
</template>
