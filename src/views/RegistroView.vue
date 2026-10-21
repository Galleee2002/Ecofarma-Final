<script setup>
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import FormularioRegistro from '../components/auth/FormularioRegistro.vue';

const router = useRouter();
const { cargando, error, registrarse } = useAuth();

async function registrar(datos) {
    const registrado = await registrarse(datos);
    if (registrado) {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <main class="pagina-formulario">
        <h1 class="text-2xl font-bold text-primary">Crear cuenta</h1>
        <FormularioRegistro :cargando="cargando" :error="error" @registrar="registrar" />
        <p>
            ¿Ya tenés cuenta?
            <RouterLink :to="{ name: 'login' }" class="text-primary">Ingresá</RouterLink>
        </p>
    </main>
</template>
