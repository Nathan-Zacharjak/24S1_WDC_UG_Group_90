<script setup>
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons/faSquarePlus'
import { inject, ref } from 'vue';

const showUsers = ref(false);
const showProfile = ref(true);

defineProps({
    id: String,
})

const profileForm = ref({ username: '', email: '', oldPassword: '', newPassword: '', confirmNewPassword: '', warningShow: false, warningText: '', updateSuccessMessage: false, deleteWarningShow: false });

let oldUsername = '';

axios.get('api/users/get').then(response => {
    profileForm.value.email = response.data.email;
    profileForm.value.username = response.data.username;
    oldUsername = response.data.username;
})

const authLevel = inject('authLevel');

function UpdateProfile() {
    axios.post('/api/users/updateprofile', { oldUsername: oldUsername, username: profileForm.value.username, email: profileForm.value.email, newPassword: profileForm.value.newPassword, oldPassword: profileForm.value.oldPassword }).then(function (response) {
        if (response.status !== 200) {
            return;
        } else if (response.data === "success") {
            // Show a updated details success message
            profileForm.value.updateSuccessMessage = true;
            profileForm.value.warningShow = false;
        } else if (response.data !== "success") {
            profileForm.value.warningText = response.data;
            profileForm.value.warningShow = true;
        }
    }, function (error) {
        throw error || new Error(`Update profile request failed`);
    })
}

function LoginCheck(onSuccessFunction) {
    profileForm.value.warningShow = false;

    // First check the update profile form has been correctly filled
    if (profileForm.value.username === '' || profileForm.value.email === '' || profileForm.value.oldPassword === '') {
        return;
    } else if (onSuccessFunction === UpdateProfile && profileForm.value.newPassword !== profileForm.value.confirmNewPassword) {
        profileForm.value.warningText = "New password fields don't match!";
        profileForm.value.warningShow = true;
    }

    // Now try logging in as the current user, using their old username and given old password
    // to check if their old password is correct
    axios.post('/api/login', { username: oldUsername, password: profileForm.value.oldPassword }).then(function (response) {
        console.log("Login response:", response);
        if (response.status !== 200) {
            return;
        } else if (response.data === "success") {
            onSuccessFunction();
        } else if (response.data !== "success") {
            // Changing the error message to "Password incorrect", as the user can set their new username
            // to whatever they want, give it's not already taken
            if (response.data === "Username or password incorrect!") {
                response.data = "Password incorrect!";
            }
            profileForm.value.warningText = response.data;
            profileForm.value.warningShow = true;
        }
    }, function (error) {
        throw error || new Error(`Login Request failed`);
    })
}

function DeleteAccount() {
    axios.post('/api/users/delete', profileForm.value).then(function (response) {
        if (response.status !== 200) {
            return;
        } else if (response.data === "success") {
            // Redirect the user to the home page and refresh their page to sign them out
            window.location = "/";
        } else if (response.data !== "success") {
            // If some kind of error occurs, show it in the warning text
            profileForm.value.warningText = response.data;
            profileForm.value.warningShow = true;
        }
    }, function (error) {
        throw error || new Error(`Delete account request failed`);
    })
}

</script>

<template>
    <h3 v-if="!authLevel">
        <RouterLink to="/login">Log In</RouterLink> to see your profile
    </h3>
    <div v-else class="container">
        <div class="heading">
            <div class="user-heading">
                <span>{{ profileForm.username }}</span>
            </div>
            <div class="topbar">
                <button v-on:click="showUsers = false; showProfile = true">
                    Edit Profile
                </button>
                <button v-if="authLevel === 'admin'" v-on:click="showUsers = true; showProfile = false">System
                    Users</button>
            </div>
        </div>
        <div class="user-info" v-if="showProfile">
            <form action="javascript:void(0);">
                <p class="warningText" v-if="profileForm.warningShow">{{ profileForm.warningText }}</p>
                <p class="successText" v-else-if="profileForm.updateSuccessMessage">Profile update successful!</p>
                <h5>Username</h5>
                <input type="text" v-model="profileForm.username" required>
                <h5>Email</h5>
                <input type="text" v-model="profileForm.email" required>
                <h5>Old password</h5>
                <input type="password" v-model="profileForm.oldPassword" required>
                <h5>New password</h5>
                <input type="password" v-model="profileForm.newPassword">
                <h5>Confirm new password</h5>
                <input type="password" v-model="profileForm.confirmNewPassword">
                <div class="submits" v-if="!profileForm.deleteWarningShow">
                    <button type="submit" v-on:click="LoginCheck(UpdateProfile)">Update Profile</button>
                    <button v-on:click="profileForm.deleteWarningShow = true">Delete account</button>
                </div>
                <div class="submits" v-else>
                    <p class="warningText">Are you sure you want to delete your account?</p>
                    <button v-on:click="LoginCheck(DeleteAccount)">Delete account</button>
                </div>
            </form>
        </div>
        <div class="users" v-if="showUsers">
            <div class="add-admin">
                <h3>Add admin's email address</h3>
                <input placeholder="add new admin's email address" type="text">
                <button>Submit</button>
            </div>
            <br>
            <h2>Users</h2>

        </div>
    </div>
</template>
<script>

</script>

<style>
.container>* {
    margin-top: 32px;
}

.user-heading>img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.user-heading {
    display: flex;
    gap: 8px;
    align-items: center;
}

.user-heading>button {
    margin-left: auto;
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

.user-info,
.users {
    display: flex;
    flex-direction: column;
    padding-left: 15%;
    padding-right: 15%;
}

.submits {
    display: flex;

    button {
        margin: auto;
    }
}

.warningText {
    color: red;
}

.successText {
    color: greenyellow;
}
</style>