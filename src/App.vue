<script setup>
import HelloWorld from './components/HelloWorld.vue';
import threeMain from './components/three-main.vue';
// import threeRight from './components/three-right.vue'
</script>

<template>
  <threeMain />
</template>

<style scoped lang="less">
.main {
  display: flex;
}
.main-body {
  width: 100vw;
  height: 100vh;
}
.main-right {
  width: 20vw;
  height: 100vh;
}
</style>
