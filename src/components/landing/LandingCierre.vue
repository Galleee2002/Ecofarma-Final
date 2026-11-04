<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';

const router = useRouter();

function irA(nombre) {
    router.push({ name: nombre });
}
</script>

<template>
    <section class="bg-surface" aria-labelledby="cierre-titulo">
        <div class="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
            <div class="flex flex-col items-start gap-6 rounded-lg bg-primary-soft px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
                <h2 id="cierre-titulo" class="max-w-xl">Un paso para compartir lo que ya no usás.</h2>
                <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                    <BaseButton class="w-full sm:w-auto" @click="irA('donar')">Donar</BaseButton>
                    <BaseButton class="w-full sm:w-auto" variant="outline" @click="irA('recibir')">
                        Recibir
                    </BaseButton>
                </div>
            </div>
        </div>
    </section>
</template>
