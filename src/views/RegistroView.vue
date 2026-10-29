<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { cargando, error, registrarse, mostrarAviso } = useAuth();

const datos = ref({
    name: '',
    dni: '',
    telefono: '',
    direccion: '',
    localidad: '',
    email: '',
    password: '',
    aceptoDdjj: false,
});

async function registrar() {
    const registrado = await registrarse(datos.value);
    if (registrado) {
        mostrarAviso('Tu cuenta se creó correctamente. ¡Te damos la bienvenida a EcoFARMA!', 'exito');
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <main class="pagina-media">
        <RouterLink :to="{ name: 'catalogo' }" class="text-primary">Volver al catálogo</RouterLink>
        <h1 class="text-primary">Crear cuenta</h1>
        <p class="text-muted">Completá tus datos para donar o solicitar medicamentos en EcoFARMA.</p>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="registrar">
            <div class="flex flex-col gap-1">
                <label for="registro-nombre">Nombre y apellido</label>
                <input id="registro-nombre" v-model="datos.name" type="text" autocomplete="name" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="registro-dni">DNI</label>
                <input id="registro-dni" v-model="datos.dni" type="text" inputmode="numeric" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="registro-telefono">Teléfono</label>
                <input id="registro-telefono" v-model="datos.telefono" type="tel" autocomplete="tel" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="registro-direccion">Dirección</label>
                <input id="registro-direccion" v-model="datos.direccion" type="text" autocomplete="street-address" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="registro-localidad">Localidad</label>
                <input id="registro-localidad" v-model="datos.localidad" type="text" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="registro-email">Email</label>
                <input id="registro-email" v-model="datos.email" type="email" autocomplete="email" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex flex-col gap-1">
                <label for="registro-password">Contraseña</label>
                <input id="registro-password" v-model="datos.password" type="password" autocomplete="new-password" class="border border-line bg-surface px-3 py-2" />
            </div>
            <div class="flex items-start gap-2">
                <input id="registro-ddjj" v-model="datos.aceptoDdjj" type="checkbox" class="mt-1" />
                <label for="registro-ddjj">Acepto los Términos y Condiciones y la Declaración Jurada de EcoFARMA.</label>
            </div>
            <p v-if="error !== ''" class="border border-danger bg-danger/10 p-3 text-danger">{{ error }}</p>
            <button type="submit" class="bg-primary px-4 py-2 text-surface" :disabled="cargando">
                {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
        </form>

        <p class="text-muted">
            ¿Ya tenés cuenta?
            <RouterLink :to="{ name: 'login' }" class="text-primary">Ingresá</RouterLink>
        </p>
    </main>
</template>
