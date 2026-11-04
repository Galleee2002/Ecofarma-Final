<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
    fotos: {
        type: Array,
        default: function () {
            return [];
        },
    },
    nombre: {
        type: String,
        default: '',
    },
});

const indiceActivo = ref(0);

watch(
    function () {
        return props.fotos;
    },
    function () {
        indiceActivo.value = 0;
    },
);

const hayFotos = computed(function () {
    return props.fotos.length > 0;
});

const hayVarias = computed(function () {
    return props.fotos.length > 1;
});

const fotoActiva = computed(function () {
    return props.fotos[indiceActivo.value] || props.fotos[0] || '';
});

function elegir(indice) {
    indiceActivo.value = indice;
}

function textoFoto(indice) {
    return 'Foto ' + (indice + 1) + ' de ' + props.nombre;
}
</script>

<template>
    <div class="flex min-w-0 flex-col gap-3">
        <p v-if="!hayFotos" class="text-pretty text-muted">Este medicamento no tiene fotos del envase.</p>
        <template v-else>
            <img
                :key="indiceActivo"
                :src="fotoActiva"
                :alt="textoFoto(indiceActivo)"
                class="aspect-[4/3] w-full rounded-lg object-cover"
                sizes="(min-width: 1024px) 36rem, 100vw"
                :fetchpriority="indiceActivo === 0 ? 'high' : 'auto'"
                :loading="indiceActivo === 0 ? 'eager' : 'lazy'"
            />
            <ul v-if="hayVarias" class="flex list-none gap-2 overflow-x-auto p-1" aria-label="Fotos del envase">
                <li v-for="(foto, indice) in fotos" :key="indice" class="shrink-0">
                    <button
                        type="button"
                        class="size-16 cursor-pointer overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        :class="indice === indiceActivo ? 'border-primary ring-2 ring-primary' : 'border-line'"
                        :aria-pressed="indice === indiceActivo"
                        :aria-label="textoFoto(indice)"
                        @click="elegir(indice)"
                    >
                        <img
                            :src="foto"
                            alt=""
                            class="size-full object-cover"
                            sizes="4rem"
                            loading="lazy"
                        />
                    </button>
                </li>
            </ul>
        </template>
    </div>
</template>
