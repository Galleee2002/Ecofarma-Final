<script setup>
import 'vue-sonner/style.css';
import { Toaster } from '@/components/ui/sonner';
import BarraNavegacion from './components/layout/BarraNavegacion.vue';
</script>

<template>
    <BarraNavegacion />
    <RouterView />
    <Toaster />
</template>
