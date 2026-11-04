<script setup>
const enlaces = [
    { id: 'inicio', etiqueta: 'Inicio', destino: { name: 'inicio' } },
    { id: 'donar', etiqueta: 'Donar', destino: { name: 'donar' } },
    { id: 'recibir', etiqueta: 'Recibir', destino: { name: 'recibir' } },
    { id: 'ingresar', etiqueta: 'Ingresar', destino: { name: 'login' } },
];
</script>

<template>
    <footer class="bg-primary text-surface">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex max-w-sm flex-col items-start gap-3">
                <img src="/logo.webp" alt="ecofarma" class="h-14 w-auto object-contain" />
                <p>Doná los medicamentos que ya no usás y encontrá los que necesitás.</p>
            </div>
            <nav aria-label="Pie de página" class="flex flex-col gap-1">
                <RouterLink
                    v-for="enlace in enlaces"
                    :key="enlace.id"
                    :to="enlace.destino"
                    class="inline-flex min-h-11 items-center rounded-md px-3 py-2 font-semibold text-surface transition hover:bg-surface/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none"
                >
                    {{ enlace.etiqueta }}
                </RouterLink>
            </nav>
        </div>
    </footer>
</template>
