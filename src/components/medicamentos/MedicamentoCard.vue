<script setup>
import { Card, CardContent } from '@/components/ui/card';

defineProps({
    medicamento: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <RouterLink
        :to="'/medicamento/' + medicamento.id"
        class="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
        <Card class="h-full gap-0 py-0 transition-shadow duration-200 group-hover:shadow-lg group-focus-visible:shadow-lg">
            <img
                v-if="medicamento.fotos_envase.length > 0"
                :src="medicamento.fotos_envase[0]"
                :alt="'Foto de ' + medicamento.nombre_comercial"
                class="h-36 w-full object-cover sm:h-40"
            />
            <div v-else class="h-36 bg-primary-soft/30 sm:h-40" aria-hidden="true"></div>
            <CardContent class="flex flex-1 flex-col p-5 sm:p-6">
                <div class="min-h-20 space-y-2 border-b border-line/70 pb-5">
                    <h2 class="text-lg leading-snug text-primary">{{ medicamento.nombre_comercial }}</h2>
                    <p class="text-sm leading-relaxed text-muted">{{ medicamento.principio_activo }}</p>
                </div>
                <div class="mt-auto flex min-h-11 items-center justify-center rounded-md bg-primary-soft/55 px-4 py-3 font-semibold text-primary transition-colors group-hover:bg-primary-soft group-focus-visible:bg-primary-soft">
                    <span>Ver detalle</span>
                </div>
            </CardContent>
        </Card>
    </RouterLink>
</template>
