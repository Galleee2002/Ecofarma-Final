<script setup>
import { ref } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

function confirmar() {
    if (pendiente.value === null) {
        return;
    }

    emit('accion', pendiente.value.id, pendiente.value.accion);
    pendiente.value = null;
}

function hayPendiente(usuario) {
    if (pendiente.value === null) {
        return false;
    }
    return pendiente.value.id === usuario.id;
}

function varianteConfirmar(usuario) {
    if (pendiente.value === null || pendiente.value.id !== usuario.id) {
        return 'default';
    }
    if (pendiente.value.accion === 'suspender' || pendiente.value.accion === 'revocar') {
        return 'destructive';
    }
    return 'default';
}
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
                        <div v-if="hayPendiente(usuario)" class="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                size="sm"
                                :variant="varianteConfirmar(usuario)"
                                :disabled="guardando"
                                @click="confirmar"
                            >
                                Confirmar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                :disabled="guardando"
                                @click="cancelarConfirmacion"
                            >
                                Cancelar
                            </Button>
                        </div>
                        <div v-else class="flex flex-wrap gap-2">
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
                        <p v-if="esPropia(usuario)" class="text-muted">Es tu cuenta</p>
                    </div>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</template>
