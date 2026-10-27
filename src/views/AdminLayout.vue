<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { BookOpenIcon, ClipboardListIcon, MenuIcon, UsersIcon } from '@lucide/vue';
import { Button } from '@/components/ui/button';

const route = useRoute();
const menuAbierto = ref(false);

function seccionActiva(nombre) {
    return route.name === nombre;
}

function cerrarMenu() {
    menuAbierto.value = false;
}

function claseSeccion(nombre) {
    if (seccionActiva(nombre)) {
        return 'bg-primary-soft font-semibold text-primary';
    }
    return 'text-foreground hover:bg-primary-soft/60';
}
</script>

<template>
    <div class="bg-background md:flex md:min-h-[calc(100dvh-6rem)] md:items-stretch">
        <aside
            id="menu-admin"
            class="border-line bg-surface md:w-56 md:shrink-0 md:border-r md:px-3 md:py-6"
            :class="menuAbierto ? 'block border-b px-3 py-4' : 'hidden md:block'"
        >
            <p class="px-3 pb-3 font-heading text-sm text-muted">Administración</p>
            <nav class="flex flex-col gap-1" aria-label="Secciones de administración">
                <RouterLink
                    :to="{ name: 'admin-donaciones' }"
                    class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 motion-reduce:transition-none"
                    :class="claseSeccion('admin-donaciones')"
                    @click="cerrarMenu"
                >
                    <ClipboardListIcon class="size-4" />
                    Donaciones
                </RouterLink>
                <RouterLink
                    :to="{ name: 'admin-vademecum' }"
                    class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 motion-reduce:transition-none"
                    :class="claseSeccion('admin-vademecum')"
                    @click="cerrarMenu"
                >
                    <BookOpenIcon class="size-4" />
                    Vademécum
                </RouterLink>
                <RouterLink
                    :to="{ name: 'admin-usuarios' }"
                    class="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-150 motion-reduce:transition-none"
                    :class="claseSeccion('admin-usuarios')"
                    @click="cerrarMenu"
                >
                    <UsersIcon class="size-4" />
                    Usuarios
                </RouterLink>
            </nav>
        </aside>

        <div class="min-w-0 flex-1">
            <div class="border-b border-line bg-surface px-4 py-3 md:hidden">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    :aria-expanded="menuAbierto"
                    aria-controls="menu-admin"
                    @click="menuAbierto = !menuAbierto"
                >
                    <MenuIcon />
                    Secciones
                </Button>
            </div>

            <div class="p-6">
                <RouterView v-slot="{ Component }">
                    <Transition
                        mode="out-in"
                        enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
                        enter-from-class="translate-y-1 opacity-0 motion-reduce:translate-y-0"
                        enter-to-class="translate-y-0 opacity-100"
                        leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <component :is="Component" v-if="Component" :key="route.name" />
                    </Transition>
                </RouterView>
            </div>
        </div>
    </div>
</template>
