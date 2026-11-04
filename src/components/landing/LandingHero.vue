<template>
    <section class="relative isolate overflow-hidden bg-surface" aria-labelledby="hero-titulo">
        <img
            src="/ecofarma-hero.webp"
            alt="Dos personas comparten una caja de medicamentos"
            width="1774"
            height="887"
            fetchpriority="high"
            loading="eager"
            class="absolute inset-0 size-full object-cover object-[15%_center] sm:object-[70%_center] md:object-right"
        >
        <div class="relative z-10 mx-auto flex min-h-[28rem] w-full max-w-7xl items-center px-5 py-12 sm:min-h-[30rem] sm:px-8 md:min-h-[32rem] md:py-16 lg:min-h-[36rem]">
            <div class="flex max-w-lg flex-col items-start gap-5">
                <h1 id="hero-titulo" class="text-3xl leading-tight lg:text-[2.75rem]">
                    Dale una segunda vida a tus <span class="text-icon">medicamentos</span>
                </h1>
                <p class="max-w-sm text-lg text-muted">
                    Doná tus medicamentos en buen estado y ayudá a quien los necesita.
                </p>
                <div
                    class="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:w-full md:flex-col lg:w-auto lg:flex-row"
                    role="group"
                    aria-label="Acciones principales"
                >
                    <RouterLink
                        :to="{ name: 'donar' }"
                        class="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 font-semibold text-surface hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                        Donar ahora
                    </RouterLink>
                    <RouterLink
                        :to="{ name: 'recibir' }"
                        class="inline-flex min-h-12 items-center justify-center rounded-md border border-primary bg-surface/80 px-6 font-semibold text-primary backdrop-blur-sm hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                        Recibir medicamentos
                    </RouterLink>
                </div>
            </div>
        </div>
        <div class="pointer-events-none absolute -bottom-9 -left-[10%] z-20 h-16 w-[120%] rounded-[50%] bg-surface md:h-20" aria-hidden="true"></div>
    </section>
</template>
