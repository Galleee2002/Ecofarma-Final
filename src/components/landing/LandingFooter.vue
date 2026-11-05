<script setup>
const plataforma = [
    { etiqueta: 'Inicio', destino: { name: 'inicio' } },
    { etiqueta: 'Donar', destino: { name: 'donar' } },
    { etiqueta: 'Recibir', destino: { name: 'recibir' } },
    { etiqueta: 'Cómo funciona', destino: { name: 'inicio', hash: '#como-funciona' } },
    { etiqueta: 'Preguntas frecuentes', destino: { name: 'inicio', hash: '#preguntas' } },
];

const legales = [
    { etiqueta: 'Términos y condiciones', destino: { name: 'terminos' } },
    { etiqueta: 'Declaración jurada', destino: { name: 'declaracion-jurada' } },
];

const claseEnlace = 'w-fit text-sm underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface';
</script>

<template>
    <footer class="bg-primary text-surface">
        <div class="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
            <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                <div class="self-center lg:col-span-4">
                    <RouterLink :to="{ name: 'inicio' }" class="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface" aria-label="ecofarma, inicio">
                        <img src="/logo.webp" alt="ecofarma" width="1280" height="1280" class="size-16 object-contain" loading="lazy" />
                    </RouterLink>
                    <p class="mt-5 max-w-xs text-sm">Plataforma gratuita para compartir medicamentos entre personas. La entrega se acuerda en el chat.</p>
                </div>

                <nav class="lg:col-span-2 lg:col-start-6" aria-label="Plataforma">
                    <h3 class="font-heading text-sm">Plataforma</h3>
                    <ul class="mt-4 flex list-none flex-col gap-2.5">
                        <li v-for="enlace in plataforma" :key="enlace.etiqueta">
                            <RouterLink :to="enlace.destino" :class="claseEnlace">{{ enlace.etiqueta }}</RouterLink>
                        </li>
                    </ul>
                </nav>

                <nav class="lg:col-span-3" aria-label="Legales">
                    <h3 class="font-heading text-sm">Legales</h3>
                    <ul class="mt-4 flex list-none flex-col gap-2.5">
                        <li v-for="enlace in legales" :key="enlace.etiqueta">
                            <RouterLink :to="enlace.destino" :class="claseEnlace">{{ enlace.etiqueta }}</RouterLink>
                        </li>
                    </ul>
                </nav>

                <div class="lg:col-span-2">
                    <h3 class="font-heading text-sm">Contacto</h3>
                    <ul class="mt-4 flex list-none flex-col gap-2.5 text-sm">
                        <li>Instagram · @ecofarma</li>
                        <li>Facebook · ecofarma</li>
                    </ul>
                </div>
            </div>

            <div class="mt-10 flex flex-col gap-2 border-t border-surface/30 pt-6 text-xs lg:mt-14 lg:flex-row lg:items-center lg:justify-between">
                <p>© 2026 ecofarma</p>
                <p>Intercambio gratuito entre personas. Sin venta de medicamentos.</p>
            </div>
        </div>
    </footer>
</template>
