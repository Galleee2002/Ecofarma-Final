<script setup>
import { computed, ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

defineProps({
    confirmando: {
        type: Boolean,
        required: true,
    },
    error: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(['confirmar']);

const codigo = ref('');

const codigoValido = computed(function () {
    return /^[0-9]{6}$/.test(codigo.value.trim());
});

function confirmar() {
    emit('confirmar', codigo.value);
}
</script>

<template>
    <Card>
        <CardContent>
            <form class="flex flex-col gap-2" @submit.prevent="confirmar">
                <p>Cuando se encuentren, pedile el código de 6 dígitos al receptor y cargalo acá.</p>

                <Alert v-if="error !== ''" variant="danger">
                    <p>{{ error }}</p>
                </Alert>

                <div class="flex flex-col gap-1">
                    <Label for="codigo-retiro">Código de retiro</Label>
                    <Input
                        id="codigo-retiro"
                        v-model="codigo"
                        type="text"
                        inputmode="numeric"
                        maxlength="6"
                        :disabled="confirmando"
                        :aria-invalid="codigo.trim() !== '' && !codigoValido"
                    />
                </div>

                <Button type="submit" :cargando="confirmando" :disabled="!codigoValido">
                    Confirmar entrega
                </Button>
            </form>
        </CardContent>
    </Card>
</template>
