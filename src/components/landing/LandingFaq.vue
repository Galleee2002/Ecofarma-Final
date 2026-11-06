<script setup>
import { ref } from 'vue';
import { Minus, Plus } from '@lucide/vue';

const preguntas = [
    {
        id: 'que-es',
        pregunta: '¿Qué es ecofarma?',
        respuesta: 'ecofarma es una plataforma que conecta a personas que desean donar medicamentos en buen estado con quienes los necesitan, promoviendo la solidaridad y el aprovechamiento responsable de los recursos.',
    },
    {
        id: 'donar',
        pregunta: '¿Cómo puedo donar medicamentos?',
        respuesta: 'Ingresá a la sección Donar, buscá el medicamento en el vademécum, completá la información solicitada y publicá tu donación. Si requiere revisión, estará disponible una vez aprobada.',
    },
    {
        id: 'que-donar',
        pregunta: '¿Todos los medicamentos se pueden donar?',
        respuesta: 'Podés publicar medicamentos en buen estado, con los datos del envase, el lote, el vencimiento y las fotos. Si coinciden con el vademécum, la publicación queda disponible. Si no, queda en revisión. ecofarma no inspecciona la unidad física.',
    },
    {
        id: 'solicitar',
        pregunta: '¿Cómo puedo solicitar un medicamento?',
        respuesta: 'Ingresá a la sección Recibir, explorá los medicamentos disponibles y seleccioná el que necesitás. Desde la plataforma podrás iniciar una solicitud y seguir su estado.',
    },
    {
        id: 'seguridad',
        pregunta: '¿Cómo se garantiza la seguridad?',
        respuesta: 'ecofarma contrasta la publicación con el vademécum y, si no coincide, la revisa antes de publicarla. Esa revisión mira la información declarada: no inspecciona el medicamento ni garantiza su calidad, y no reemplaza el asesoramiento de un profesional de la salud.',
    },
    {
        id: 'costo',
        pregunta: '¿Ecofarma tiene algún costo?',
        respuesta: 'ecofarma promueve la donación solidaria de medicamentos. Los medicamentos ofrecidos mediante donaciones no tienen un precio de venta.',
    },
];

const abiertaId = ref(null);

function estaAbierta(id) {
    return abiertaId.value === id;
}

function alternar(id) {
    abiertaId.value = abiertaId.value === id ? null : id;
}
</script>

<template>
    <section id="preguntas" class="scroll-mt-8 bg-surface" aria-labelledby="faq-titulo">
        <div class="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-16 lg:py-20">
            <div class="grid gap-10 md:grid-cols-2 md:items-center md:gap-12 lg:gap-16">
                <div class="relative max-w-md">
                    <h2 id="faq-titulo" class="font-heading text-3xl leading-tight text-balance sm:text-[2.5rem] sm:leading-[1.15]">
                        <span class="text-foreground">¿Tenés dudas?</span>
                        <span class="mt-1 block text-icon">Estamos para ayudarte.</span>
                    </h2>
                    <p class="mt-5 max-w-sm text-pretty text-muted">
                        Conocé mejor nuestra propuesta y cómo buscamos facilitar una donación responsable y segura.
                    </p>
                </div>

                <ul class="list-none">
                    <li
                        v-for="pregunta in preguntas"
                        :key="pregunta.id"
                        class="border-b border-line first:border-t"
                    >
                        <h3>
                            <button
                                :id="`faq-boton-${pregunta.id}`"
                                type="button"
                                class="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 py-5 text-left font-heading text-base font-bold text-foreground transition-colors duration-200 ease-out hover:text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none motion-reduce:transition-none sm:text-lg"
                                :aria-expanded="estaAbierta(pregunta.id)"
                                :aria-controls="`faq-panel-${pregunta.id}`"
                                @click="alternar(pregunta.id)"
                            >
                                <span>{{ pregunta.pregunta }}</span>
                                <Minus
                                    v-if="estaAbierta(pregunta.id)"
                                    class="size-5 shrink-0 text-foreground"
                                    :stroke-width="1.75"
                                    aria-hidden="true"
                                />
                                <Plus
                                    v-else
                                    class="size-5 shrink-0 text-foreground"
                                    :stroke-width="1.75"
                                    aria-hidden="true"
                                />
                            </button>
                        </h3>
                        <div
                            :id="`faq-panel-${pregunta.id}`"
                            role="region"
                            class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                            :class="estaAbierta(pregunta.id) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
                            :aria-labelledby="`faq-boton-${pregunta.id}`"
                            :aria-hidden="!estaAbierta(pregunta.id)"
                            :inert="!estaAbierta(pregunta.id)"
                        >
                            <div class="overflow-hidden">
                                <p class="pb-5 text-muted">{{ pregunta.respuesta }}</p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
