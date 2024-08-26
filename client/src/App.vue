<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse'
import { faUserCheck } from '@fortawesome/free-solid-svg-icons/faUserCheck'
import { faUser } from '@fortawesome/free-regular-svg-icons/faUser'
import { faUserGroup } from '@fortawesome/free-solid-svg-icons/faUserGroup'
import { faSquarePlus } from '@fortawesome/free-solid-svg-icons/faSquarePlus'
import { provide, ref } from 'vue'
import axios from 'axios'

const userLevel = ref('');
axios.get("/api/users/logincheck").then(function (response) {
    if (response.status === 200 && response.data !== "login failure") {
        userLevel.value = response.data.level;
    } else {
      userLevel.value = false;
    }
});

provide('authLevel', userLevel);
</script>

<template>
  <div class="sidebar">
    <router-link to="/">
      <FontAwesomeIcon :icon="faHouse" /> <span>Home</span>
    </router-link>
    <router-link to="/following">
      <FontAwesomeIcon :icon="faUserCheck" /><span>Following</span>
    </router-link>
    <router-link to="/profile">
      <FontAwesomeIcon :icon="faUser" /><span>Profile</span>
    </router-link>
    <router-link to="/branches">
      <FontAwesomeIcon :icon="faUserGroup" /><span>Branches</span>
    </router-link>
    <router-link to="/login" v-if="!userLevel">
      <FontAwesomeIcon :icon="faSquarePlus" /><span>Login</span>
    </router-link>
    <router-link to="/logout" v-if="userLevel">
      <FontAwesomeIcon :icon="faSquarePlus" /><span>Logout</span>
    </router-link>
  </div>
  <div class="content">
    <router-view></router-view>
  </div>
</template>

<style>
.sidebar {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 12px 20px 12px;
  height: 100%;
  outline: 1px solid rgb(38, 38, 38);
  font-size: 18px;
}

a>span {
  padding-left: 12px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;
}

@media screen and (max-width: 1086px) {
  span {
    display: none;
  }

  .sidebar {
    width: 72px;
    a {
      justify-content: center;
    }
  }
}
</style>