<script setup>
const pasos = [
    { titulo: 'Elegí el medicamento', texto: 'Ingresá y buscalo en el vademécum.' },
    { titulo: 'Subí la foto del envase', texto: 'La foto acompaña la publicación.' },
    { titulo: 'Publicá la donación', texto: 'Si hace falta revisión, queda pendiente hasta que se apruebe.' },
];
</script>

<template>
    <div aria-labelledby="donar-titulo">
        <h3 id="donar-titulo" class="text-xl">Cómo donar</h3>
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
