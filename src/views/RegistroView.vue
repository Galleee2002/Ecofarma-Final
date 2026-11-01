<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseAlert from '../components/ui/BaseAlert.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseCheckbox from '../components/ui/BaseCheckbox.vue';
import BaseInput from '../components/ui/BaseInput.vue';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { cargando, error, registrarse, mostrarAviso } = useAuth();

const paso = ref(1);
const direccionPaso = ref('adelante');
const passwordConfirmacion = ref('');

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

const textoBoton = computed(function () {
    if (paso.value !== 3) {
        return 'Siguiente';
    }
    if (cargando.value) {
        return 'Creando cuenta...';
    }
    return 'Crear cuenta';
});

const nombreTransicion = computed(function () {
    if (direccionPaso.value === 'atras') {
        return 'paso-atras';
    }
    return 'paso-adelante';
});

function mensajeNativo(evento) {
    const campo = evento.target;
    if (campo.validity.customError) {
        return;
    }
    if (campo.validity.valueMissing) {
        campo.setCustomValidity('Completá este campo.');
        return;
    }
    if (campo.validity.typeMismatch) {
        campo.setCustomValidity('Ingresá un email válido.');
        return;
    }
    if (campo.validity.tooShort) {
        campo.setCustomValidity('La contraseña debe tener al menos 6 caracteres.');
    }
}

function sincronizarConfirmacion() {
    const input = document.getElementById('registro-password-confirmacion');
    if (input === null) {
        return;
    }
    if (passwordConfirmacion.value !== '' && passwordConfirmacion.value !== datos.value.password) {
        input.setCustomValidity('Las contraseñas no coinciden.');
        return;
    }
    input.setCustomValidity('');
}

watch(
    [passwordConfirmacion, function () {
        return datos.value.password;
    }],
    function () {
        sincronizarConfirmacion();
    },
);

function continuar() {
    error.value = '';
    direccionPaso.value = 'adelante';
    paso.value += 1;
    if (paso.value === 3) {
        nextTick(sincronizarConfirmacion);
    }
}

function atras() {
    error.value = '';
    if (paso.value > 1) {
        direccionPaso.value = 'atras';
        paso.value -= 1;
    }
}

async function registrar() {
    const registrado = await registrarse(datos.value);
    if (registrado) {
        mostrarAviso('Tu cuenta se creó correctamente. ¡Te damos la bienvenida a ecofarma!', 'exito');
        router.push({ name: 'catalogo' });
    }
}

async function enviar() {
    error.value = '';
    if (paso.value < 3) {
        continuar();
        return;
    }
    await registrar();
}
</script>

<template>
    <main class="fondo-trama flex min-h-[calc(100dvh-5rem)] items-start justify-center px-4 py-6 sm:items-center sm:py-10">
        <div class="flex w-full max-w-md flex-col gap-4">
            <RouterLink :to="{ name: 'catalogo' }" class="w-fit text-primary">Volver al catálogo</RouterLink>
            <BaseCard variant="surface" padding="lg" class="w-full rounded-md shadow-md">
                <div class="flex flex-col gap-4">
                    <h1 class="text-primary">Crear cuenta</h1>
                    <p class="text-muted">Completá tus datos para donar o solicitar medicamentos en ecofarma.</p>
                    <Transition name="paso-fade" mode="out-in">
                        <p :key="paso" class="text-sm text-muted">Paso {{ paso }} de 3</p>
                    </Transition>

                    <form class="flex flex-col gap-4" @submit.prevent="enviar" @invalid.capture="mensajeNativo">
                        <div class="-mx-2 -my-1 overflow-hidden px-2 py-1">
                        <Transition :name="nombreTransicion" mode="out-in">
                            <div :key="paso" class="flex flex-col gap-4">
                                <template v-if="paso === 1">
                                    <BaseInput
                                        id="registro-nombre"
                                        v-model="datos.name"
                                        label="Nombre y apellido"
                                        type="text"
                                        autocomplete="name"
                                        required
                                    />
                                    <BaseInput
                                        id="registro-dni"
                                        v-model="datos.dni"
                                        label="DNI"
                                        type="text"
                                        inputmode="numeric"
                                        required
                                    />
                                    <BaseInput
                                        id="registro-telefono"
                                        v-model="datos.telefono"
                                        label="Teléfono"
                                        type="tel"
                                        autocomplete="tel"
                                        required
                                    />
                                </template>

                                <template v-else-if="paso === 2">
                                    <BaseInput
                                        id="registro-direccion"
                                        v-model="datos.direccion"
                                        label="Dirección"
                                        type="text"
                                        autocomplete="street-address"
                                        required
                                    />
                                    <BaseInput
                                        id="registro-localidad"
                                        v-model="datos.localidad"
                                        label="Localidad"
                                        type="text"
                                        required
                                    />
                                    <BaseInput
                                        id="registro-email"
                                        v-model="datos.email"
                                        label="Email"
                                        type="email"
                                        autocomplete="email"
                                        required
                                    />
                                </template>

                                <template v-else>
                                    <BaseInput
                                        id="registro-password"
                                        v-model="datos.password"
                                        label="Contraseña"
                                        type="password"
                                        autocomplete="new-password"
                                        minlength="6"
                                        required
                                    />
                                    <BaseInput
                                        id="registro-password-confirmacion"
                                        v-model="passwordConfirmacion"
                                        label="Confirmar contraseña"
                                        type="password"
                                        autocomplete="new-password"
                                        required
                                    />
                                    <BaseCheckbox
                                        id="registro-ddjj"
                                        v-model="datos.aceptoDdjj"
                                        label="Acepto los Términos y Condiciones y la Declaración Jurada de ecofarma."
                                        required
                                    />
                                </template>
                            </div>
                        </Transition>
                        </div>

                        <BaseAlert v-if="error !== ''" variant="error" :message="error" />

                        <BaseButton v-if="paso === 1" type="submit" variant="primary" class="w-full">
                            Siguiente
                        </BaseButton>
                        <div v-else class="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                            <BaseButton
                                type="submit"
                                variant="primary"
                                class="w-full min-w-0 sm:order-2"
                                :loading="paso === 3 && cargando"
                            >
                                {{ textoBoton }}
                            </BaseButton>
                            <BaseButton type="button" variant="outline" class="w-full min-w-0 sm:order-1" @click="atras">
                                Atrás
                            </BaseButton>
                        </div>
                    </form>

                    <Transition name="paso-fade">
                        <p v-if="paso === 1" class="text-muted">
                            ¿Ya tenés cuenta?
                            <RouterLink :to="{ name: 'login' }" class="text-primary">Ingresá</RouterLink>
                        </p>
                    </Transition>
                </div>
            </BaseCard>
        </div>
    </main>
</template>

<style scoped>
.paso-adelante-enter-active,
.paso-atras-enter-active {
    transition: opacity 280ms ease-out, transform 280ms ease-out;
}

.paso-adelante-leave-active,
.paso-atras-leave-active {
    transition: opacity 180ms ease-in, transform 180ms ease-in;
}

.paso-adelante-enter-from,
.paso-atras-leave-to {
    transform: translateX(1.25rem);
    opacity: 0;
}

.paso-adelante-leave-to,
.paso-atras-enter-from {
    transform: translateX(-1.25rem);
    opacity: 0;
}

.paso-fade-enter-active,
.paso-fade-leave-active {
    transition: opacity 180ms ease-out;
}

.paso-fade-enter-from,
.paso-fade-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .paso-adelante-enter-active,
    .paso-adelante-leave-active,
    .paso-atras-enter-active,
    .paso-atras-leave-active,
    .paso-fade-enter-active,
    .paso-fade-leave-active {
        transition: none;
    }
}
</style>
