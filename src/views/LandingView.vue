<script setup>
import LandingBeneficios from '../components/landing/LandingBeneficios.vue';
import LandingCierre from '../components/landing/LandingCierre.vue';
import LandingConfianza from '../components/landing/LandingConfianza.vue';
import LandingFooter from '../components/landing/LandingFooter.vue';
import LandingHero from '../components/landing/LandingHero.vue';
import LandingMetricas from '../components/landing/LandingMetricas.vue';
import LandingTutorial from '../components/landing/LandingTutorial.vue';
import LandingSponsors from '../components/landing/LandingSponsors.vue';
</script>

<template>
    <main class="bg-surface">
        <LandingHero />
        <LandingSponsors />
        <LandingBeneficios />
        <LandingMetricas />
        <LandingTutorial />
        <LandingConfianza />
        <LandingCierre />
    </main>
    <LandingFooter />
</template>
