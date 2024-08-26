<script setup>
import { ref, inject, watchEffect } from 'vue';
import Post from './components/Post.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons/faSquarePlus'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot'
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar'
import axios from 'axios';


const props = defineProps({branchID: {
    type: String,
    default: ''
}})

const branchData = ref({name:'', imgURL:''});
axios.get(`/api/branch/branchID?r=${props.branchID}`).then((res) => {
    console.log(res.data[0]);
    branchData.value = res.data[0];
})

const showCreatePost = ref(false);
const showUsersPage = ref(false);
const showPostsPage = ref(true);
const imgSrc = ref('');
var file;
function handleURLChange(e) {
    file = e.target.files[0];
    console.log(file);
    if (file) {
        imgSrc.value = URL.createObjectURL(file);
    }
}

const form = ref({imgURL:'' ,description:'', publicity:'public', date:'', location:'', author_id: props.branchID})

const createPost = () => {
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
            form.value.imgURL = JSON.parse(this.responseText).data.link;

            // this is for creating an event, the rest in 'createPost' func is only for uploading img to imgur
            axios.post('/api/posts/create', form.value).then((response) => {
                showCreatePost.value = false;
                showPosts();
            }, (error)=>{
                //reload page
            })
        }
    });

    xhr.open("POST", "https://api.imgur.com/3/image");
    xhr.setRequestHeader("Authorization", "Client-ID 888f78980d86816");

    xhr.send(data);

}

// get list of followers
const userList = ref([]);

function getUsers(){axios.get(`/api/branch/members?BID=${props.branchID}`).then((response)=>{userList.value = response.data}, (error) => {throw error || new Error(`Request failed`);});
}

getUsers();
//

//check of curent user is a manager of this branch
const isManager = ref(false);

axios.get(`/api/branch/isManager?BID=${props.branchID}`).then((response)=>{isManager.value = response.data.res}, (error) => {throw error || new Error(`Request failed`);})
//

// get posts from this branch
const posts = ref([]);

function showPosts() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            posts.value = JSON.parse(this.responseText);
        }
    };
    xhttp.open("GET", `/api/posts/branch?id=${props.branchID}`, true);
    xhttp.send();
    return true;
}

showPosts();

//change user's following status
const handleFollowStatus = (e) => {
    if (e.target.value === 'email') {
            axios.post(`/api/branch/followAction?BID=${props.branchID}&followStatus=1`);
    } else if (e.target.value === 'follow') {
        axios.post(`/api/branch/followAction?BID=${props.branchID}&followStatus=0`);
    }
    else axios.post(`/api/branch/unfollow?BID=${props.branchID}`);
}

//delete branch
const deleteBranch = () => {
    axios.post(`/api/branch/delete?id=${props.branchID}`).then((res) => {
        if (res.status == 200)
        window.location.replace('/branches');
}, (err) => {
    throw err || new Error(`Request failed`);
});
}

const AuthLevel = inject('authLevel');
const followStatus = ref('');

if (AuthLevel.value) {
    axios.get(`/api/branch/followStatus?BID=${props.branchID}`).then(response => {
        switch (response.data.notifications) {
            case -1:
                followStatus.value = 'unfollow';
                break;
            case 0:
                followStatus.value = 'follow';
                break;
            case 1:
                followStatus.value = 'email';
                break;
            default:
                break;
        }
    });
}

//assign and remove manager
const handleAssigningManager = (id) => {
    axios.post(`/api/branch/addManager?UID=${id}&BID=${props.branchID}`).then(res=> {
        if (res.status === 200)
            getUsers();
    })
}

const handleRemovingManager = (id) => {
    axios.post(`/api/branch/removeManager?UID=${id}&BID=${props.branchID}`).then(res=> {
        if (res.status === 200)
            getUsers();
    })
}

</script>

<template>
    <div class="heading" >
        <div class="cover">
            <img :src="branchData.imgURL">
        </div>
        <div>
            <div class="user-info">
                <h3>{{ branchData.name }}</h3>
                <select v-if="AuthLevel" v-on:change="handleFollowStatus" v-model="followStatus" name="status" id="status">
                    <option value="email">Email Notifications</option>
                    <option value="follow">Follow</option>
                    <option value="unfollow">Unfollow</option>
                </select>
            </div>
            <br>
            <div class="topbar">
                <button v-on:click="showUsersPage=false; showPostsPage=true">Events</button>
                <button v-if="AuthLevel === 'admin' || isManager" v-on:click="showUsersPage=true; showPostsPage=false">Members</button>
                <button v-if="AuthLevel === 'admin'" v-on:click="deleteBranch">Delete this Branch</button>
            </div>
        </div>
    </div>

    <ul v-if="showUsersPage" class="usersList">
        <li v-for="user in userList">
            {{ user.username }}
            <button v-if="AuthLevel === 'admin' && !user.isManager" v-on:click="handleAssigningManager(user.id)">Assign as a manager</button>
            <button v-if="AuthLevel === 'admin' && user.isManager" v-on:click="handleRemovingManager(user.id)">Remove managing privilage</button>
        </li>
    </ul>

    <div v-if="showPostsPage">
        <div v-if="AuthLevel==='admin' || isManager" class="add-post-btn" v-on:click="showCreatePost = true">
            <h1>
                <FontAwesomeIcon :icon="faSquarePlus" />
            </h1>
            <p>Create Post</p>
        </div>
        <div v-if="showCreatePost" class="layover">
            <form action="javascript:void(0);" class="create-form">
                <div class="left">
                    <input type="file" id="" v-if="imgSrc == ''" v-on:change="handleURLChange">
                    <img :src="imgSrc" alt="img here">
                </div>
                <div class="right">
                    <div>
                        <textarea v-model="form.description" id="" placeholder="Write a caption" rows="5"></textarea>
                    </div>
                    <div>
                        <input v-model="form.location" type="text" required placeholder="add location">
                        <FontAwesomeIcon :icon="faLocationDot" />
                    </div>
                    <div>
                        <input required type="datetime" v-model="form.date" id="" placeholder="add date">
                        <FontAwesomeIcon :icon="faCalendar" />
                    </div>
                    <div>
                        <label for="publicity">Publicity:</label>
                        <select name="publicity" v-on:change="e=>{form.publicity = e.target.value}">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <input type="button" v-on:click="showCreatePost = false" value="Cancel">
                    <button v-on:click="createPost" type="submit">Submit</button>
                </div>
            </form>
        </div>
        <Post v-for="post in posts" :data=post></Post>
    </div>

</template>

<style>
.add-post-btn {
    text-align: center;
    background-color: rgb(0, 149, 246);
    padding: 5px 20px 5px 20px;
    border-radius: 10px;
    max-width: fit-content;
    margin: auto;
}

.layover {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2;
    cursor: pointer;
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

.right textarea {
    width: 100%;
    resize: none;
    background-color: transparent;
    border: none;
    outline: none;
}

.add-post-btn:hover {
    background-color: rgb(24, 119, 242);
}

h3 {
    font-size: large;
}

.heading {
    height: max-content;
    background-color: rgb(38, 38, 38);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0% 10% 0% 10%;
}

.cover {
    position: relative;
    width: 100%;
    height: 250px;

    img {
        width: 100%;
        height: 250px;
        object-fit: cover;
    }

    button {
        position: absolute;
        right: 10px;
        bottom: 10px;
    }
}

.user-info {
    display: flex;
    margin-top: 20px;
}

.user-info>button:hover {
    background-color: rgb(199, 199, 199);
}

select {
    background-color: rgb(50, 50, 50);
    border: none;
    border-radius: 5px;
    margin-left: auto;
    padding: 8px 16px 8px 16px;
}

select>option {
    padding: 8px 16px 8px 16px;
}

.topbar {
    padding-top: 10px;
    padding-bottom: 10px;
    width: 100%;
    display: flex;
    justify-content: center;

    button {
        background-color: transparent;
        color: aliceblue;
        padding: 8px 16px 8px 16px;
    }

    button:hover {
        background-color: rgb(50, 50, 50);
    }
}
</style>