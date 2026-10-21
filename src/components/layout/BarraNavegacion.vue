<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useAuth } from '../../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { sesion, perfil, errorPerfil, mensajeExito, tipoMensaje, cargando, error, cerrarSesion, ocultarMensajeExito } = useAuth();

const confirmarSalida = ref(false);

function varianteAviso() {
    if (tipoMensaje.value === 'cierre') {
        return 'danger';
    }
    if (tipoMensaje.value === 'advertencia') {
        return 'warning';
    }
    return 'success';
}

function nombreUsuario() {
    if (perfil.value !== null && perfil.value.name) {
        return perfil.value.name;
    }
    return sesion.value.user.email;
}

function enlaceActivo(nombre) {
    if (route.name === nombre) {
        return true;
    }
    if (nombre === 'catalogo' && route.name === 'medicamento-detalle') {
        return true;
    }
    if (nombre === 'admin-donaciones' && (route.name === 'admin-vademecum' || route.name === 'admin-usuarios')) {
        return true;
    }
    return false;
}

function pedirSalida() {
    confirmarSalida.value = true;
}

async function salir() {
    const salio = await cerrarSesion();
    if (salio) {
        confirmarSalida.value = false;
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <header class="border-b border-primary-soft bg-background">
        <div class="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4">
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex flex-wrap items-center gap-2">
                    <RouterLink :to="{ name: 'catalogo' }" class="font-heading text-lg font-semibold text-primary">
                        EcoFARMA
                    </RouterLink>

                    <NavigationMenu class="flex-none">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink as-child :active="enlaceActivo('catalogo')">
                                    <RouterLink :to="{ name: 'catalogo' }">Catálogo</RouterLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <template v-if="sesion !== null">
                                <NavigationMenuItem>
                                    <NavigationMenuLink as-child :active="enlaceActivo('donar')">
                                        <RouterLink :to="{ name: 'donar' }">Donar</RouterLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuLink as-child :active="enlaceActivo('perfil')">
                                        <RouterLink :to="{ name: 'perfil' }">Mi perfil</RouterLink>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                                <NavigationMenuItem v-if="perfil !== null && perfil.rol === 'admin'">
                                    <NavigationMenuTrigger
                                        :class="enlaceActivo('admin-donaciones') ? 'bg-primary-soft text-secondary' : ''"
                                    >
                                        Moderación
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul class="flex w-52 flex-col gap-1 p-2">
                                            <li>
                                                <NavigationMenuLink as-child :active="route.name === 'admin-donaciones'">
                                                    <RouterLink :to="{ name: 'admin-donaciones' }">Donaciones</RouterLink>
                                                </NavigationMenuLink>
                                            </li>
                                            <li>
                                                <NavigationMenuLink as-child :active="route.name === 'admin-vademecum'">
                                                    <RouterLink :to="{ name: 'admin-vademecum' }">Vademécum</RouterLink>
                                                </NavigationMenuLink>
                                            </li>
                                            <li>
                                                <NavigationMenuLink as-child :active="route.name === 'admin-usuarios'">
                                                    <RouterLink :to="{ name: 'admin-usuarios' }">Usuarios</RouterLink>
                                                </NavigationMenuLink>
                                            </li>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </template>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div class="ml-auto flex flex-wrap items-center gap-2">
                    <template v-if="sesion === null">
                        <Button variant="outline" size="sm" as-child>
                            <RouterLink :to="{ name: 'login' }">Ingresar</RouterLink>
                        </Button>
                        <Button size="sm" as-child>
                            <RouterLink :to="{ name: 'registro' }">Registrarse</RouterLink>
                        </Button>
                    </template>

                    <template v-else>
                        <span class="text-sm text-icon">Hola, {{ nombreUsuario() }}</span>
                        <Button type="button" variant="destructive" size="sm" @click="pedirSalida">
                            Cerrar sesión
                        </Button>
                    </template>
                </div>
            </div>

            <Alert
                v-if="mensajeExito !== ''"
                :variant="varianteAviso()"
                class="flex items-start justify-between gap-2"
            >
                <p>{{ mensajeExito }}</p>
                <Button type="button" variant="ghost" @click="ocultarMensajeExito">Cerrar</Button>
            </Alert>

            <Alert v-if="errorPerfil !== ''" variant="danger">
                <p>{{ errorPerfil }}</p>
            </Alert>

            <Alert v-if="error !== ''" variant="danger">
                <p>{{ error }}</p>
            </Alert>
        </div>
    </header>

    <Dialog v-model:open="confirmarSalida">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Cerrar sesión</DialogTitle>
                <DialogDescription>Vas a salir de EcoFARMA en este dispositivo.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button type="button" variant="outline" :disabled="cargando" @click="confirmarSalida = false">
                    Cancelar
                </Button>
                <Button type="button" variant="destructive" :cargando="cargando" @click="salir">
                    Cerrar sesión
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
