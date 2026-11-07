<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { landingUrl } from '../../lib/env.js';
import BaseButton from '../ui/BaseButton.vue';
import BaseModal from '../ui/BaseModal.vue';
import BaseNavbar from './BaseNavbar.vue';
import UserMenu from './UserMenu.vue';

const route = useRoute();
const router = useRouter();
const { sesion, perfil, error, cargando, cerrarSesion, mostrarAviso, esperarSesionInicial, esperarPerfil } = useAuth();
const authListo = ref(false);
const confirmarCierre = ref(false);

const urlLanding = landingUrl;

const esAdmin = computed(function () {
    return perfil.value !== null && perfil.value.rol === 'admin';
});

const nombreUsuario = computed(function () {
    if (perfil.value === null || typeof perfil.value.name !== 'string') {
        return '';
    }

    const partes = perfil.value.name.trim().split(/\s+/);
    if (partes[0] === undefined || partes[0] === '') {
        return '';
    }

    return partes[0];
});

const enlaces = computed(function () {
    return [
        { id: 'inicio', etiqueta: 'Inicio', externo: true, href: urlLanding === '' ? '/' : urlLanding },
        { id: 'donar', etiqueta: 'Donar', destino: { name: 'donar' } },
        { id: 'recibir', etiqueta: 'Recibir', destino: { name: 'recibir' } },
    ];
});

onMounted(async function () {
    await esperarSesionInicial();
    if (sesion.value !== null) {
        await esperarPerfil();
    }
    authListo.value = true;
});

function enlaceActivo(enlace) {
    if (enlace.id === 'inicio') {
        return false;
    }
    if (enlace.id === 'recibir') {
        return route.name === 'recibir' || route.name === 'catalogo' || route.name === 'medicamento-detalle';
    }
    if (enlace.id === 'donar') {
        return route.name === 'donar';
    }
    return false;
}

function clasesEnlace(enlace, movil) {
    const alto = movil ? 'min-h-11' : 'min-h-10';
    const clases = [
        'inline-flex items-center rounded-md px-3 py-2 font-semibold text-surface',
        alto,
        'transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none',
        'hover:bg-surface/10',
    ];
    if (enlaceActivo(enlace)) {
        clases.push('bg-secondary/30');
    }
    return clases.join(' ');
}

function pedirCerrarSesion() {
    confirmarCierre.value = true;
}

function cancelarCerrarSesion() {
    if (cargando.value) {
        return;
    }
    confirmarCierre.value = false;
}

async function confirmarCerrarSesion() {
    const salio = await cerrarSesion();
    if (salio) {
        confirmarCierre.value = false;
        mostrarAviso('Cerraste sesión correctamente.', 'exito');
        router.push({ name: 'catalogo' });
    } else if (error.value !== '') {
        mostrarAviso(error.value, 'advertencia');
    }
}
</script>

<template>
    <BaseNavbar sticky :logo-to="{ name: 'recibir' }">
        <template #desktop-navigation>
            <template v-for="enlace in enlaces" :key="enlace.id">
                <a
                    v-if="enlace.externo"
                    :href="enlace.href"
                    :class="clasesEnlace(enlace, false)"
                >
                    {{ enlace.etiqueta }}
                </a>
                <RouterLink
                    v-else
                    :to="enlace.destino"
                    :class="clasesEnlace(enlace, false)"
                    :aria-current="enlaceActivo(enlace) ? 'page' : undefined"
                >
                    {{ enlace.etiqueta }}
                </RouterLink>
            </template>
        </template>

        <template #actions>
            <template v-if="authListo && sesion !== null">
                <UserMenu :es-admin="esAdmin" :nombre="nombreUsuario" @logout="pedirCerrarSesion" />
            </template>
            <template v-else-if="authListo">
                <RouterLink
                    :to="{ name: 'login' }"
                    class="inline-flex min-h-11 items-center rounded-md px-3 py-2 font-semibold text-surface hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                    Ingresar
                </RouterLink>
                <RouterLink
                    :to="{ name: 'registro' }"
                    class="inline-flex min-h-11 items-center rounded-md bg-surface px-4 py-2 font-semibold text-primary transition hover:bg-surface/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
                >
                    Registrarse
                </RouterLink>
            </template>
        </template>

        <template #mobile-navigation>
            <template v-for="enlace in enlaces" :key="enlace.id">
                <a
                    v-if="enlace.externo"
                    :href="enlace.href"
                    :class="clasesEnlace(enlace, true)"
                >
                    {{ enlace.etiqueta }}
                </a>
                <RouterLink
                    v-else
                    :to="enlace.destino"
                    :class="clasesEnlace(enlace, true)"
                    :aria-current="enlaceActivo(enlace) ? 'page' : undefined"
                >
                    {{ enlace.etiqueta }}
                </RouterLink>
            </template>
        </template>

        <template #mobile-actions>
            <template v-if="authListo && sesion !== null">
                <UserMenu modo="mobile" :es-admin="esAdmin" @logout="pedirCerrarSesion" />
            </template>
            <template v-else-if="authListo">
                <RouterLink
                    :to="{ name: 'login' }"
                    class="inline-flex min-h-11 items-center rounded-md px-3 py-2 font-semibold text-surface hover:bg-surface/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                    Ingresar
                </RouterLink>
                <RouterLink
                    :to="{ name: 'registro' }"
                    class="inline-flex min-h-11 items-center justify-center rounded-md bg-surface px-4 py-2 font-semibold text-primary transition hover:bg-surface/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
                >
                    Registrarse
                </RouterLink>
            </template>
        </template>
    </BaseNavbar>

    <BaseModal
        v-model:open="confirmarCierre"
        variant="danger"
        size="sm"
        title="Cerrar sesión"
        description="Vas a salir de ecofarma en este dispositivo."
        :locked="cargando"
        :close-on-backdrop="!cargando"
        :close-on-esc="!cargando"
    >
        <template #footer>
            <BaseButton variant="outline" :disabled="cargando" @click="cancelarCerrarSesion">Cancelar</BaseButton>
            <BaseButton variant="danger" :loading="cargando" @click="confirmarCerrarSesion">Cerrar sesión</BaseButton>
        </template>
    </BaseModal>
</template>
