<script setup>
import { computed, ref, watch } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const props = defineProps({
    usuarios: {
        type: Array,
        required: true,
    },
    usuarioActualId: {
        type: String,
        required: true,
    },
    guardando: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(['accion']);

const pendiente = ref(null);

function esPropia(usuario) {
    return usuario.id === props.usuarioActualId;
}

function textoRol(rol) {
    if (rol === 'admin') {
        return 'Administrador';
    }
    return 'Usuario';
}

function varianteRol(rol) {
    if (rol === 'admin') {
        return 'admin';
    }
    return 'usuario';
}

function textoEstado(usuario) {
    if (usuario.is_validado === true) {
        return 'Activa';
    }
    return 'Suspendida';
}

function varianteEstado(usuario) {
    if (usuario.is_validado === true) {
        return 'activa';
    }
    return 'suspendida';
}

function pedirConfirmacion(usuarioId, accion) {
    pendiente.value = {
        id: usuarioId,
        accion: accion,
    };
}

function cancelarConfirmacion() {
    pendiente.value = null;
}

const dialogoAbierto = computed({
    get() {
        return pendiente.value !== null;
    },
    set(valor) {
        if (valor === false && props.guardando === false) {
            pendiente.value = null;
        }
    },
});

function usuarioPendiente() {
    if (pendiente.value === null) {
        return null;
    }

    for (let i = 0; i < props.usuarios.length; i++) {
        if (props.usuarios[i].id === pendiente.value.id) {
            return props.usuarios[i];
        }
    }

    return null;
}

function tituloAccion() {
    if (pendiente.value === null) {
        return '';
    }
    if (pendiente.value.accion === 'suspender') {
        return 'Suspender cuenta';
    }
    if (pendiente.value.accion === 'rehabilitar') {
        return 'Rehabilitar cuenta';
    }
    if (pendiente.value.accion === 'revocar') {
        return 'Quitar administrador';
    }
    return 'Hacer administrador';
}

function textoAccion() {
    const usuario = usuarioPendiente();
    let nombre = 'esta persona';
    if (usuario !== null && usuario.name) {
        nombre = usuario.name;
    }

    if (pendiente.value === null) {
        return '';
    }
    if (pendiente.value.accion === 'suspender') {
        return nombre + ' no va a poder ingresar hasta que rehabilites la cuenta.';
    }
    if (pendiente.value.accion === 'rehabilitar') {
        return nombre + ' va a poder volver a ingresar a EcoFARMA.';
    }
    if (pendiente.value.accion === 'revocar') {
        return nombre + ' deja de administrar donaciones, el vademécum y las cuentas.';
    }
    return nombre + ' va a poder moderar donaciones, el vademécum y las cuentas.';
}

function varianteAccion() {
    if (pendiente.value === null) {
        return 'default';
    }
    if (pendiente.value.accion === 'suspender' || pendiente.value.accion === 'revocar') {
        return 'destructive';
    }
    return 'default';
}

function confirmar() {
    if (pendiente.value === null) {
        return;
    }

    emit('accion', pendiente.value.id, pendiente.value.accion);
}

watch(
    function () {
        return props.guardando;
    },
    function (valor, anterior) {
        if (pendiente.value !== null && anterior === true && valor === false) {
            pendiente.value = null;
        }
    },
);
</script>

<template>
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow v-for="usuario in usuarios" :key="usuario.id">
                <TableCell>{{ usuario.name }}</TableCell>
                <TableCell>{{ usuario.email }}</TableCell>
                <TableCell>{{ usuario.dni }}</TableCell>
                <TableCell>
                    <Badge :variant="varianteRol(usuario.rol)">{{ textoRol(usuario.rol) }}</Badge>
                </TableCell>
                <TableCell>
                    <Badge :variant="varianteEstado(usuario)">{{ textoEstado(usuario) }}</Badge>
                </TableCell>
                <TableCell class="whitespace-normal">
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-wrap gap-2">
                            <Button
                                v-if="usuario.is_validado === true"
                                type="button"
                                size="sm"
                                variant="destructive"
                                :disabled="guardando || esPropia(usuario)"
                                @click="pedirConfirmacion(usuario.id, 'suspender')"
                            >
                                Suspender
                            </Button>
                            <Button
                                v-else
                                type="button"
                                size="sm"
                                :disabled="guardando || esPropia(usuario)"
                                @click="pedirConfirmacion(usuario.id, 'rehabilitar')"
                            >
                                Rehabilitar
                            </Button>
                            <Button
                                v-if="usuario.rol === 'admin'"
                                type="button"
                                size="sm"
                                variant="outline"
                                :disabled="guardando || esPropia(usuario)"
                                @click="pedirConfirmacion(usuario.id, 'revocar')"
                            >
                                Quitar administrador
                            </Button>
                            <Button
                                v-else
                                type="button"
                                size="sm"
                                variant="outline"
                                :disabled="guardando || esPropia(usuario)"
                                @click="pedirConfirmacion(usuario.id, 'promover')"
                            >
                                Hacer administrador
                            </Button>
                        </div>
                        <p v-if="esPropia(usuario)" class="text-sm text-muted">Es tu cuenta</p>
                    </div>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>

    <Dialog v-model:open="dialogoAbierto">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{{ tituloAccion() }}</DialogTitle>
                <DialogDescription>{{ textoAccion() }}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button type="button" variant="outline" :disabled="guardando" @click="cancelarConfirmacion">
                    Cancelar
                </Button>
                <Button type="button" :variant="varianteAccion()" :cargando="guardando" @click="confirmar">
                    Confirmar
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
