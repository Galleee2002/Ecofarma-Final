<script setup>
import { ArrowLeftIcon } from '@lucide/vue';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import FormularioRegistro from '../components/auth/FormularioRegistro.vue';

const router = useRouter();
const { cargando, error, registrarse } = useAuth();

async function registrar(datos) {
    const registrado = await registrarse(datos);
    if (registrado) {
        toast.success('Tu cuenta se creó correctamente. ¡Te damos la bienvenida a EcoFARMA!');
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <main class="pagina min-h-[calc(100dvh-4.5rem)]">
        <RouterLink :to="{ name: 'catalogo' }" class="inline-flex w-fit items-center gap-2 text-primary hover:text-secondary">
            <ArrowLeftIcon class="size-4" aria-hidden="true" />
            Volver al inicio
        </RouterLink>

        <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-6 py-6 sm:py-10">
            <div class="flex flex-col gap-2">
                <h1 class="text-2xl font-bold text-foreground">Crear cuenta</h1>
                <p class="text-muted">Completá tus datos para donar o solicitar medicamentos en EcoFARMA.</p>
            </div>

            <FormularioRegistro :cargando="cargando" :error="error" @registrar="registrar" />

            <p class="text-center text-muted">
                ¿Ya tenés cuenta?
                <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary hover:text-secondary">Ingresá</RouterLink>
            </p>
        </div>
    </main>
</template>
