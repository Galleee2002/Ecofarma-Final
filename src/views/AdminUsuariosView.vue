<script setup>
import { computed, onMounted, ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavAdmin from '../components/admin/NavAdmin.vue';
import TablaUsuarios from '../components/admin/TablaUsuarios.vue';
import { useAuth } from '../composables/useAuth';
import { useUsuariosAdmin } from '../composables/useUsuariosAdmin';

const { perfil } = useAuth();
const {
    usuarios,
    cargando,
    error,
    guardando,
    errorAccion,
    tipoErrorAccion,
    mensajeAccion,
    cargarUsuarios,
    aplicarAccion,
} = useUsuariosAdmin();

const busqueda = ref('');
const filtroEstado = ref('todos');
const filtroRol = ref('todos');

const usuarioActualId = computed(function () {
    if (perfil.value === null) {
        return '';
    }
    return perfil.value.id;
});

function textoOVacio(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }
    return String(valor);
}

const usuariosFiltrados = computed(function () {
    const texto = busqueda.value.trim().toLowerCase();

    return usuarios.value.filter(function (usuario) {
        if (filtroEstado.value === 'activa' && usuario.is_validado !== true) {
            return false;
        }
        if (filtroEstado.value === 'suspendida' && usuario.is_validado === true) {
            return false;
        }
        if (filtroRol.value !== 'todos' && usuario.rol !== filtroRol.value) {
            return false;
        }
        if (texto === '') {
            return true;
        }

        const name = textoOVacio(usuario.name).toLowerCase();
        const email = textoOVacio(usuario.email).toLowerCase();
        const dni = textoOVacio(usuario.dni).toLowerCase();
        return name.includes(texto) || email.includes(texto) || dni.includes(texto);
    });
});

function varianteErrorAccion() {
    if (tipoErrorAccion.value === 'advertencia') {
        return 'warning';
    }
    return 'danger';
}

onMounted(function () {
    cargarUsuarios();
});
</script>

<template>
    <main class="pagina">
        <h1 class="text-2xl font-bold text-primary">Gestión de usuarios</h1>

        <NavAdmin />

        <Alert v-if="errorAccion !== ''" :variant="varianteErrorAccion()">
            <p>{{ errorAccion }}</p>
        </Alert>

        <Alert v-if="mensajeAccion !== ''" variant="success">
            <p>{{ mensajeAccion }}</p>
        </Alert>

        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <Label for="usuarios-busqueda">Buscar</Label>
                <Input
                    id="usuarios-busqueda"
                    v-model="busqueda"
                    type="text"
                    placeholder="Nombre, email o DNI"
                />
            </div>

            <div class="flex flex-wrap gap-4">
                <div class="flex flex-col gap-1">
                    <Label for="usuarios-estado">Estado</Label>
                    <Select v-model="filtroEstado">
                        <SelectTrigger id="usuarios-estado" class="w-56">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="activa">Activa</SelectItem>
                            <SelectItem value="suspendida">Suspendida</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="flex flex-col gap-1">
                    <Label for="usuarios-rol">Rol</Label>
                    <Select v-model="filtroRol">
                        <SelectTrigger id="usuarios-rol" class="w-56">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <p v-if="cargando" class="text-muted">Cargando cuentas...</p>

        <Alert v-else-if="error !== ''" variant="danger" class="flex flex-col items-start gap-2">
            <p>{{ error }}</p>
            <Button type="button" variant="destructive" @click="cargarUsuarios">Reintentar</Button>
        </Alert>

        <Alert v-else-if="usuariosFiltrados.length === 0" variant="muted">
            <p>No hay cuentas que coincidan con la búsqueda.</p>
        </Alert>

        <TablaUsuarios
            v-else
            :usuarios="usuariosFiltrados"
            :usuario-actual-id="usuarioActualId"
            :guardando="guardando"
            @accion="aplicarAccion"
        />
    </main>
</template>
