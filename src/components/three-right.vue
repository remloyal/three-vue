<template>
  <div class="three-right">
    <div>
      <!-- <button @click="onPunctuate">{{ punctuate ? '关闭' : '开启' }}</button> -->
      <slot></slot>
      <el-select v-model="file" class="m-2" placeholder="Select" size="large">
        <el-option v-for="item in files" :key="item.value" :label="item.text" :value="item.value" />
      </el-select>
      <button @click="clear">清除</button>
    </div>
  </div>
</template>

<script setup>
// import { nextTick } from 'process';
import { computed, onMounted, ref, nextTick } from 'vue';
import { threeCase } from './three-control';
// const props = defineProps(['threeCase']);

const emits = defineEmits(['setLoading']);

function getImageUrl(name) {
  return new URL(`../assets/地拍/${name}.jpg`, import.meta.url).href;
}

const filesName = ['1 前坪', '2 一层门口', '4 左过道2', '5 二层扶梯口'];
const files = ref([]);
const file = ref();

onMounted(() => {
  // console.log(props);
  filesName.forEach((item) => {
    let file = getImageUrl(`${item}`);
    // files.push(file)
    files.value.push({
      text: item,
      value: file,
    });
    // files[item] = file;
  });
  console.log(files);
});
const clear = () => {
  emits('setLoading', true);
  let img = file.value;
  console.log(img);
  console.log(threeCase.scene.children);
  threeCase.scene.remove(threeCase.room);
  console.log(threeCase.labelRenderer.getSize());
  setTimeout(() => {
    threeCase.foundSpherome(img);
    emits('setLoading', false);
  }, 2000);
};
</script>
<style>
.three-right {
  width: 20vw;
  height: 100vh;
}
</style>
