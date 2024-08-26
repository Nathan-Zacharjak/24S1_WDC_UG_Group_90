<script setup>
import Card from './components/Card.vue';
import BranchProfile from './BranchProfile.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons/faSquarePlus'
import { inject, ref } from 'vue';
import axios from 'axios';

const createBranchForm = ref({
    name: '',
    imgURL: ''
});
const showCreatePost = ref(false)
const imgSrc = ref('');
var file;

function handleURLChange(e) {
    file = e.target.files[0];
    console.log(file.name);
    if (file) {
        imgSrc.value = URL.createObjectURL(file);
    }
}

function uploadImg() {
    var data = new FormData();
    data.append("image", file, file.name);
    data.append("type", "image");
    data.append("title", "Simple upload");
    data.append("description", "This is a simple image upload in Imgur");

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(JSON.parse(this.responseText).data.link);
            createBranchForm.value.imgURL = JSON.parse(this.responseText).data.link;
            axios.post('api/branch/create',createBranchForm.value).then((res) => {
                location.reload(); //reload page
            }, (error) => {
                throw error || new Error(`Request failed`);
            });
        }
    });

    xhr.open("POST", "https://api.imgur.com/3/image");
    xhr.setRequestHeader("Authorization", "Client-ID 888f78980d86816");

    xhr.send(data);
}

const handleSubmit = (e) => {
    uploadImg();
}

const branches = ref([])

function getBranches() {
    axios.get('api/branch').then((res) => {
        branches.value = res.data;
    }, (error) => {
        throw error || new Error(`Request failed`);
    });
}

getBranches();

const AuthLevel = inject('authLevel');
</script>

<template>
    <div class="container">
        <div v-if="AuthLevel === 'admin'" class="add-post-btn" v-on:click="showCreatePost = true">
            <h1>
                <FontAwesomeIcon :icon="faSquarePlus" />
            </h1>
            <p>Create Branch</p>
        </div>
        <div v-if="showCreatePost" class="layover">
            <form action="javascript:void(0);" :onsubmit="handleSubmit" class="create-form">
                <div class="left">
                    <input type="file" v-if="imgSrc == ''" v-on:change="handleURLChange" required>
                    <img :src="imgSrc" alt="img here">
                </div>
                <div class="right">
                    <input v-model="createBranchForm.name" id="" placeholder="Name this branch" required />
                    <button v-on:click="showCreatePost = false">Cancel</button>
                    <button type="submit">Create</button>
                </div>
            </form>
        </div>

        <router-link v-for="branch in branches" :to="'/branch/'+branch.id">
            <Card :BranchId="branch.id" :title="branch.name" :imgURL="branch.imgURL">
            </Card>
        </router-link>
    </div>
</template>

<style>
a {
    all: revert;
    text-decoration: none;
}

.create-form {
    background-color: rgb(38, 38, 38);
    min-height: 800px;
    max-height: 800px;
    width: 1000px;
    display: flex;

    input {
        border: none;
    }

    input:focus {
        outline: none;
    }

    border-radius: 20px;
    padding-right: 20px;
}

.head {
    flex: 1;
    display: flex;
}

.left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 70%;
}

.left>img {
    max-width: 100%;
    max-height: 100%;
    object-fit: scale-down;
}

.right {
    padding-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.right>div {
    display: flex;
    align-items: center;
}

.right>textarea {
    width: 100%;
    resize: none;
    background-color: transparent;
    border: none;
    outline: none;
}
</style>