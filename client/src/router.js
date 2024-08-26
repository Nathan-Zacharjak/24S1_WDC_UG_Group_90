import { createRouter, createWebHistory } from 'vue-router';
import Home from './Home.vue';
import Profile from './UserProfile.vue';
import Following from './Following.vue';
import Branches from './Branches.vue';
import Login from './Login.vue';
import Signup from './Signup.vue';
import Logout from './Logout.vue';
import BranchProfile from './BranchProfile.vue';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: Home },
        { path: '/following', component: Following },
        { path: '/profile', component: Profile },
        { path: '/branches', component: Branches },
        { path: '/branch/:branchID', component: BranchProfile, props: true },
        { path: '/users/:id', component: Profile, props: true },
        { path: '/login', component: Login },
        { path: '/signup', component: Signup },
        { path: '/logout', component: Logout }
    ],
});