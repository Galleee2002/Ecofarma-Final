<script setup>
import LandingDescarga from '../components/landing/LandingDescarga.vue';
import LandingFaq from '../components/landing/LandingFaq.vue';
import LandingFooter from '../components/landing/LandingFooter.vue';
import LandingHero from '../components/landing/LandingHero.vue';
import LandingImpacto from '../components/landing/LandingImpacto.vue';
import LandingTutorial from '../components/landing/LandingTutorial.vue';
import LandingSponsors from '../components/landing/LandingSponsors.vue';
</script>

<template>
    <main class="bg-surface">
        <LandingHero />
        <LandingSponsors />
        <LandingTutorial />
        <LandingImpacto />
        <LandingFaq />
        <LandingDescarga />
    </main>
    <LandingFooter />
</template>
