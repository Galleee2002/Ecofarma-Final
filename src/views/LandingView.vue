<script setup>
import LandingCierre from '../components/landing/LandingCierre.vue';
import LandingFaq from '../components/landing/LandingFaq.vue';
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
        <LandingTutorial />
        <LandingMetricas />
        <LandingFaq />
        <LandingCierre />
    </main>
    <LandingFooter />
</template>
