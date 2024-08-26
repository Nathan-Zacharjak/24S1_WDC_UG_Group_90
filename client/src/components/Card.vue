<script setup>
defineProps({
    BranchId: Number,
    title: String,
    imgURL: {
        type: String,
        default() {
            return '../assets/matto.webp'
        }
    }
})
</script>

<template>
    <div class="card" referrerpolicy="no-referrer">
        <img :src="imgURL" alt="">
        <p>{{ title }}</p>
    </div>
</template>

<style>
.card {
    height: 200px;
    background-size: cover;
    display: flex;
    flex-direction: column-reverse;
    border-radius: 25px;
    position: relative;
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1));
}

.card>img {
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
    border-radius: 25px;
    object-fit: cover;
}

.card>p {
    z-index: 1;
    padding-bottom: 20px;
    padding-left: 20px;
    font-size: 20px;
}
</style>