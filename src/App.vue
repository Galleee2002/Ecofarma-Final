<script setup>
import { onMounted } from 'vue';
import { useAuth } from './composables/useAuth';
import BarraNavegacion from './components/layout/BarraNavegacion.vue';

const { iniciarAuth } = useAuth();

onMounted(iniciarAuth);
</script>

<template>
    <BarraNavegacion />
    <RouterView />
</template>
