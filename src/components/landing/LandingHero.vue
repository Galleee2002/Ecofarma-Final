<template>
    <section class="relative isolate overflow-hidden bg-surface" aria-labelledby="hero-titulo">
        <div class="relative z-10 mx-auto grid w-full max-w-7xl px-5 pt-10 sm:px-8 md:min-h-[32rem] md:grid-cols-2 md:items-center md:py-16 lg:min-h-[36rem]">
            <div class="flex max-w-lg flex-col items-start gap-5 pb-8 md:pb-0">
                <h1 id="hero-titulo" class="text-3xl leading-tight lg:text-[2.75rem]">Dale una segunda vida a tus <span class="text-icon">medicamentos</span></h1>
                <p class="max-w-sm text-lg text-muted">Doná tus medicamentos en buen estado y ayudá a quien los necesita.</p>
                <div class="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:w-full md:flex-col lg:w-auto lg:flex-row">
                    <RouterLink :to="{ name: 'donar' }" class="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 font-semibold text-surface hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Donar ahora</RouterLink>
                    <RouterLink :to="{ name: 'recibir' }" class="inline-flex min-h-12 items-center justify-center rounded-md border border-primary px-6 font-semibold text-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Recibir medicamentos</RouterLink>
                </div>
            </div>
        </div>
        <img src="/ecofarma-hero.webp" alt="Dos personas comparten una caja de medicamentos" width="1774" height="887" fetchpriority="high" loading="eager" class="hero-foto h-64 w-full object-cover object-right sm:h-80 md:absolute md:inset-y-0 md:right-0 md:h-full md:w-3/5" />
        <div class="pointer-events-none absolute -bottom-9 -left-[10%] z-20 h-16 w-[120%] rounded-[50%] bg-surface md:h-20" aria-hidden="true"></div>
    </section>
</template>

<style scoped>
@media (min-width: 48rem) {
    .hero-foto {
        mask-image: linear-gradient(to right, transparent, black 24%);
    }
}
</style>
