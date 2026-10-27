<script setup>
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from '@lucide/vue';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { POR_PAGINA } from '../../composables/usePaginacion';

defineProps({
    total: {
        type: Number,
        required: true,
    },
    pagina: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(['update:pagina']);

function cambiarPagina(valor) {
    emit('update:pagina', valor);
}
</script>

<template>
    <Pagination
        v-slot="{ page }"
        :page="pagina"
        :items-per-page="POR_PAGINA"
        :total="total"
        :sibling-count="1"
        @update:page="cambiarPagina"
    >
        <PaginationContent v-slot="{ items }">
            <PaginationPrevious>
                <ChevronLeftIcon data-icon="inline-start" />
                <span class="hidden sm:block">Anterior</span>
            </PaginationPrevious>

            <template v-for="(item, index) in items" :key="index">
                <PaginationItem
                    v-if="item.type === 'page'"
                    :value="item.value"
                    :is-active="item.value === page"
                >
                    {{ item.value }}
                </PaginationItem>
                <PaginationEllipsis v-else>
                    <MoreHorizontalIcon />
                    <span class="sr-only">Más páginas</span>
                </PaginationEllipsis>
            </template>

            <PaginationNext>
                <span class="hidden sm:block">Siguiente</span>
                <ChevronRightIcon data-icon="inline-end" />
            </PaginationNext>
        </PaginationContent>
    </Pagination>
</template>
