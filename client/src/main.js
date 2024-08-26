import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
// import vue3GoogleLogin from 'vue3-google-login';

const app = createApp(App).use(router);

// const CLIENT_ID = '777312195833-5dspluvlpq2qf1dkto3204apgtgcel16.apps.googleusercontent.com';
// app.use(vue3GoogleLogin, { clientId: CLIENT_ID });

app.mount('#app');
