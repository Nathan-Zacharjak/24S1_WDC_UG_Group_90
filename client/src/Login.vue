<script setup>
import { ref } from 'vue';
import axios from 'axios';

const loginForm = ref({ username: '', password: '', warningText: '', warningShow: false });

function Login() {
    loginForm.value.warningShow = false;

    if (loginForm.value.username === '' || loginForm.value.password === '') {
        return;
    }

    axios.post('/api/login', loginForm.value).then(function (response) {
        if (response.status !== 200) {
            return;
        } else if (response.data === "success") {
            window.location = "/"
        } else if (response.data !== "success") {
            loginForm.value.warningText = response.data;
            loginForm.value.warningShow = true;
        }
    }, function (error) {
        throw error || new Error(`Login Request failed`);
    })
}

const loginCheck = ref({ loggedIn: false });

axios.get("/api/users/logincheck").then(function (response) {
    if (response.status === 200 && response.data !== "login failure") {
        loginCheck.value.loggedIn = true;
    } else {
        loginCheck.value.loggedIn = false;
    }
})
</script>

<template>
    <h3 v-if="loginCheck.loggedIn">
        <RouterLink to="/logout">Log Out</RouterLink> to sign into a new account
    </h3>
    <div v-else class="wrapper">
        <form action="javascript:void(0);">
            <h1>Login</h1>
            <p class="warningText" v-if="loginForm.warningShow">{{ loginForm.warningText }}</p>
            <input placeholder="Username" v-model="loginForm.username" required>
            <input type="password" placeholder="Password" v-model="loginForm.password" required>
            <button type="submit" v-on:click="Login()">Login</button>
            <p>
                Don't have an account?
                <RouterLink to="/signup">Signup</RouterLink>
            </p>
        </form>
    </div>
</template>

<style>
.wrapper {
    margin: auto;
}

.wrapper>form {
    display: flex;
    flex-direction: column;
    gap: 30px;
}
</style>