<script setup>
const pasos = [
    { titulo: 'Mirá lo disponible', texto: 'El catálogo muestra medicamentos disponibles y no vencidos.' },
    { titulo: 'Enviá la solicitud', texto: 'Si requiere receta, adjuntá la foto.' },
    { titulo: 'Coordiná el encuentro', texto: 'Acordá la entrega por el chat. Al recibir, compartí tu código de 6 dígitos para que el donante la confirme.' },
];
</script>

<template>
    <div aria-labelledby="recibir-titulo">
        <h3 id="recibir-titulo" class="text-xl">Cómo recibir</h3>
        <ol class="mt-6 grid list-none gap-6">
            <li v-for="(paso, indice) in pasos" :key="paso.titulo" class="flex gap-4">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-icon/10 font-semibold text-icon">{{ indice + 1 }}</span>
                <div>
                    <h4>{{ paso.titulo }}</h4>
                    <p class="mt-1 text-muted">{{ paso.texto }}</p>
                </div>
            </li>
        </ol>
    </div>
</template>
