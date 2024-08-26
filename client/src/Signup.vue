<script setup>
import { ref } from 'vue';
import axios from 'axios';

const signupForm = ref({ username: '', email: '', password: '', repeatPassword: '', warningText: '', warningShow: false });

function Signup() {
    signupForm.value.warningShow = false;

    if (signupForm.value.username === '' || signupForm.value.email === '' || signupForm.value.password === '' || signupForm.value.repeatPassword === '') {
        return;
    } else if (signupForm.value.password !== signupForm.value.repeatPassword) {
        signupForm.value.warningText = "Password fields don't match!";
        signupForm.value.warningShow = true;
        return;
    }

    axios.post('/api/signup', signupForm.value).then(function (response) {
        if (response.status !== 200) {
            return;
        } else if (response.data === "success") {
            window.location = "/login"
        } else if (response.data !== "success") {
            signupForm.value.warningText = response.data;
            signupForm.value.warningShow = true;
        }
    }, function (error) {
        throw error || new Error(`Signup request failed`);
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
        <RouterLink to="/logout">Log Out</RouterLink> to create a new account
    </h3>
    <div v-else class="wrapper">
        <form action="javascript:void(0);">
            <h1>Sign Up</h1>
            <p class="warningText" v-if="signupForm.warningShow">{{ signupForm.warningText }}</p>
            <input type="text" placeholder="Username" v-model="signupForm.username" required>
            <input type="text" placeholder="Email" v-model="signupForm.email" required>
            <input type="password" placeholder="Password" v-model="signupForm.password" required>
            <input type="password" placeholder="Repeat Password" v-model="signupForm.repeatPassword" required>
            <button type="submit" v-on:click="Signup">Sign Up</button>
            <p>Have an account? <RouterLink to="/login">Log In</RouterLink>
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

.warningText {
    color: red;
}
</style>