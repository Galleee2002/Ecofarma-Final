<script setup>
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

const abierto = ref(false);

function pedir() {
    abierto.value = true;
}

function confirmar() {
    emit('cancelar');
}
</script>

<template>
    <Card>
        <CardContent>
            <Button type="button" variant="destructive" @click="pedir">
                Cancelar solicitud
            </Button>
        </CardContent>
    </Card>

    <Dialog v-model:open="abierto">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Cancelar solicitud</DialogTitle>
                <DialogDescription>
                    El medicamento vuelve a estar disponible para otra persona.
                </DialogDescription>
            </DialogHeader>

            <Alert v-if="error !== ''" variant="danger">
                <p>{{ error }}</p>
            </Alert>

            <DialogFooter>
                <Button type="button" variant="outline" :disabled="cancelando" @click="abierto = false">
                    No, volver
                </Button>
                <Button type="button" variant="destructive" :cargando="cancelando" @click="confirmar">
                    Sí, cancelar
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
