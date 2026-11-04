<script setup>
import { ShieldCheck, UsersRound, LockKeyhole } from '@lucide/vue';

const mensajes = [
    { titulo: 'Medicamentos en buen estado', icono: ShieldCheck },
    { titulo: 'Conexión responsable', icono: UsersRound },
    { titulo: 'Coordinación segura', icono: LockKeyhole },
];
</script>

<template>
    <section class="relative isolate overflow-hidden bg-icon/5" aria-labelledby="confianza-titulo">
        <div class="pointer-events-none absolute -top-14 -left-[10%] -z-10 h-20 w-[120%] rounded-[50%] bg-surface" aria-hidden="true"></div>
        <div class="mx-auto grid max-w-7xl gap-7 px-5 py-12 sm:px-8 md:grid-cols-[1fr_2fr] md:items-center md:gap-10">
            <h2 id="confianza-titulo" class="max-w-xs">Un intercambio seguro y responsable</h2>
            <ul class="grid list-none gap-5 sm:grid-cols-3 md:border-l md:border-line md:pl-10">
                <li v-for="mensaje in mensajes" :key="mensaje.titulo" class="flex items-center gap-3 sm:flex-col sm:items-start">
                    <component :is="mensaje.icono" :size="30" :stroke-width="1.5" class="shrink-0 text-icon" aria-hidden="true" />
                    <p class="max-w-36">{{ mensaje.titulo }}</p>
                </li>
            </ul>
        </div>
    </section>
</template>
