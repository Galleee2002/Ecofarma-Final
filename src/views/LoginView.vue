<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import FormularioLogin from '../components/auth/FormularioLogin.vue';

const router = useRouter();
const { cargando, error, iniciarSesion } = useAuth();

async function ingresar(email, password) {
    const ingreso = await iniciarSesion(email, password);
    if (ingreso) {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <main class="mx-auto flex max-w-md flex-col gap-4 p-6">
        <h1 class="text-2xl text-primary">Ingresar</h1>
        <FormularioLogin :cargando="cargando" :error="error" @ingresar="ingresar" />
        <p>
            ¿No tenés cuenta?
            <RouterLink :to="{ name: 'registro' }" class="text-primary">Registrate</RouterLink>
        </p>
    </main>
</template>
