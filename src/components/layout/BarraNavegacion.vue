<script setup>
import { useRouter } from 'vue-router';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../composables/useAuth';

const router = useRouter();
const { sesion, perfil, mensajeExito, tipoMensaje, cargando, error, cerrarSesion, ocultarMensajeExito } = useAuth();

function nombreUsuario() {
    if (perfil.value !== null && perfil.value.name) {
        return perfil.value.name;
    }
    return sesion.value.user.email;
}

async function salir() {
    const salio = await cerrarSesion();
    if (salio) {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <header class="mx-auto flex max-w-3xl flex-col gap-2 p-6 pb-0">
        <nav class="flex flex-wrap items-center gap-4">
            <RouterLink :to="{ name: 'catalogo' }" class="text-primary">Catálogo</RouterLink>

            <template v-if="sesion === null">
                <RouterLink :to="{ name: 'login' }" class="text-primary">Ingresar</RouterLink>
                <RouterLink :to="{ name: 'registro' }" class="text-primary">Registrarse</RouterLink>
            </template>

            <template v-else>
                <RouterLink :to="{ name: 'donar' }" class="text-primary">Donar</RouterLink>
                <RouterLink :to="{ name: 'perfil' }" class="text-primary">Mi perfil</RouterLink>
                <span>Hola, {{ nombreUsuario() }}</span>
                <Button
                    type="button"
                    class="border-danger bg-danger text-primary-foreground hover:border-danger hover:bg-danger/90 hover:text-primary-foreground"
                    :disabled="cargando"
                    @click="salir"
                >
                    {{ cargando ? 'Cerrando sesión...' : 'Cerrar sesión' }}
                </Button>
            </template>
        </nav>

        <Alert
            v-if="mensajeExito !== ''"
            :variant="tipoMensaje === 'cierre' ? 'danger' : 'success'"
            class="flex items-start justify-between gap-2"
        >
            <p>{{ mensajeExito }}</p>
            <Button type="button" variant="ghost" @click="ocultarMensajeExito">Cerrar</Button>
        </Alert>

        <Alert v-if="error !== ''" variant="danger">
            <p>{{ error }}</p>
        </Alert>
    </header>
</template>
