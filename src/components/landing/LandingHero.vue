<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '../ui/BaseButton.vue';

const router = useRouter();

function irADonar() {
    router.push({ name: 'donar' });
}
</script>

<template>
    <section
        class="relative flex min-h-[70svh] overflow-hidden lg:min-h-[80svh]"
        aria-labelledby="hero-titulo"
    >
        <img
            src="/ecofarma-hero.webp"
            alt="Entrega de un medicamento entre dos personas"
            class="absolute inset-0 h-full w-full object-cover object-[center_right] lg:object-center"
            width="1920"
            height="1080"
            fetchpriority="high"
            loading="eager"
        />
        <div class="absolute inset-0 bg-foreground/40" aria-hidden="true"></div>
        <div class="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-16 sm:px-6 lg:py-20">
            <div class="flex max-w-xl flex-col items-start gap-5 sm:gap-6">
                <p class="text-sm text-surface/80">Doná · Recibí · Coordiná</p>
                <h1 id="hero-titulo" class="hero-titulo text-surface">
                    Dale una segunda vida a tus medicamentos
                </h1>
                <p class="text-base text-surface/90 sm:text-lg">
                    Publicá tus medicamentos en buen estado y ayudá a quien los necesita.
                </p>
                <BaseButton class="mt-2 w-full sm:w-auto" size="lg" @click="irADonar">
                    Donar ahora
                </BaseButton>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hero-titulo {
    font-size: clamp(1.75rem, 4vw + 1rem, 2.5rem);
    line-height: 1.15;
}
</style>
