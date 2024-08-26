<script setup>
import { ref } from 'vue';
import Post from './components/Post.vue'

var posts = ref([]);

function getPost() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            posts.value = JSON.parse(this.responseText);
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open("GET", "api/posts", true);
    xhttp.send();
}

getPost();

</script>

<template>
    <Post v-for="post in posts" :data=post></Post>
</template>

<style></style>