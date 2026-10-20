<script setup>
import { useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';

const route = useRoute();
</script>

<template>
    <nav class="flex flex-wrap gap-2">
        <Button :variant="route.name === 'admin-donaciones' ? 'secondary' : 'ghost'" as-child>
            <RouterLink :to="{ name: 'admin-donaciones' }">Donaciones</RouterLink>
        </Button>
        <Button :variant="route.name === 'admin-vademecum' ? 'secondary' : 'ghost'" as-child>
            <RouterLink :to="{ name: 'admin-vademecum' }">Vademécum</RouterLink>
        </Button>
    </nav>
</template>
