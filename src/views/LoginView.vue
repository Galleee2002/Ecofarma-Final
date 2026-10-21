<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import FormularioLogin from '../components/auth/FormularioLogin.vue';

const route = useRoute();
const router = useRouter();
const { cargando, error, iniciarSesion } = useAuth();

async function ingresar(email, password) {
    const ingreso = await iniciarSesion(email, password);
    if (!ingreso) {
        return;
    }

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
        <h1 class="text-2xl font-bold text-primary">Ingresar</h1>
        <FormularioLogin :cargando="cargando" :error="error" @ingresar="ingresar" />
        <p>
            ¿No tenés cuenta?
            <RouterLink :to="{ name: 'registro' }" class="text-primary">Registrate</RouterLink>
        </p>
    </main>
</template>
