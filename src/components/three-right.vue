<template>
  <div class="three-right">
    <div class="option">
      <div class="option-title">信息<button style="float: right" @click="preserve">保存</button></div>

      <!-- <button @click="onPunctuate">{{ punctuate ? '关闭' : '开启' }}</button> -->
      <slot></slot>

      <div class="option-room">
        <div class="option-room-title">
          <span>房间</span>
          <el-button @click.stop="dialogVisible = true" type="primary"> 添加</el-button>
        </div>
        <div class="option-room-body">
          <template v-for="item in rooms">
            <div class="option-room-item" :class="[room.id == item.id ? 'option-room-activeTtem' : '']" @click.stop="onRoom(item)">
              {{ item.name }} -- {{ item.id }}
              <span class="room-revise" @click.stop="cutRoom(item)">修改</span>
            </div>
          </template>
        </div>
      </div>
      <div class="option-point">
        <div class="option-point-title">
          <span>点位</span>
          <el-button type="primary" v-if="pointState" @click="addPoint"> 新增</el-button>
          <el-button v-else @click="revertPoint"> 返回</el-button>
        </div>
        <div class="option-point-body">
          <!-- <div class="option-point-item" v-show="pointState">
            111111111111
            <span class="room-revise" @click="">修改</span>
          </div> -->
          <div v-show="pointState">
            <template v-for="item in room.interactivePoints">
              <div class="option-point-item">
                {{ item.name }}
                <span class="room-revise" @click="deletePoint(item)">删除</span>
                <span class="room-revise" @click="revisePoint(item)">修改</span>
              </div>
            </template>
          </div>
          <RoomPoint v-if="!pointState" @setPoint="setPoint" @close="revertPoint" :data="roomPoint" />
        </div>
      </div>
      <!-- <button @click="clear">清除</button> -->
    </div>
    <el-dialog v-model="dialogVisible" title="添加房间" width="30%" :before-close="handleClose" destroy-on-close>
      <Room ref="roomEl" :data="roomData" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="addThreeRoom"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// import { nextTick } from 'process';
import { computed, onMounted, ref, nextTick, watch } from 'vue';
import { threeCase } from './three-control';
import { pointMould } from './three-config';
import { mainStore } from '../store/index';
import Room from './module/room.vue';
import RoomPoint from './module/room-point.vue';

const counterStore = mainStore();

const emits = defineEmits(['setLoading']);

const overallView = ref();

const rooms = ref([]);
const room = ref({
  id: '',
  name: '',
  toMap: null,
  mainBody: false,
  interactivePoints: [],
});

onMounted(() => {
  // console.log(props);
  // console.log(files);
  let data = localStorage.getItem('room');
  if (data) {
    rooms.value = JSON.parse(data);
  }
});

const preserve = () => {
  // console.log(rooms.value);
  console.log(threeCase.scene);
  localStorage.setItem('room', JSON.stringify(rooms.value));
};

watch(counterStore.iconPoint, () => {});
const dialogVisible = ref(false);
const handleClose = () => {
  dialogVisible.value = false;
  roomData.value = null;
};

// 房间
const roomEl = ref();
const addThreeRoom = () => {
  let data = {};
  Object.assign(data, pointMould.room, roomEl.value.form);
  if (data.id) {
    let index = rooms.value.findIndex((res) => (res.id = data.id));
    rooms.value[index] = data;
  } else {
    data.id = Math.random().toString().slice(-10);
    rooms.value.push(data);
  }
  roomData.value = null;
  dialogVisible.value = false;
};

const onRoom = (item) => {
  if (item.id == room.value.id) return;
  room.value = item;
  // threeCase.foundSpherome(item.toMap);
  onClear();
  if (room.value.interactivePoints.length > 0) {
    room.value.interactivePoints.map(item=>{
      threeCase.createLableIcon(item, () => {
        handleReactivePointClick(item);
      });
    })
  }
};

const handleReactivePointClick = (data) => {
  console.log(data);
  // Object.assign(form, data);
  if (data.type == 'direction') {
    onClear(data.toMap)
  }
};

const onClear = (image = null) => {
  emits('setLoading', true);
  let img = room.value.toMap;
  console.log(img);
  console.log(threeCase.scene.children);
  threeCase.scene.remove(threeCase.room);
  console.log(threeCase.labelRenderer.getSize());
  room.value.interactivePoints.map(item=>{
    deletePoint(item)
  })
  setTimeout(() => {
    threeCase.foundSpherome(image || img);
    emits('setLoading', false);
  }, 1000);
};
// 修改
const roomData = ref();
const cutRoom = (item) => {
  console.log(item);
  roomData.value = item;
  dialogVisible.value = true;
};

const roomPoints = ref([]);
const roomPoint = ref();

const pointState = ref(true);
const addPoint = () => {
  pointState.value = false;
};

const revertPoint = () => {
  pointState.value = true;
  roomPoint.value = null;
};

const setPoint = (data) => {
  console.log(data);
  let index = room.value.interactivePoints.findIndex((res) => res.id == data.id);
  if (index == -1) {
    room.value.interactivePoints.push(data);
  } else {
    room.value.interactivePoints[index] = data;
  }

  pointState.value = true;
};
const revisePoint = (data) => {
  roomPoint.value = data;
  pointState.value = false;
};

const deletePoint = (data) => {
  threeCase.scene.remove(threeCase.dropPoints[data.id]);
  delete threeCase.dropPoints[data.id];
  let index = room.value.interactivePoints.findIndex((res) => res.id == data.id);
  if (index != -1) {
    room.value.interactivePoints.splice(index,1)
  }
};
</script>
