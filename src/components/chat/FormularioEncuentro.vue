<script setup>
import { ref } from 'vue';

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

        <p v-if="error !== ''" class="rounded border border-danger bg-danger/10 p-2 text-danger">{{ error }}</p>

        <label class="flex flex-col gap-1">
            Día
            <input v-model="dia" type="date" class="rounded border px-3 py-2" :disabled="deshabilitado || enviando" />
        </label>

        <label class="flex flex-col gap-1">
            Hora
            <input v-model="hora" type="time" class="rounded border px-3 py-2" :disabled="deshabilitado || enviando" />
        </label>

        <label class="flex flex-col gap-1">
            Lugar
            <input v-model="lugar" type="text" class="rounded border px-3 py-2" :disabled="deshabilitado || enviando" />
        </label>

        <button type="submit" class="rounded border border-primary px-3 py-2 text-primary" :disabled="deshabilitado || enviando">
            {{ enviando ? 'Enviando...' : 'Proponer encuentro' }}
        </button>
    </form>
</template>
