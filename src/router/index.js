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
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue'),
    },
    {
        path: '/registro',
        name: 'registro',
        component: () => import('../views/RegistroView.vue'),
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
