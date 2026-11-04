<script setup>
import LandingBeneficios from '../components/landing/LandingBeneficios.vue';
import LandingCierre from '../components/landing/LandingCierre.vue';
import LandingDonar from '../components/landing/LandingDonar.vue';
import LandingFooter from '../components/landing/LandingFooter.vue';
import LandingHero from '../components/landing/LandingHero.vue';
import LandingRecibir from '../components/landing/LandingRecibir.vue';
import LandingSponsors from '../components/landing/LandingSponsors.vue';
</script>

<template>
    <main>
        <LandingHero />
        <LandingSponsors />
        <LandingBeneficios />
        <LandingDonar />
        <LandingRecibir />
        <LandingCierre />
        <LandingFooter />
    </main>
</template>
