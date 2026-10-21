<script setup>
import { ref, watch } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const props = defineProps({
    donacion: {
        type: Object,
        required: true,
    },
    filasVademecum: {
        type: Array,
        required: true,
    },
    guardando: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(['corregir', 'aprobar', 'rechazar']);

const textosEstado = {
    pendiente_revision: 'En revisión',
    disponible: 'Disponible',
    rechazado: 'Rechazado',
};

function textoOVacio(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }
    return String(valor);
}

function copiarDatos(donacion) {
    let medicamentoHabilitadoId = '';
    if (donacion.medicamento_habilitado_id !== null && donacion.medicamento_habilitado_id !== undefined) {
        medicamentoHabilitadoId = String(donacion.medicamento_habilitado_id);
    }

    return {
        nombre_comercial: textoOVacio(donacion.nombre_comercial),
        principio_activo: textoOVacio(donacion.principio_activo),
        concentracion: textoOVacio(donacion.concentracion),
        forma_farmaceutica: textoOVacio(donacion.forma_farmaceutica),
        cantidad_disponible: textoOVacio(donacion.cantidad_disponible),
        lote: textoOVacio(donacion.lote),
        fecha_vencimiento: textoOVacio(donacion.fecha_vencimiento),
        descripcion: textoOVacio(donacion.descripcion),
        medicamento_habilitado_id: medicamentoHabilitadoId,
        motivo_rechazo: '',
    };
}

const datos = ref(copiarDatos(props.donacion));
const confirmarRechazo = ref(false);

function textoEstado(estado) {
    if (textosEstado[estado]) {
        return textosEstado[estado];
    }
    return estado;
}

function varianteEstado(estado) {
    if (textosEstado[estado]) {
        return estado;
    }
    return 'default';
}

function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function nombreDonante() {
    if (props.donacion.profiles && props.donacion.profiles.name) {
        return props.donacion.profiles.name;
    }
    return 'Donante';
}

function etiquetaVademecum(fila) {
    const partes = [fila.principio_activo];
    if (fila.concentracion) {
        partes.push(fila.concentracion);
    }
    if (fila.forma_farmaceutica) {
        partes.push(fila.forma_farmaceutica);
    }
    if (fila.nombre_comercial) {
        partes.push(fila.nombre_comercial);
    }
    return partes.join(' — ');
}

function obtenerFechaDeManiana() {
    const maniana = new Date();
    maniana.setDate(maniana.getDate() + 1);
    const anio = maniana.getFullYear();
    const mes = String(maniana.getMonth() + 1).padStart(2, '0');
    const dia = String(maniana.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

const fechaMinima = obtenerFechaDeManiana();

function fotos() {
    if (Array.isArray(props.donacion.fotos_envase)) {
        return props.donacion.fotos_envase;
    }
    return [];
}

function corregir() {
    emit('corregir', props.donacion.id, datos.value);
}

function aprobar() {
    emit('aprobar', props.donacion.id, datos.value);
}

function pedirRechazo() {
    confirmarRechazo.value = true;
}

function rechazar() {
    emit('rechazar', props.donacion.id, datos.value);
}

watch(
    function () {
        return props.guardando;
    },
    function (valor, anterior) {
        if (confirmarRechazo.value && anterior === true && valor === false) {
            confirmarRechazo.value = false;
        }
    },
);
</script>

<template>
    <Card>
        <CardHeader class="flex flex-col gap-1">
            <h2 class="text-lg text-primary">{{ donacion.nombre_comercial }}</h2>
            <p class="text-sm text-muted">Donante: {{ nombreDonante() }}</p>
            <Badge :variant="varianteEstado(donacion.estado)">{{ textoEstado(donacion.estado) }}</Badge>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
            <p class="text-icon">Vence: {{ formatearFecha(donacion.fecha_vencimiento) }}</p>

            <div v-if="fotos().length > 0" class="flex flex-wrap gap-2">
                <img
                    v-for="(foto, indice) in fotos()"
                    :key="indice"
                    :src="foto"
                    :alt="'Foto ' + (indice + 1) + ' de ' + donacion.nombre_comercial"
                    class="h-24 w-24 rounded-lg object-cover"
                />
            </div>

            <Alert v-else variant="muted">
                <p>Esta donación no tiene fotos del envase.</p>
            </Alert>

            <Alert v-if="donacion.estado === 'rechazado' && donacion.motivo_rechazo" variant="warning">
                <p>Motivo del rechazo: {{ donacion.motivo_rechazo }}</p>
            </Alert>

            <form class="flex flex-col gap-4" novalidate @submit.prevent="corregir">
                <div class="flex flex-col gap-1">
                    <Label :for="'moderar-nombre-' + donacion.id">Nombre comercial</Label>
                    <Input :id="'moderar-nombre-' + donacion.id" v-model="datos.nombre_comercial" type="text" />
                </div>

                <div class="flex flex-col gap-1">
                    <Label :for="'moderar-principio-' + donacion.id">Principio activo</Label>
                    <Input :id="'moderar-principio-' + donacion.id" v-model="datos.principio_activo" type="text" />
                </div>

                <div class="flex flex-col gap-1">
                    <Label :for="'moderar-concentracion-' + donacion.id">Concentración</Label>
                    <Input :id="'moderar-concentracion-' + donacion.id" v-model="datos.concentracion" type="text" />
                </div>

                <div class="flex flex-col gap-1">
                    <Label :for="'moderar-forma-' + donacion.id">Forma farmacéutica</Label>
                    <Input :id="'moderar-forma-' + donacion.id" v-model="datos.forma_farmaceutica" type="text" />
                </div>

                <div class="flex flex-col gap-1">
                    <Label :for="'moderar-cantidad-' + donacion.id">Cantidad</Label>
                    <Input
                        :id="'moderar-cantidad-' + donacion.id"
                        v-model="datos.cantidad_disponible"
                        type="number"
                        min="1"
                        step="1"
                    />
                </div>

                <div class="flex flex-col gap-1">
                    <Label :for="'moderar-lote-' + donacion.id">Lote</Label>
                    <Input :id="'moderar-lote-' + donacion.id" v-model="datos.lote" type="text" />
                </div>

                <div class="flex flex-col gap-1">
                    <Label :for="'moderar-vencimiento-' + donacion.id">Fecha de vencimiento</Label>
                    <Input
                        :id="'moderar-vencimiento-' + donacion.id"
                        v-model="datos.fecha_vencimiento"
                        type="date"
                        :min="fechaMinima"
                    />
                </div>

                <div class="flex flex-col gap-1">
                    <Label :for="'moderar-descripcion-' + donacion.id">Descripción</Label>
                    <Textarea :id="'moderar-descripcion-' + donacion.id" v-model="datos.descripcion" rows="3" />
                </div>

                <Button type="submit" variant="outline" :cargando="guardando">
                    Guardar cambios
                </Button>
            </form>

            <div class="flex flex-col gap-2">
                <Label :for="'moderar-vademecum-' + donacion.id">Medicamento del vademécum</Label>
                <Select v-model="datos.medicamento_habilitado_id">
                    <SelectTrigger :id="'moderar-vademecum-' + donacion.id" class="w-full">
                        <SelectValue placeholder="Elegí una fila del vademécum" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                        <SelectItem
                            v-for="fila in filasVademecum"
                            :key="fila.id"
                            :value="String(fila.id)"
                        >
                            {{ etiquetaVademecum(fila) }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Button type="button" :cargando="guardando" @click="aprobar">
                    Aprobar
                </Button>
            </div>

            <div class="flex flex-col gap-2">
                <Label :for="'moderar-motivo-' + donacion.id">Motivo del rechazo</Label>
                <Textarea :id="'moderar-motivo-' + donacion.id" v-model="datos.motivo_rechazo" rows="2" />
                <Button type="button" variant="destructive" :disabled="guardando" @click="pedirRechazo">
                    Rechazar
                </Button>
            </div>
        </CardContent>
    </Card>

    <Dialog v-model:open="confirmarRechazo">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rechazar donación</DialogTitle>
                <DialogDescription>
                    {{ donacion.nombre_comercial }} no va a publicarse en el catálogo.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button type="button" variant="outline" :disabled="guardando" @click="confirmarRechazo = false">
                    Cancelar
                </Button>
                <Button type="button" variant="destructive" :cargando="guardando" @click="rechazar">
                    Rechazar
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
