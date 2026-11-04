<template>
    <section class="bg-surface" aria-labelledby="sponsors-titulo">
        <div class="mx-auto max-w-7xl px-5 py-10 text-center sm:px-8 md:py-12">
            <h2 id="sponsors-titulo">Nos acompañan</h2>
            <p class="mt-2 text-muted">El espacio para quienes acompañan el proyecto.</p>
            <ul class="mx-auto mt-7 grid max-w-2xl list-none grid-cols-3 divide-x divide-line" aria-label="Próximos colaboradores">
                <li v-for="lugar in 3" :key="lugar" class="flex min-h-14 items-center justify-center px-2 text-sm text-muted sm:text-base">Próximamente</li>
            </ul>
        </div>
    </section>
</template>
