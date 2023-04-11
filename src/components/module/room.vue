<template>
  <el-form :model="form" label-width="120px" :rules="rules">
    <el-form-item label="名字" prop="name">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="全景图" prop="toMap">
      <el-select v-model="form.toMap" placeholder="Select" size="default">
        <el-option v-for="item in files" :key="item.value" :label="item.text" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="主体" prop="mainBody">
      <el-switch v-model="form.mainBody" />
    </el-form-item>
  </el-form>
</template>
<script setup>
import { reactive, ref, onMounted, defineExpose } from 'vue';

const props = defineProps({
  data: Object,
});

const form = reactive({
  name: '',
  mainBody: false,
  toMap: '',
  interactivePoints:[]
});
const rules = {
  name: [{ required: true, message: 'Please input Activity name', trigger: 'blur' }],
  toMap: [{ required: true, message: 'Please input Activity name', trigger: 'blur' }],
  mainBody: [{ required: true, message: 'Please input Activity name', trigger: 'blur' }],
};

function getImageUrl(name) {
  return new URL(`../../assets/${name}`, import.meta.url).href;
}

const filesName = ['地拍/1 前坪.jpg', '地拍/2 一层门口.jpg', '地拍/4 左过道2.jpg', '地拍/5 二层扶梯口.jpg', '博物馆航拍全景260M.JPG'];
const files = ref([]);
onMounted(() => {
  filesName.forEach((item) => {
    let file = getImageUrl(`${item}`);
    files.value.push({
      text: item,
      value: file,
    });
  });
  console.log(files);
  console.log('props',props.data);
  if (props.data) {
    Object.assign(form,props.data)
  }
});
const onSubmit = () => {
  console.log('submit!');
};

defineExpose({
  form,
});
</script>
