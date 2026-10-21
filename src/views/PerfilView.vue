<script setup>
import { ref } from 'vue';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../composables/useAuth';
import { usePerfil } from '../composables/usePerfil';
import { useDonaciones } from '../composables/useDonaciones';
import { useSolicitudes } from '../composables/useSolicitudes';
import FormularioPerfil from '../components/perfil/FormularioPerfil.vue';
import ListaMisDonaciones from '../components/perfil/ListaMisDonaciones.vue';
import ListaMisSolicitudes from '../components/perfil/ListaMisSolicitudes.vue';

const { sesion, perfil, errorPerfil } = useAuth();
const { cargando: guardando, error: errorGuardar, mensaje: mensajeGuardar, actualizarDatos } = usePerfil();
const { donaciones, cargando: cargandoDonaciones, cargado: donacionesCargadas, error: errorDonaciones, cargarMisDonaciones } = useDonaciones();
const { solicitudes, cargando: cargandoSolicitudes, cargado: solicitudesCargadas, error: errorSolicitudes, cargarMisSolicitudes } = useSolicitudes();

const pestanaActiva = ref('datos');

function recargarDonaciones() {
    cargarMisDonaciones(sesion.value.user.id);
}

function recargarSolicitudes() {
    cargarMisSolicitudes(sesion.value.user.id);
}

function abrirPestana(pestana) {
    pestanaActiva.value = pestana;

    if (pestana === 'donaciones' && !donacionesCargadas.value) {
        recargarDonaciones();
    }
    if (pestana === 'solicitudes' && !solicitudesCargadas.value) {
        recargarSolicitudes();
    }
}
</script>

<template>
    <main class="pagina">
        <h1 class="text-2xl font-bold text-primary">Mi perfil</h1>

        <Alert v-if="errorPerfil !== ''" variant="danger">
            <p>{{ errorPerfil }}</p>
        </Alert>

        <p v-else-if="perfil === null" class="text-muted">Cargando tus datos...</p>

        <Tabs v-else :model-value="pestanaActiva" class="flex-col gap-4" @update:model-value="abrirPestana">
            <TabsList variant="line" class="w-full">
                <TabsTrigger value="datos">Mis datos</TabsTrigger>
                <TabsTrigger value="donaciones">Mis donaciones</TabsTrigger>
                <TabsTrigger value="solicitudes">Mis solicitudes</TabsTrigger>
            </TabsList>

            <TabsContent value="datos">
                <FormularioPerfil
                    :perfil="perfil"
                    :email="sesion.user.email"
                    :cargando="guardando"
                    :error="errorGuardar"
                    :mensaje="mensajeGuardar"
                    @guardar="actualizarDatos"
                />
            </TabsContent>

            <TabsContent value="donaciones">
                <ListaMisDonaciones
                    :donaciones="donaciones"
                    :cargando="cargandoDonaciones"
                    :error="errorDonaciones"
                    @reintentar="recargarDonaciones"
                />
            </TabsContent>

            <TabsContent value="solicitudes">
                <ListaMisSolicitudes
                    :solicitudes="solicitudes"
                    :cargando="cargandoSolicitudes"
                    :error="errorSolicitudes"
                    @reintentar="recargarSolicitudes"
                />
            </TabsContent>
        </Tabs>
    </main>
</template>
