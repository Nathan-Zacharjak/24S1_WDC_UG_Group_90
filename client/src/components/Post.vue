<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons/faLocationDot';
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar';

defineProps({
    data: {
        type: Object,
        required: false,
        default(rawProps) {
            return {
                imgURL: 'src/assets/cover1.png',
                username: 'Hogwarts',
                location:'Hogwarts',
                date:'14 Feb',
                description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. '
            }
        }
    }
});

</script>

<template>
    <div class="post">
        <div class="info">
            <div class="user">
                <div class="profile-pic"><img :src="data.imgURL" alt="" referrerpolicy="no-referrer"></div>
                <p class="username">{{ data.username }}</p>
            </div>
        </div>
        <img :src="data.imgURL" class="post-image" alt="" referrerpolicy="no-referrer">
        <div class="post-content">
            <div class="post-info">
                <p>
                    <FontAwesomeIcon :icon="faLocationDot" class="save icon" title="Follow" />
                    {{ data.location }}
                </p>
                <p>
                    <FontAwesomeIcon :icon="faCalendar" class="save icon" title="Follow" />
                    {{ data.date }}
                </p>
            </div>
            <p class="description">{{ data.description }} </p>
            <!-- <p class="post-time">{{ data.createAt }}</p> -->
        </div>
    </div>
</template>

<style>
.post {
    width: 500px;
    height: auto;
    margin-top: 40px;
    border-bottom: 1px solid rgba(210, 210, 210, 0.4);

}

.info {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.info .username {
    width: auto;
    font-weight: bold;
    font-size: 14px;
    margin-left: 10px;
}

.info .user {
    display: flex;
    align-items: center;
}

.profile-pic>* {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    padding: 0;
    background: none;
}

.post-image {
    width: 500px;
    height: 500px;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid rgb(38, 38, 38);
}

.post-content {
    width: 100%;
    padding: 20px;
}

.follows {
    font-weight: bold;
}

.description {
    margin: 10px 0;
    font-size: 14px;
    line-height: 20px;
}

.description span {
    font-weight: bold;
    margin-right: 10px;
}

.post-time {
    font-size: 12px;
}

.post-info {
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: column;
    margin-top: -20px;
    margin-bottom: 20px;
    gap: 8px;
}

.post-info .icon {
    height: 25px;
    margin: 0;
    margin-right: 20px;
}
</style>