<template>
    <footer class="bg-primary text-surface">
        <div class="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-5">
                <RouterLink :to="{ name: 'inicio' }" class="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface" aria-label="ecofarma, inicio">
                    <img src="/logo.webp" alt="ecofarma" width="1280" height="1280" class="size-12 object-contain" loading="lazy" />
                </RouterLink>
                <p class="max-w-72 border-l border-surface/30 pl-5 text-sm">Doná los medicamentos que ya no usás y encontrá los que necesitás.</p>
            </div>
            <div class="flex flex-col gap-2 text-sm">
                <p>Contáctanos</p>
                <p class="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    @ecofarma
                </p>
                <p class="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    ecofarma
                </p>
            </div>
        </div>
    </footer>
</template>
