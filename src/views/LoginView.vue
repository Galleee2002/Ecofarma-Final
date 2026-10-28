<script setup>
import { ArrowLeftIcon } from '@lucide/vue';
import { toast } from 'vue-sonner';
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

    toast.success('Iniciaste sesión correctamente.');

    const destino = route.query.redirect;
    if (typeof destino === 'string' && destino.startsWith('/')) {
        router.push(destino);
    } else {
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <main class="pagina min-h-[calc(100dvh-4.5rem)]">
        <RouterLink :to="{ name: 'catalogo' }" class="inline-flex w-fit items-center gap-2 text-primary hover:text-secondary">
            <ArrowLeftIcon class="size-4" />
            Volver al inicio
        </RouterLink>

        <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 py-6 sm:py-10">
            <div class="flex flex-col gap-2">
                <h1 class="text-2xl font-bold text-foreground">Iniciá sesión</h1>
                <p class="text-muted">Accedé a tu cuenta para donar o solicitar medicamentos.</p>
            </div>

            <FormularioLogin :cargando="cargando" :error="error" @ingresar="ingresar" />

            <p class="text-center text-muted">
                ¿Primera vez en EcoFARMA?
                <RouterLink :to="{ name: 'registro' }" class="font-semibold text-primary hover:text-secondary">Creá tu cuenta</RouterLink>
            </p>

            <RouterLink :to="{ name: 'catalogo' }" class="text-center text-primary hover:text-secondary">
                Explorar el catálogo sin iniciar sesión
            </RouterLink>
        </div>
    </main>
</template>
