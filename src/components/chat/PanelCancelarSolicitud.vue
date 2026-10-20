<script setup>
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

defineProps({
    cancelando: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['cancelar']);

const pideConfirmacion = ref(false);

function pedir() {
    pideConfirmacion.value = true;
}

function volver() {
    pideConfirmacion.value = false;
}

function confirmar() {
    emit('cancelar');
}
</script>

<template>
    <Card>
        <CardContent class="flex flex-col gap-2">
            <Alert v-if="error !== ''" variant="danger">
                <p>{{ error }}</p>
            </Alert>

            <template v-if="pideConfirmacion">
                <p>¿Confirmás la cancelación? El medicamento vuelve a estar disponible para otra persona.</p>
                <div class="flex gap-2">
                    <Button type="button" variant="destructive" :disabled="cancelando" @click="confirmar">
                        {{ cancelando ? 'Cancelando...' : 'Sí, cancelar' }}
                    </Button>
                    <Button type="button" variant="outline" :disabled="cancelando" @click="volver">
                        No, volver
                    </Button>
                </div>
            </template>

            <Button v-else type="button" variant="destructive" @click="pedir">
                Cancelar solicitud
            </Button>
        </CardContent>
    </Card>
</template>
