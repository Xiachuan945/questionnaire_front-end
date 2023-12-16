<script>
import { RouterLink, RouterView } from 'vue-router';
export default {
    data() {
        return {
        }
    },
    components: {
        RouterLink,
        RouterView
    },
}
</script>

<template>
    <div class="bgArea">

        <div class="nav">
            <i class="fa-solid fa-caret-left" onclick="history.back()"></i>
            <i class="fa-solid fa-caret-right" onclick="history.forward()"></i>
            <i class="fa-solid fa-arrow-rotate-right" ></i>
            <i class="fa-solid fa-xmark"></i>
            <i class="fa-solid fa-house" onclick="location.href='http://localhost:5173'"></i>
        </div>
        <div class="site">
            <input type="text" class="url" value="http: // localhost:5173/動態問卷">
        </div>
        <form class="navSearch">
            <input type="search" placeholder="search">
            <button><i class="fas fa-search"></i></button>
        </form>
        
    </div>
</template>

<style lang="scss" scoped>
.bgArea {
    width: 100vw;
    height: 10vh;
    background-color: #0b3860;
    display: flex;
}

.nav {
    width: 25vw;
    height: 10vh;
    // border: 1px solid yellow;

    .fa-solid {
        width: 5vw;
        height: 10vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30pt;
        color: white;
        &:hover{
            font-size: 40pt;
        }
        // border: 1px solid greenyellow;
    }

}

.site {
    width: 55vw;
    height: 10vh;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    // border: 1px solid yellow;

    .url {
        width: 45vw;
        height: 5vh;
        border-radius: 10px;
        text-align: center;
    }
}

.navSearch {
    width: 20vw;
    display: flex;
    align-items: center;
    margin-left: auto;
    // border: 1px solid yellow;

    input,
    button {
        border: none;
        outline: none;
        height: 30px;
        background-color: white;
    }

    input {
        padding-left: 12px;
        width: 80%;
        border-radius: 100px 0 0 100px;
        text-align: center;
    }

    button {
        width: 20%;
        border-radius: 0 100px 100px 0;
        cursor: pointer;
    }
}
</style>