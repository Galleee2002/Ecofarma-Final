<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import { usePaginacion } from '../composables/usePaginacion';
import { useUsuariosAdmin } from '../composables/useUsuariosAdmin';

const { perfil } = useAuth();
const { usuarios, cargando, error, guardando, errorAccion, tipoErrorAccion, mensajeAccion, cargarUsuarios, aplicarAccion } = useUsuariosAdmin();

const busqueda = ref('');
const filtroEstado = ref('todos');
const filtroRol = ref('todos');
const pendiente = ref(null);

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

const { pagina, total, visibles } = usePaginacion(usuariosFiltrados, function () {
    return busqueda.value + '\n' + filtroEstado.value + '\n' + filtroRol.value;
});

function esPropia(usuario) {
    return usuario.id === usuarioActualId.value;
}

function textoRol(rol) {
    if (rol === 'admin') {
        return 'Administrador';
    }
    return 'Usuario';
}

function textoEstado(usuario) {
    if (usuario.is_validado === true) {
        return 'Activa';
    }
    return 'Suspendida';
}

function pedirConfirmacion(usuarioId, accion) {
    pendiente.value = {
        id: usuarioId,
        accion: accion,
    };
}

function usuarioPendiente() {
    if (pendiente.value === null) {
        return null;
    }
    for (let i = 0; i < visibles.value.length; i++) {
        if (visibles.value[i].id === pendiente.value.id) {
            return visibles.value[i];
        }
    }
    for (let i = 0; i < usuarios.value.length; i++) {
        if (usuarios.value[i].id === pendiente.value.id) {
            return usuarios.value[i];
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

async function confirmar() {
    if (pendiente.value === null) {
        return;
    }
    const ok = await aplicarAccion(pendiente.value.id, pendiente.value.accion);
    if (ok) {
        pendiente.value = null;
    }
}

onMounted(cargarUsuarios);
</script>

<template>
    <main class="flex flex-col gap-6">
        <h1 class="text-primary">Gestión de usuarios</h1>

        <p v-if="errorAccion !== ''" class="p-3" :class="tipoErrorAccion === 'advertencia' ? 'border border-warning bg-warning/10 text-warning' : 'border border-danger bg-danger/10 text-danger'">
            {{ errorAccion }}
        </p>
        <p v-if="mensajeAccion !== ''" class="border border-success bg-success/10 p-3 text-success">{{ mensajeAccion }}</p>

        <div class="flex flex-col gap-1">
            <label for="usuarios-busqueda">Buscar</label>
            <input id="usuarios-busqueda" v-model="busqueda" type="text" class="border border-line bg-surface px-3 py-2" placeholder="Nombre, email o DNI" />
        </div>
        <div class="flex flex-wrap gap-4">
            <div class="flex flex-col gap-1">
                <label for="usuarios-estado">Estado</label>
                <select id="usuarios-estado" v-model="filtroEstado" class="border border-line bg-surface px-3 py-2">
                    <option value="todos">Todos</option>
                    <option value="activa">Activa</option>
                    <option value="suspendida">Suspendida</option>
                </select>
            </div>
            <div class="flex flex-col gap-1">
                <label for="usuarios-rol">Rol</label>
                <select id="usuarios-rol" v-model="filtroRol" class="border border-line bg-surface px-3 py-2">
                    <option value="todos">Todos</option>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>
        </div>

        <p v-if="cargando" class="text-muted">Cargando cuentas...</p>
        <div v-else-if="error !== ''" class="flex flex-col items-start gap-2 border border-danger bg-danger/10 p-3 text-danger">
            <p>{{ error }}</p>
            <button type="button" @click="cargarUsuarios">Reintentar</button>
        </div>
        <p v-else-if="usuariosFiltrados.length === 0" class="border border-line bg-muted/10 p-3 text-muted">No hay cuentas que coincidan con la búsqueda.</p>
        <template v-else>
            <table class="w-full border-collapse bg-surface text-left">
                <thead>
                    <tr>
                        <th class="border border-line p-2">Nombre</th>
                        <th class="border border-line p-2">Email</th>
                        <th class="border border-line p-2">DNI</th>
                        <th class="border border-line p-2">Rol</th>
                        <th class="border border-line p-2">Estado</th>
                        <th class="border border-line p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="usuario in visibles" :key="usuario.id">
                        <td class="border border-line p-2">{{ usuario.name }}</td>
                        <td class="border border-line p-2">{{ usuario.email }}</td>
                        <td class="border border-line p-2">{{ usuario.dni }}</td>
                        <td class="border border-line p-2">{{ textoRol(usuario.rol) }}</td>
                        <td class="border border-line p-2">{{ textoEstado(usuario) }}</td>
                        <td class="border border-line p-2">
                            <div class="flex flex-wrap gap-2">
                                <button
                                    v-if="usuario.is_validado === true"
                                    type="button"
                                    class="bg-danger px-2 py-1 text-surface"
                                    :disabled="guardando || esPropia(usuario)"
                                    @click="pedirConfirmacion(usuario.id, 'suspender')"
                                >
                                    Suspender
                                </button>
                                <button
                                    v-else
                                    type="button"
                                    class="border border-line bg-surface px-2 py-1"
                                    :disabled="guardando || esPropia(usuario)"
                                    @click="pedirConfirmacion(usuario.id, 'rehabilitar')"
                                >
                                    Rehabilitar
                                </button>
                                <button
                                    v-if="usuario.rol === 'admin'"
                                    type="button"
                                    class="border border-line bg-surface px-2 py-1"
                                    :disabled="guardando || esPropia(usuario)"
                                    @click="pedirConfirmacion(usuario.id, 'revocar')"
                                >
                                    Quitar administrador
                                </button>
                                <button
                                    v-else
                                    type="button"
                                    class="border border-line bg-surface px-2 py-1"
                                    :disabled="guardando || esPropia(usuario)"
                                    @click="pedirConfirmacion(usuario.id, 'promover')"
                                >
                                    Hacer administrador
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="total > 15" class="flex gap-2">
                <button type="button" class="border border-line bg-surface px-3 py-1" :disabled="pagina === 1" @click="pagina = pagina - 1">Anterior</button>
                <span>Página {{ pagina }}</span>
                <button type="button" class="border border-line bg-surface px-3 py-1" :disabled="pagina * 15 >= total" @click="pagina = pagina + 1">Siguiente</button>
            </div>
        </template>

        <div v-if="pendiente !== null" class="border border-line bg-surface p-4">
            <p class="font-heading">{{ tituloAccion() }}</p>
            <p>{{ textoAccion() }}</p>
            <div class="mt-2 flex gap-2">
                <button type="button" class="border border-line bg-surface px-3 py-2" :disabled="guardando" @click="pendiente = null">Cancelar</button>
                <button type="button" class="bg-primary px-3 py-2 text-surface" :disabled="guardando" @click="confirmar">
                    {{ guardando ? 'Guardando...' : 'Confirmar' }}
                </button>
            </div>
        </div>
    </main>
</template>
