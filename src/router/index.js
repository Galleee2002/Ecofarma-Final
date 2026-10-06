import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: { name: 'catalogo' },
    },
    {
        path: '/catalogo',
        name: 'catalogo',
        component: () => import('../views/CatalogoView.vue'),
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
