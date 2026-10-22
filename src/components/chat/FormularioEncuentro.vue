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
const enviado = ref(false);
const horarioAbierto = ref(false);

const horas = [];
const minutos = [];
for (let numero = 0; numero < 24; numero++) {
    horas.push(String(numero).padStart(2, '0'));
}
for (let numero = 0; numero < 60; numero++) {
    minutos.push(String(numero).padStart(2, '0'));
}

function parteHora() {
    if (hora.value === '') {
        return '';
    }
    return hora.value.split(':')[0];
}

function parteMinuto() {
    if (hora.value === '') {
        return '';
    }
    return hora.value.split(':')[1];
}

function elegirHora(valor) {
    const minuto = parteMinuto() === '' ? '00' : parteMinuto();
    hora.value = valor + ':' + minuto;
}

function elegirMinuto(valor) {
    const horaTexto = parteHora() === '' ? '00' : parteHora();
    hora.value = horaTexto + ':' + valor;
}

function cerrarHorario(evento) {
    if (evento.currentTarget.contains(evento.relatedTarget)) {
        return;
    }
    horarioAbierto.value = false;
}

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
    enviado.value = true;
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
        <p class="text-sm font-semibold text-primary">Proponer encuentro</p>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>

        <div class="flex flex-col gap-1">
            <Label for="encuentro-dia">Día</Label>
            <Input
                id="encuentro-dia"
                v-model="dia"
                type="date"
                :disabled="deshabilitado || enviando"
                :aria-invalid="enviado && (dia === '' || dia < fechaDeHoy())"
            />
        </div>

        <div class="flex flex-col gap-1">
            <Label for="encuentro-hora">Hora</Label>
            <div class="relative" @focusout="cerrarHorario">
                <button
                    id="encuentro-hora"
                    type="button"
                    class="flex h-9 w-full items-center rounded-md border border-input bg-surface px-3 text-base shadow-sm outline-none hover:border-primary/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
                    :class="hora === '' ? 'text-muted' : ''"
                    :disabled="deshabilitado || enviando"
                    :aria-invalid="enviado && hora === ''"
                    :aria-expanded="horarioAbierto"
                    @click="horarioAbierto = !horarioAbierto"
                >
                    {{ hora === '' ? '--:--' : hora }}
                </button>
                <div
                    v-if="horarioAbierto"
                    class="absolute z-10 mt-1 flex gap-2 rounded-md border border-input bg-surface p-2 shadow-md"
                >
                    <ul class="h-40 overflow-y-auto">
                        <li v-for="valor in horas" :key="valor">
                            <button
                                type="button"
                                class="w-12 rounded-md px-2 py-1 text-center"
                                :class="parteHora() === valor ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'"
                                @click="elegirHora(valor)"
                            >
                                {{ valor }}
                            </button>
                        </li>
                    </ul>
                    <ul class="h-40 overflow-y-auto">
                        <li v-for="valor in minutos" :key="valor">
                            <button
                                type="button"
                                class="w-12 rounded-md px-2 py-1 text-center"
                                :class="parteMinuto() === valor ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'"
                                @click="elegirMinuto(valor)"
                            >
                                {{ valor }}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-1">
            <Label for="encuentro-lugar">Lugar</Label>
            <Input
                id="encuentro-lugar"
                v-model="lugar"
                type="text"
                :disabled="deshabilitado || enviando"
                :aria-invalid="enviado && lugar.trim() === ''"
            />
        </div>

        <Button type="submit" :cargando="enviando" :disabled="deshabilitado">
            Proponer encuentro
        </Button>
    </form>
</template>
