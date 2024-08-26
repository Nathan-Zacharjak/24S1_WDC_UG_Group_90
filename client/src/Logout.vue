<script setup>
import { ref } from 'vue';
import axios from 'axios';

function Logout() {
    axios.get("/api/users/logout").then(function(response){
        if (response.status === 200) {
            window.location = "/";
        }
    });
}

const loginCheck = ref({loggedIn: false});

axios.get("/api/users/logincheck").then(function (response) {
  if (response.status === 200 && response.data !== "login failure") {
    loginCheck.value.loggedIn = true;
  } else {
    loginCheck.value.loggedIn = false;
  }
})
</script>

<template>
    <h3 v-if="!loginCheck.loggedIn"><RouterLink to="/login">Click Here</RouterLink> to log in again</h3>
    <div v-else>
        <main class="main">
            <h3>Are you sure you want to log out?</h3>
            <button v-on:click="Logout()">Log Out</button>
        </main>
    </div>
</template>

<style>
@font-face {
    font-family: "ColfaxAI";
    src: url(https://cdn.openai.com/API/fonts/ColfaxAIRegular.woff2) format("woff2"),
        url(https://cdn.openai.com/API/fonts/ColfaxAIRegular.woff) format("woff");
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: "ColfaxAI";
    src: url(https://cdn.openai.com/API/fonts/ColfaxAIBold.woff2) format("woff2"),
        url(https://cdn.openai.com/API/fonts/ColfaxAIBold.woff) format("woff");
    font-weight: bold;
    font-style: normal;
}

.main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 60px;
}

.main h3 {
    font-size: 32px;
    line-height: 40px;
    font-weight: bold;
    color: white;
    margin: 16px 0 40px;
}

.main ::placeholder {
    color: #8e8ea0;
    opacity: 1;
}
</style>