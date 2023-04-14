<template>
  <el-form :model="form" ref="ruleFormRef" :rules="rules">
    <el-form-item label="名字" prop="name">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="全景图" prop="toMap">
      <el-select v-model="form.toMap" placeholder="Select" size="default" @change="toMapChange">
        <el-option v-for="item in files" :key="item.value" :label="item.text" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="角度" prop="viewpoint">
      <el-input v-model="form.viewpoint" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" />
    </el-form-item>
    <el-form-item label="主体" prop="mainBody">
      <el-switch v-model="form.mainBody" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">确认</el-button>
      <el-button @click="emits('close')">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { reactive, ref, onMounted, defineExpose, watch } from 'vue';
import { mainStore } from '../../store/index';

const counterStore = mainStore();

const props = defineProps({
  data: Object,
});

const emits = defineEmits(['toMapChange','close']);

const ruleFormRef = ref();

const form = reactive({
  name: '',
  mainBody: false,
  toMap: '',
  viewpoint: [0, 0, 0],
  interactivePoints: [],
});

watch(
  () => counterStore.cameraPoints,
  () => {
    form.viewpoint = counterStore.cameraPoints;
  }
);

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
  console.log('props', props.data);
  if (props.data) {
    Object.assign(form, props.data);
  }else {
    form.id = Math.random().toString(36).slice(-10);
  }
});
const onSubmit =async () => {
  console.log('submit!');
  await ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit!');
      emits('setPoint', form);
    } else {
      console.log('error submit!', fields);
    }
  });
};

const toMapChange = (e) => {
  console.log(e);
  emits('toMapChange', e);
};

defineExpose({
  form,
});
</script>
