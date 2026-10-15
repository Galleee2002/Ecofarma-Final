import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';

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
        meta: { soloInvitados: true },
    },
    {
        path: '/registro',
        name: 'registro',
        component: () => import('../views/RegistroView.vue'),
        meta: { soloInvitados: true },
    },
    {
        path: '/perfil',
        name: 'perfil',
        component: () => import('../views/PerfilView.vue'),
        meta: { requiereSesion: true },
    },
    {
        path: '/donar',
        name: 'donar',
        component: () => import('../views/DonarView.vue'),
        meta: { requiereSesion: true },
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async function (to) {
    const { sesion, esperarSesionInicial } = useAuth();
    await esperarSesionInicial();

    if (to.meta.requiereSesion && sesion.value === null) {
        return { name: 'login', query: { redirect: to.fullPath } };
    }

    if (to.meta.soloInvitados && sesion.value !== null) {
        return { name: 'catalogo' };
    }
});
