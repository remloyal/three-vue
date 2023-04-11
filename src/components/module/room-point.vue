<template>
  <el-form :model="form" ref="ruleFormRef" :rules="rules">
    <el-form-item label="名字" prop="name">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="类型" prop="type">
      <el-select v-model="form.type" class="m-2" placeholder="选择类型" size="default">
        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="全景图" prop="toMap" v-if="form.type == 'direction'">
      <el-select v-model="form.toMap" placeholder="选择全景图" size="default">
        <el-option v-for="item in files" :key="item.value" :label="item.text" :value="item.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="参数：">
      <span class="demonstration">X轴</span>
      <el-slider v-model="form.revolve.x" show-input size="small" :max="360" />
      <span class="demonstration">Y轴</span>
      <el-slider v-model="form.revolve.y" show-input size="small" :max="360" />
      <span class="demonstration">Z轴</span>
      <el-slider v-model="form.revolve.z" show-input size="small" :max="360" />
      <span class="demonstration">大小</span>
      <el-slider v-model="form.size" show-input size="small" :max="360" />
    </el-form-item>
    <el-form-item label="坐标" prop="position">
      <el-input v-model="form.position" :style="{ width: '200px' }" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" />
      <el-button :style="{ marginLeft: '10px' }" :type="onPositionState ? 'primary' : ''" @click="onUpdate">修改</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">确认</el-button>
      <el-button @click="emits('close')">取消</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { reactive, ref, onMounted, defineExpose, watch } from 'vue';
import { threeCase } from '../three-control';
import { mainStore } from '../../store/index';

const counterStore = mainStore();

const props = defineProps({
  data: Object,
});
const emits = defineEmits(['setPoint', 'close']);

const ruleFormRef = ref();

const form = reactive({
  id: '',
  namw: '冰箱',
  icon: 'icon-fangxiangyuanjiantou-xiangshang',
  type: '',
  // 旋转角度
  revolve: {
    x: 45,
    y: 0,
    z: 0,
  },
  toMap: '',
  position: [0, 0, 0],
  size: 36,
});

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'blur' }],
  toMap: [{ required: true, message: '请选择全景图', trigger: 'blur' }],
  position: [{ required: true, message: 'Please input Activity name', trigger: 'blur' }],
};

const typeOptions = [
  {
    value: 'direction',
    label: '方向',
  },
  {
    value: 'drop',
    label: '点',
  },
];

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
  if (props.data) {
    console.log(props.data);
    Object.assign(form, props.data);
  } else {
    form.id = Math.random().toString(36).slice(-10);
  }
});

const onSubmit = async () => {
  await ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit!');
      emits('setPoint', form);
    } else {
      console.log('error submit!', fields);
    }
  });
};

const onPositionState = ref(false);
const onUpdate = () => {
  onPositionState.value = !onPositionState.value;
  if (onPositionState.value) {
    threeCase.addEventcClick();
  } else {
    threeCase.removeEventcClick();
  }
};

watch(
  [form.revolve, () => form.size],
  ([newVal, oldVal]) => {
    if (threeCase.dropPoints[form.id]) {
      threeCase.dropPoints[form.id].element.children[0].setAttribute('style', `transform:rotateX(${form.revolve.x}deg) rotateY(${form.revolve.y || 0}deg) rotateZ(${form.revolve.z || 0}deg);`);
      threeCase.dropPoints[form.id].element.children[0].children[0].setAttribute('style', `font-size:${form.size}px`);
    }
  },
  { deep: true }
);

watch(
  () => counterStore.pointCoordinate,
  (newVal, oldVal) => {
    form.position = newVal;
    if (threeCase.dropPoints[form.id]) {
      threeCase.dropPoints[form.id].position.set(newVal[0], newVal[1], newVal[2]);
    } else {
      threeCase.createLableIcon(form, () => {
        handleReactivePointClick(form);
      });
    }
  },
  { deep: true }
);

const handleReactivePointClick = (data) => {
  console.log(data);
  Object.assign(form, data);
};

defineExpose({
  form,
});
</script>
