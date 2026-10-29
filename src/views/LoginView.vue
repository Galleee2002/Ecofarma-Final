<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { cargando, error, iniciarSesion, mostrarAviso } = useAuth();

const email = ref('');
const password = ref('');

async function ingresar() {
    const ingreso = await iniciarSesion(email.value, password.value);
    if (!ingreso) {
        return;
    }

    mostrarAviso('Iniciaste sesión correctamente.', 'exito');

    const destino = route.query.redirect;
    if (typeof destino === 'string' && destino.startsWith('/')) {
        router.push(destino);
    } else {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <main class="pagina-formulario">
        <RouterLink :to="{ name: 'catalogo' }" class="text-primary">Volver al catálogo</RouterLink>
        <h1 class="text-primary">Iniciá sesión</h1>
        <p class="text-muted">Accedé a tu cuenta para donar o solicitar medicamentos.</p>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="ingresar">
            <div class="flex flex-col gap-1">
                <label for="login-email">Correo electrónico</label>
                <input id="login-email" v-model="email" type="email" autocomplete="email" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="login-password">Contraseña</label>
                <input id="login-password" v-model="password" type="password" autocomplete="current-password" class="border border-line bg-surface px-3 py-2" />
            </div>
            <p v-if="error !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ error }}</p>
            <button type="submit" class="bg-primary px-4 py-2 text-surface" :disabled="cargando">
                {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
            </button>
        </form>

        <p class="text-muted">
            ¿Primera vez en EcoFARMA?
            <RouterLink :to="{ name: 'registro' }" class="text-primary">Creá tu cuenta</RouterLink>
        </p>
    </main>
</template>
