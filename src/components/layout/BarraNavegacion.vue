<script setup>
import { useRoute, useRouter } from 'vue-router';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { sesion, perfil, errorPerfil, mensajeExito, tipoMensaje, cargando, error, cerrarSesion, ocultarMensajeExito } = useAuth();

function varianteAviso() {
    if (tipoMensaje.value === 'cierre') {
        return 'danger';
    }
    if (tipoMensaje.value === 'advertencia') {
        return 'warning';
    }
    return 'success';
}

function nombreUsuario() {
    if (perfil.value !== null && perfil.value.name) {
        return perfil.value.name;
    }
    return sesion.value.user.email;
}

function enlaceActivo(nombre) {
    if (route.name === nombre) {
        return true;
    }
    if (nombre === 'catalogo' && route.name === 'medicamento-detalle') {
        return true;
    }
    if (nombre === 'admin-donaciones' && (route.name === 'admin-vademecum' || route.name === 'admin-usuarios')) {
        return true;
    }
    return false;
}

function claseEnlace(nombre) {
    if (enlaceActivo(nombre)) {
        return 'rounded-md bg-primary-soft px-2.5 py-1.5 text-sm text-secondary';
    }
    return 'rounded-md px-2.5 py-1.5 text-sm text-foreground hover:bg-primary/10';
}

async function salir() {
    const salio = await cerrarSesion();
    if (salio) {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <header class="border-b border-primary-soft bg-background">
        <div class="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-4">
            <nav class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex flex-none flex-wrap items-center gap-2">
                    <RouterLink :to="{ name: 'catalogo' }" class="font-heading text-lg text-primary">
                        EcoFARMA
                    </RouterLink>
                    <RouterLink :to="{ name: 'catalogo' }" :class="claseEnlace('catalogo')">Catálogo</RouterLink>

                    <template v-if="sesion !== null">
                        <RouterLink :to="{ name: 'donar' }" :class="claseEnlace('donar')">Donar</RouterLink>
                        <RouterLink :to="{ name: 'perfil' }" :class="claseEnlace('perfil')">Mi perfil</RouterLink>
                        <RouterLink
                            v-if="perfil !== null && perfil.rol === 'admin'"
                            :to="{ name: 'admin-donaciones' }"
                            :class="claseEnlace('admin-donaciones')"
                        >
                            Moderación
                        </RouterLink>
                    </template>
                </div>

                <div class="ml-auto flex flex-none flex-wrap items-center gap-2">
                    <template v-if="sesion === null">
                        <Button variant="outline" size="sm" as-child>
                            <RouterLink :to="{ name: 'login' }">Ingresar</RouterLink>
                        </Button>
                        <Button size="sm" as-child>
                            <RouterLink :to="{ name: 'registro' }">Registrarse</RouterLink>
                        </Button>
                    </template>

                    <template v-else>
                        <span class="text-icon">Hola, {{ nombreUsuario() }}</span>
                        <Button type="button" variant="destructive" size="sm" :disabled="cargando" @click="salir">
                            {{ cargando ? 'Cerrando sesión...' : 'Cerrar sesión' }}
                        </Button>
                    </template>
                </div>
            </nav>

            <Alert
                v-if="mensajeExito !== ''"
                :variant="varianteAviso()"
                class="flex items-start justify-between gap-2"
            >
                <p>{{ mensajeExito }}</p>
                <Button type="button" variant="ghost" @click="ocultarMensajeExito">Cerrar</Button>
            </Alert>

            <Alert v-if="errorPerfil !== ''" variant="danger">
                <p>{{ errorPerfil }}</p>
            </Alert>

            <Alert v-if="error !== ''" variant="danger">
                <p>{{ error }}</p>
            </Alert>
        </div>
    </header>
</template>
