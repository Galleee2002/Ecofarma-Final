<script setup>
import { computed, onMounted, ref } from 'vue';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseBadge from '../components/ui/BaseBadge.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import BaseSelect from '../components/ui/BaseSelect.vue';
import { useAuth } from '../composables/useAuth';
import { usePaginacion } from '../composables/usePaginacion';
import { useUsuariosAdmin } from '../composables/useUsuariosAdmin';

const { perfil } = useAuth();
const { usuarios, cargando, error, guardando, errorAccion, tipoErrorAccion, mensajeAccion, cargarUsuarios, aplicarAccion } = useUsuariosAdmin();

const busqueda = ref('');
const filtroEstado = ref('todos');
const filtroRol = ref('todos');
const pendiente = ref(null);

const opcionesEstado = [
    { value: 'todos', label: 'Todos' },
    { value: 'activa', label: 'Activa' },
    { value: 'suspendida', label: 'Suspendida' },
];

const opcionesRol = [
    { value: 'todos', label: 'Todos' },
    { value: 'user', label: 'Usuario' },
    { value: 'admin', label: 'Administrador' },
];

const usuarioActualId = computed(function () {
    if (perfil.value === null) {
        return '';
    }
    return perfil.value.id;
});

const modalAbierto = computed({
    get: function () {
        return pendiente.value !== null;
    },
    set: function (abierto) {
        if (!abierto && !guardando.value) {
            pendiente.value = null;
        }
    },
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

function varianteRol(rol) {
    if (rol === 'admin') {
        return 'info';
    }
    return 'neutral';
}

function varianteEstado(usuario) {
    if (usuario.is_validado === true) {
        return 'success';
    }
    return 'danger';
}

function accionesDeUsuario(usuario) {
    const acciones = [];
    if (usuario.is_validado === true) {
        acciones.push({ id: 'suspender', etiqueta: 'Suspender', variant: 'danger' });
    } else {
        acciones.push({ id: 'rehabilitar', etiqueta: 'Rehabilitar', variant: 'outline' });
    }
    if (usuario.rol === 'admin') {
        acciones.push({ id: 'revocar', etiqueta: 'Quitar administrador', variant: 'outline' });
    } else {
        acciones.push({ id: 'promover', etiqueta: 'Hacer administrador', variant: 'outline' });
    }
    return acciones;
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

function esAccionDestructiva() {
    if (pendiente.value === null) {
        return false;
    }
    return pendiente.value.accion === 'suspender' || pendiente.value.accion === 'revocar';
}

function cancelarConfirmacion() {
    if (guardando.value) {
        return;
    }
    pendiente.value = null;
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
        <header class="flex flex-col gap-2">
            <h1 class="text-primary">Gestión de usuarios</h1>
            <p class="text-pretty text-muted">Buscá una cuenta para suspenderla, rehabilitarla o cambiar su rol.</p>
        </header>

        <BaseAlert
            v-if="errorAccion !== ''"
            :variant="tipoErrorAccion === 'advertencia' ? 'warning' : 'error'"
            :message="errorAccion"
        />
        <BaseAlert v-if="mensajeAccion !== ''" variant="success" :message="mensajeAccion" />

        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div class="min-w-0 w-full lg:flex-1">
                <BaseInput
                    id="usuarios-busqueda"
                    v-model="busqueda"
                    label="Buscar"
                    placeholder="Nombre, email o DNI"
                />
            </div>
            <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-md">
                <BaseSelect id="usuarios-estado" v-model="filtroEstado" label="Estado" :options="opcionesEstado" />
                <BaseSelect id="usuarios-rol" v-model="filtroRol" label="Rol" :options="opcionesRol" />
            </div>
        </div>

        <p v-if="cargando" class="text-muted">Cargando cuentas...</p>
        <div v-else-if="error !== ''" class="flex flex-col items-start gap-3">
            <BaseAlert variant="error" :message="error" />
            <BaseButton variant="outline" @click="cargarUsuarios">Reintentar</BaseButton>
        </div>
        <BaseAlert
            v-else-if="usuariosFiltrados.length === 0"
            variant="info"
            message="No hay cuentas que coincidan con la búsqueda."
        />
        <template v-else>
            <ul class="flex flex-col gap-3 md:hidden">
                <li
                    v-for="usuario in visibles"
                    :key="usuario.id"
                    class="rounded-lg border border-line bg-surface p-4 shadow-sm"
                >
                    <div class="flex flex-col gap-4">
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0 flex-1">
                                <p class="font-heading text-base font-bold text-pretty text-foreground">
                                    {{ usuario.name }}
                                </p>
                                <p class="mt-1 break-words text-sm text-muted">{{ usuario.email }}</p>
                                <p class="mt-0.5 text-sm text-muted">DNI {{ usuario.dni }}</p>
                            </div>
                            <BaseBadge :variant="varianteEstado(usuario)" size="sm">
                                {{ textoEstado(usuario) }}
                            </BaseBadge>
                        </div>
                        <BaseBadge :variant="varianteRol(usuario.rol)" size="sm">
                            {{ textoRol(usuario.rol) }}
                        </BaseBadge>
                        <div class="flex flex-col gap-2 border-t border-line pt-3">
                            <BaseButton
                                v-for="accion in accionesDeUsuario(usuario)"
                                :key="accion.id"
                                class="w-full"
                                :variant="accion.variant"
                                size="md"
                                :disabled="guardando || esPropia(usuario)"
                                @click="pedirConfirmacion(usuario.id, accion.id)"
                            >
                                {{ accion.etiqueta }}
                            </BaseButton>
                        </div>
                    </div>
                </li>
            </ul>

            <div class="hidden overflow-hidden rounded-lg border border-line bg-surface shadow-sm md:block">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-line">
                            <th class="px-4 py-3 font-sans text-sm font-semibold text-foreground">Nombre</th>
                            <th class="px-4 py-3 font-sans text-sm font-semibold text-foreground">Email</th>
                            <th class="px-4 py-3 font-sans text-sm font-semibold text-foreground">DNI</th>
                            <th class="px-4 py-3 font-sans text-sm font-semibold text-foreground">Rol</th>
                            <th class="px-4 py-3 font-sans text-sm font-semibold text-foreground">Estado</th>
                            <th class="px-4 py-3 font-sans text-sm font-semibold text-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="usuario in visibles" :key="usuario.id" class="border-b border-line last:border-b-0">
                            <td class="px-4 py-3 text-foreground">{{ usuario.name }}</td>
                            <td class="px-4 py-3 text-muted">{{ usuario.email }}</td>
                            <td class="px-4 py-3 text-muted">{{ usuario.dni }}</td>
                            <td class="px-4 py-3">
                                <BaseBadge :variant="varianteRol(usuario.rol)" size="sm">{{ textoRol(usuario.rol) }}</BaseBadge>
                            </td>
                            <td class="px-4 py-3">
                                <BaseBadge :variant="varianteEstado(usuario)" size="sm">{{ textoEstado(usuario) }}</BaseBadge>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex flex-wrap gap-2">
                                    <BaseButton
                                        v-for="accion in accionesDeUsuario(usuario)"
                                        :key="accion.id"
                                        :variant="accion.variant"
                                        size="sm"
                                        :disabled="guardando || esPropia(usuario)"
                                        @click="pedirConfirmacion(usuario.id, accion.id)"
                                    >
                                        {{ accion.etiqueta }}
                                    </BaseButton>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="total > 15" class="flex flex-wrap items-center gap-3">
                <BaseButton variant="outline" size="sm" :disabled="pagina === 1" @click="pagina = pagina - 1">
                    Anterior
                </BaseButton>
                <span class="font-sans text-sm text-muted tabular-nums">Página {{ pagina }}</span>
                <BaseButton variant="outline" size="sm" :disabled="pagina * 15 >= total" @click="pagina = pagina + 1">
                    Siguiente
                </BaseButton>
            </div>
        </template>

        <BaseModal
            v-model:open="modalAbierto"
            :variant="esAccionDestructiva() ? 'danger' : 'default'"
            :title="tituloAccion()"
            :description="textoAccion()"
            :locked="guardando"
        >
            <template #footer>
                <BaseButton variant="outline" :disabled="guardando" @click="cancelarConfirmacion">Cancelar</BaseButton>
                <BaseButton
                    :variant="esAccionDestructiva() ? 'danger' : 'primary'"
                    :loading="guardando"
                    @click="confirmar"
                >
                    Confirmar
                </BaseButton>
            </template>
        </BaseModal>
    </main>
</template>
