<script setup>
import { CircleUserIcon, ShieldCheckIcon } from '@lucide/vue';
import { ref } from 'vue';
import { toast } from 'vue-sonner';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { useAuth } from '../../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { sesion, perfil, errorPerfil, mensajeExito, tipoMensaje, cargando, error, cerrarSesion, ocultarMensajeExito } = useAuth();

const confirmarSalida = ref(false);
const menuPerfilAbierto = ref(false);

function varianteAviso() {
    if (tipoMensaje.value === 'advertencia') {
        return 'warning';
    }
    return 'success';
}

function nombreBienvenida() {
    if (perfil.value === null || !perfil.value.name) {
        return sesion.value.user.email;
    }

    const partes = perfil.value.name.trim().split(' ');
    const palabras = [];
    for (let i = 0; i < partes.length; i++) {
        if (partes[i] === '') {
            continue;
        }
        const palabra = partes[i];
        palabras.push(palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase());
    }
    return palabras.join(' ');
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
    menuPerfilAbierto.value = false;
    confirmarSalida.value = true;
}

async function salir() {
    const salio = await cerrarSesion();
    if (salio) {
        confirmarSalida.value = false;
        toast.success('Cerraste sesión correctamente.', {
            style: { borderColor: 'var(--color-danger)' },
        });
        router.push({ name: 'catalogo' });
    }
}
</script>

<template>
    <header class="relative z-10 border-b border-primary bg-primary">
        <div class="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4">
            <div class="flex items-center gap-4">
                <div class="flex flex-1 items-center">
                    <RouterLink :to="{ name: 'catalogo' }" aria-label="EcoFARMA" class="flex items-center">
                        <img src="/logo.webp" alt="EcoFARMA" class="h-10 w-auto object-contain" />
                    </RouterLink>
                </div>

                <NavigationMenu class="flex-none" :viewport="false">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink as-child :active="enlaceActivo('catalogo')" class="text-surface hover:bg-surface/10 hover:text-surface data-active:bg-surface/15 data-active:text-surface">
                                <RouterLink :to="{ name: 'catalogo' }">Catálogo</RouterLink>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <template v-if="sesion !== null">
                            <NavigationMenuItem>
                                <NavigationMenuLink as-child :active="enlaceActivo('donar')" class="text-surface hover:bg-surface/10 hover:text-surface data-active:bg-surface/15 data-active:text-surface">
                                    <RouterLink :to="{ name: 'donar' }">Donar</RouterLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink as-child :active="enlaceActivo('perfil')" class="text-surface hover:bg-surface/10 hover:text-surface data-active:bg-surface/15 data-active:text-surface">
                                    <RouterLink :to="{ name: 'perfil' }">Mi perfil</RouterLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </template>
                    </NavigationMenuList>
                </NavigationMenu>

                <div class="flex flex-1 items-center justify-end gap-2">
                    <template v-if="sesion === null">
                        <Button variant="secondary" size="sm" class="bg-surface text-primary hover:bg-surface/90" as-child>
                            <RouterLink :to="{ name: 'login' }">Ingresar</RouterLink>
                        </Button>
                        <Button variant="secondary" size="sm" class="bg-surface text-primary hover:bg-surface/90" as-child>
                            <RouterLink :to="{ name: 'registro' }">Registrarse</RouterLink>
                        </Button>
                    </template>

                    <DropdownMenu v-else v-model:open="menuPerfilAbierto">
                        <DropdownMenuTrigger as-child>
                            <Button
                                variant="secondary"
                                size="icon"
                                class="bg-surface text-primary hover:bg-surface/90"
                                aria-label="Menú de perfil"
                            >
                                <CircleUserIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" class="w-60 p-3">
                            <DropdownMenuLabel class="px-2 py-2 text-sm font-medium text-foreground">
                                Bienvenido/a {{ nombreBienvenida() }}
                            </DropdownMenuLabel>
                            <DropdownMenuGroup v-if="perfil !== null && perfil.rol === 'admin'">
                                <DropdownMenuItem
                                    :class="['px-2 py-2', enlaceActivo('admin-donaciones') ? 'bg-primary-soft text-secondary' : '']"
                                    @click="router.push({ name: 'admin-donaciones' })"
                                >
                                    <ShieldCheckIcon />
                                    Administrador
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator class="my-2" />
                            <Button type="button" variant="destructive" size="sm" class="mt-1 w-full" @click="pedirSalida">
                                Cerrar sesión
                            </Button>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
