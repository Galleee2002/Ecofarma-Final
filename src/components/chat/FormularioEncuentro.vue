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
});

const emit = defineEmits(['proponer']);

const dia = ref('');
const hora = ref('');
const lugar = ref('');
const error = ref('');

function fechaDeHoy() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const diaHoy = String(hoy.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + diaHoy;
}

function formatearDia(valor) {
    const partes = valor.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function proponer() {
    error.value = '';
    const lugarTexto = lugar.value.trim();

    if (dia.value === '' || hora.value === '' || lugarTexto === '') {
        error.value = 'Completá el día, la hora y el lugar del encuentro.';
        return;
    }

    if (dia.value < fechaDeHoy()) {
        error.value = 'El día del encuentro no puede ser anterior a hoy.';
        return;
    }

    const mensaje = 'Propongo encontrarnos el ' + formatearDia(dia.value) + ' a las ' + hora.value + ' en ' + lugarTexto + '.';

    emit('proponer', mensaje, function () {
        dia.value = '';
        hora.value = '';
        lugar.value = '';
    });
}
</script>

<template>
    <form class="flex flex-col gap-2" @submit.prevent="proponer">
        <p class="text-primary">Proponer encuentro</p>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <div class="flex flex-col gap-1">
            <Label for="encuentro-dia">Día</Label>
            <Input id="encuentro-dia" v-model="dia" type="date" :disabled="deshabilitado || enviando" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="encuentro-hora">Hora</Label>
            <Input id="encuentro-hora" v-model="hora" type="time" :disabled="deshabilitado || enviando" />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="encuentro-lugar">Lugar</Label>
            <Input id="encuentro-lugar" v-model="lugar" type="text" :disabled="deshabilitado || enviando" />
        </div>

        <Button type="submit" :disabled="deshabilitado || enviando">
            {{ enviando ? 'Enviando...' : 'Proponer encuentro' }}
        </Button>
    </form>
</template>
