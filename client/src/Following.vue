<script setup>
import Post from './components/Post.vue'
import { ref, inject } from 'vue';

const posts = () => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            return this.responseText;
        }
    };
    xhttp.open("GET", "api/posts/following?id=...", true);
    xhttp.send();
}

const authLevel  = inject('authLevel');

</script>

<template>
    <h3 v-if="!authLevel"><RouterLink to="/login">Log In</RouterLink> to see the branches you're following</h3>
    <Post v-else v-for="post in posts" :data=post></Post>
</template>

<style></style>