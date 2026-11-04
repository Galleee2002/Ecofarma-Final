<template>
    <section class="bg-surface px-5 py-8 sm:px-8" aria-labelledby="cierre-titulo">
        <div class="relative isolate mx-auto flex max-w-7xl flex-col gap-7 overflow-hidden rounded-lg bg-primary px-6 py-9 text-surface sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
            <div class="pointer-events-none absolute -right-24 -bottom-44 -z-10 h-60 w-96 -rotate-12 rounded-[50%] bg-surface/10" aria-hidden="true"></div>
            <h2 id="cierre-titulo" class="max-w-sm text-2xl">Un paso para compartir lo que ya no usás.</h2>
            <div class="flex flex-col gap-3 sm:flex-row">
                <RouterLink :to="{ name: 'donar' }" class="inline-flex min-h-12 items-center justify-center rounded-md bg-surface px-9 font-semibold text-primary hover:bg-surface/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface">Donar</RouterLink>
                <RouterLink :to="{ name: 'recibir' }" class="inline-flex min-h-12 items-center justify-center rounded-md border border-surface px-9 font-semibold text-surface hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface">Recibir</RouterLink>
            </div>
        </div>
    </section>
</template>
