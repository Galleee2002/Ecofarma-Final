<template>
    <footer class="bg-primary text-surface">
        <div class="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-5">
                <RouterLink :to="{ name: 'inicio' }" class="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface" aria-label="Ecofarma, inicio">
                    <img src="/logo.webp" alt="Ecofarma" width="1280" height="1280" class="size-12 object-contain" loading="lazy" />
                </RouterLink>
                <p class="max-w-72 border-l border-surface/30 pl-5 text-sm">Doná los medicamentos que ya no usás y encontrá los que necesitás.</p>
            </div>
            <nav aria-label="Pie de página" class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <RouterLink :to="{ name: 'inicio' }" class="inline-flex min-h-11 items-center rounded-sm px-2 hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-surface">Inicio</RouterLink>
                <RouterLink :to="{ name: 'donar' }" class="inline-flex min-h-11 items-center rounded-sm px-2 hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-surface">Donar</RouterLink>
                <RouterLink :to="{ name: 'recibir' }" class="inline-flex min-h-11 items-center rounded-sm px-2 hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-surface">Recibir</RouterLink>
                <a href="#como-funciona" class="inline-flex min-h-11 items-center rounded-sm px-2 hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-surface">Cómo funciona</a>
            </nav>
        </div>
    </footer>
</template>
