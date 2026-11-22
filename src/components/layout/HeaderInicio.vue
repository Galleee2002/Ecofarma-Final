<script setup>
import { computed } from 'vue';
import { Bell, Search, User } from '@lucide/vue';
import { useAuth } from '../../composables/useAuth';

const props = defineProps({
    modelValue: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const { perfil } = useAuth();

const nombre = computed(function () {
    if (perfil.value === null || typeof perfil.value.name !== 'string') {
        return '';
    }
    return perfil.value.name.trim();
});

const saludo = computed(function () {
    if (nombre.value === '') {
        return 'Hola';
    }
    return 'Hola ' + nombre.value;
});

const inicial = computed(function () {
    if (nombre.value === '') {
        return '';
    }
    return nombre.value.charAt(0).toUpperCase();
});

function actualizarBusqueda(evento) {
    emit('update:modelValue', evento.target.value);
}
</script>

<template>
    <header class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
            <div
                class="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-icon bg-surface"
                aria-hidden="true"
            >
                <span
                    v-if="inicial !== ''"
                    class="font-heading text-lg font-bold text-primary"
                >
                    {{ inicial }}
                </span>
                <User v-else :size="22" class="text-icon" stroke-width="1.75" />
            </div>

            <div class="min-w-0 flex-1">
                <h1 class="truncate text-balance font-heading text-xl text-foreground">
                    {{ saludo }}
                </h1>
                <p class="text-sm text-muted">Bienvenido/a</p>
            </div>

            <button
                type="button"
                class="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-icon shadow-sm transition duration-150 ease-out hover:bg-primary-soft/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-icon motion-reduce:transition-none"
                aria-label="Notificaciones"
            >
                <Bell :size="20" stroke-width="1.75" aria-hidden="true" />
            </button>
        </div>

        <div class="relative">
            <Search
                :size="18"
                stroke-width="1.75"
                class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
                aria-hidden="true"
            />
            <input
                id="inicio-busqueda"
                type="search"
                :value="modelValue"
                placeholder="Buscar medicamento"
                aria-label="Buscar medicamento"
                class="w-full min-h-11 rounded-full border border-line bg-surface py-2.5 pr-4 pl-10 font-sans text-base text-foreground shadow-sm placeholder:text-muted transition duration-150 ease-out hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                @input="actualizarBusqueda"
            />
        </div>
    </header>
</template>
