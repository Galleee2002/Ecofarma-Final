<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import BaseButton from '../ui/BaseButton.vue';
import BaseModal from '../ui/BaseModal.vue';
import BaseNavbar from './BaseNavbar.vue';
import UserMenu from './UserMenu.vue';

const route = useRoute();
const router = useRouter();
const { sesion, perfil, error, cargando, cerrarSesion, mostrarAviso, esperarSesionInicial, esperarPerfil } = useAuth();
const authListo = ref(false);
const confirmarCierre = ref(false);

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

const esLanding = computed(function () {
    return route.name === 'inicio';
});

const enlaces = computed(function () {
    const principales = [
        { id: 'inicio', etiqueta: 'Inicio', destino: { name: 'inicio' }, deshabilitado: false },
        { id: 'donar', etiqueta: 'Donar', destino: { name: 'donar' }, deshabilitado: false },
        { id: 'recibir', etiqueta: 'Recibir', destino: { name: 'recibir' }, deshabilitado: false },
    ];
    if (esLanding.value) {
        principales.push({ id: 'como-funciona', etiqueta: 'Cómo funciona', deshabilitado: false });
    }
    return principales;
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
        return route.name === 'inicio';
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
        'inline-flex items-center rounded-md px-3 py-2 font-semibold',
        esLanding.value ? 'text-primary' : 'text-surface',
        alto,
        'transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none',
    ];

    if (enlace.deshabilitado) {
        clases.push('cursor-not-allowed border-0 bg-transparent opacity-70');
        return clases.join(' ');
    }

    clases.push(esLanding.value ? 'hover:bg-primary/5' : 'hover:bg-surface/10');
    if (enlaceActivo(enlace)) {
        clases.push(esLanding.value ? 'bg-primary/5' : 'bg-secondary/30');
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
    <BaseNavbar :claro="esLanding">
        <template #desktop-navigation>
            <template v-for="enlace in enlaces" :key="enlace.id">
                <a v-if="enlace.id === 'como-funciona'" href="#como-funciona" :class="clasesEnlace(enlace, false)">{{ enlace.etiqueta }}</a>
                <button
                    v-else-if="enlace.deshabilitado"
                    type="button"
                    disabled
                    :class="clasesEnlace(enlace, false)"
                    :aria-label="enlace.etiqueta + ', no disponible todavía'"
                    title="La página de inicio estará disponible pronto"
                >
                    {{ enlace.etiqueta }}
                </button>
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
                <div :class="esLanding ? 'rounded-md bg-primary px-3 py-1' : ''">
                    <UserMenu :es-admin="esAdmin" :nombre="nombreUsuario" @logout="pedirCerrarSesion" />
                </div>
            </template>
            <template v-else-if="authListo">
                <RouterLink
                    :to="{ name: 'login' }"
                    class="inline-flex min-h-11 items-center rounded-md px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    :class="esLanding ? 'text-primary hover:bg-primary/5' : 'text-surface hover:bg-surface/10'"
                >
                    Ingresar
                </RouterLink>
                <RouterLink
                    :to="{ name: 'registro' }"
                    class="inline-flex min-h-11 items-center rounded-md px-4 py-2 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
                    :class="esLanding ? 'bg-primary text-surface hover:brightness-110' : 'bg-surface text-primary hover:bg-surface/90'"
                >
                    Registrarse
                </RouterLink>
            </template>
        </template>

        <template #mobile-navigation>
            <template v-for="enlace in enlaces" :key="enlace.id">
                <a v-if="enlace.id === 'como-funciona'" href="#como-funciona" :class="clasesEnlace(enlace, true)">{{ enlace.etiqueta }}</a>
                <button
                    v-else-if="enlace.deshabilitado"
                    type="button"
                    disabled
                    :class="clasesEnlace(enlace, true)"
                    :aria-label="enlace.etiqueta + ', no disponible todavía'"
                    title="La página de inicio estará disponible pronto"
                >
                    {{ enlace.etiqueta }}
                </button>
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
                <div :class="esLanding ? 'rounded-md bg-primary p-2' : ''">
                    <UserMenu modo="mobile" :es-admin="esAdmin" @logout="pedirCerrarSesion" />
                </div>
            </template>
            <template v-else-if="authListo">
                <RouterLink
                    :to="{ name: 'login' }"
                    class="inline-flex min-h-11 items-center rounded-md px-3 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    :class="esLanding ? 'text-primary hover:bg-primary/5' : 'text-surface hover:bg-surface/10'"
                >
                    Ingresar
                </RouterLink>
                <RouterLink
                    :to="{ name: 'registro' }"
                    class="inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
                    :class="esLanding ? 'bg-primary text-surface hover:brightness-110' : 'bg-surface text-primary hover:bg-surface/90'"
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
