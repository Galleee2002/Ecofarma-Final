<script setup>
import { SendIcon } from '@lucide/vue';
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <form class="flex flex-col gap-2 border-t border-border p-3" @submit.prevent="enviar">
        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <div class="flex items-center gap-2">
            <Input
                id="chat-mensaje"
                v-model="texto"
                type="text"
                aria-label="Mensaje"
                placeholder="Escriba aquí su mensaje..."
                class="flex-1"
                :disabled="deshabilitado || enviando"
            />
            <Button
                type="submit"
                variant="ghost"
                size="icon"
                class="text-icon"
                aria-label="Enviar"
                :cargando="enviando"
                :disabled="deshabilitado || texto.trim() === ''"
            >
                <SendIcon />
            </Button>
        </div>
    </form>
</template>
