<script setup>
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

defineProps({
    enviando: {
        type: Boolean,
        required: true,
    },
    deshabilitado: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['enviar']);

const texto = ref('');

function enviar() {
    const mensaje = texto.value.trim();
    if (mensaje === '') {
        return;
    }

    emit('enviar', mensaje, function () {
        texto.value = '';
    });
}
</script>

<template>
    <form class="flex flex-col gap-2" @submit.prevent="enviar">
        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <div class="flex flex-col gap-1">
            <Label for="chat-mensaje">Mensaje</Label>
            <Input id="chat-mensaje" v-model="texto" type="text" :disabled="deshabilitado || enviando" />
        </div>

        <Button type="submit" :cargando="enviando" :disabled="deshabilitado || texto.trim() === ''">
            Enviar
        </Button>
    </form>
</template>
