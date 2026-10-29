<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import BaseNavbar from './BaseNavbar.vue';
import UserMenu from './UserMenu.vue';

const route = useRoute();
const router = useRouter();
const { sesion, perfil, error, cerrarSesion, mostrarAviso, esperarSesionInicial, esperarPerfil } = useAuth();
const authListo = ref(false);

const esAdmin = computed(function () {
    return perfil.value !== null && perfil.value.rol === 'admin';
});

const enlaces = [
    { id: 'inicio', etiqueta: 'Inicio', destino: { name: 'catalogo' } },
    { id: 'donar', etiqueta: 'Donar', destino: { name: 'donar' } },
    { id: 'recibir', etiqueta: 'Recibir', destino: { name: 'catalogo' } },
];

onMounted(async function () {
    await esperarSesionInicial();
    if (sesion.value !== null) {
        await esperarPerfil();
    }
    authListo.value = true;
});

function enlaceActivo(enlace) {
    if (enlace.id === 'inicio') {
        return route.name === 'catalogo' || route.name === 'medicamento-detalle';
    }
    if (enlace.id === 'donar') {
        return route.name === 'donar';
    }
    return false;
}

async function salir() {
    if (!window.confirm('Vas a salir de EcoFARMA en este dispositivo.')) {
        return;
    }

    const salio = await cerrarSesion();
    if (salio) {
        router.push({ name: 'catalogo' });
    } else if (error.value !== '') {
        mostrarAviso(error.value, 'advertencia');
    }
}
</script>

<template>
    <BaseNavbar>
        <template #desktop-navigation>
            <RouterLink
                v-for="enlace in enlaces"
                :key="enlace.id"
                :to="enlace.destino"
                class="inline-flex min-h-10 items-center rounded-md px-3 py-2 font-semibold text-surface transition hover:bg-surface/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none"
                :class="enlaceActivo(enlace) ? 'bg-secondary/30' : ''"
                :aria-current="enlaceActivo(enlace) ? 'page' : undefined"
            >
                {{ enlace.etiqueta }}
            </RouterLink>
        </template>

        <template #actions>
            <template v-if="authListo && sesion !== null">
                <UserMenu :es-admin="esAdmin" @logout="salir" />
            </template>
            <template v-else-if="authListo">
                <RouterLink
                    :to="{ name: 'login' }"
                    class="inline-flex min-h-10 items-center rounded-md px-3 py-2 font-semibold text-surface transition hover:bg-surface/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none"
                >
                    Ingresar
                </RouterLink>
                <RouterLink
                    :to="{ name: 'registro' }"
                    class="inline-flex min-h-10 items-center rounded-md bg-surface px-4 py-2 font-semibold text-primary transition hover:bg-surface/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none"
                >
                    Registrarse
                </RouterLink>
            </template>
        </template>

        <template #mobile-navigation>
            <RouterLink
                v-for="enlace in enlaces"
                :key="enlace.id"
                :to="enlace.destino"
                class="inline-flex min-h-11 items-center rounded-md px-3 py-2 font-semibold text-surface transition hover:bg-surface/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none"
                :class="enlaceActivo(enlace) ? 'bg-secondary/30' : ''"
                :aria-current="enlaceActivo(enlace) ? 'page' : undefined"
            >
                {{ enlace.etiqueta }}
            </RouterLink>
        </template>

        <template #mobile-actions>
            <template v-if="authListo && sesion !== null">
                <UserMenu modo="mobile" :es-admin="esAdmin" @logout="salir" />
            </template>
            <template v-else-if="authListo">
                <RouterLink
                    :to="{ name: 'login' }"
                    class="inline-flex min-h-11 items-center rounded-md px-3 py-2 font-semibold text-surface transition hover:bg-surface/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none"
                >
                    Ingresar
                </RouterLink>
                <RouterLink
                    :to="{ name: 'registro' }"
                    class="inline-flex min-h-11 items-center justify-center rounded-md bg-surface px-4 py-2 font-semibold text-primary transition hover:bg-surface/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-primary motion-reduce:transition-none"
                >
                    Registrarse
                </RouterLink>
            </template>
        </template>
    </BaseNavbar>
</template>
