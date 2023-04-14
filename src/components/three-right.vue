<template>
  <div class="three-right">
    <div class="option">
      <div class="option-title">信息<button style="float: right" @click="preserve">保存</button> <button style="float: right" @click="onDrawFace">绘制</button></div>
      <!-- <button @click="onPunctuate">{{ punctuate ? '关闭' : '开启' }}</button> -->

      <div class="option-room">
        <div class="option-room-title">
          <span>房间</span>
          <el-button @click.stop="addRoom" type="primary" v-if="dialogVisible"> 添加</el-button>
          <el-button v-else @click="dialogVisible = true"> 返回</el-button>
        </div>
        <div class="option-room-body">
          <div v-if="dialogVisible">
            <template v-for="item in rooms">
              <div class="option-room-item" :class="[room.id == item.id ? 'option-room-activeTtem' : '']" @click.stop="onRoom(item)">
                {{ item.name }} -- {{ item.id }}
                <span class="room-revise" @click.stop="deleteRoom(item)">删除</span>
                <span class="room-revise" @click.stop="cutRoom(item)">修改</span>
              </div>
            </template>
          </div>
          <Room ref="roomEl" :data="roomData" v-if="!dialogVisible" @toMapChange="onClear" @setPoint="addThreeRoom" @close="dialogVisible = true" />
        </div>
      </div>
      <div class="option-point">
        <div class="option-point-title">
          <span>点位</span>
          <el-button type="primary" v-if="pointState" @click="addPoint"> 新增</el-button>
          <el-button v-else @click="revertPoint"> 返回</el-button>
        </div>
        <div class="option-point-body">
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
    <!-- <el-dialog v-model="dialogVisible" title="添加房间" width="30%" :before-close="handleClose" destroy-on-close>
      <Room ref="roomEl" :data="roomData" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="addThreeRoom"> 确定 </el-button>
        </span>
      </template>
    </el-dialog> -->
  </div>
</template>

<script setup>
// import { nextTick } from 'process';
import { computed, onMounted, ref, nextTick, watch } from 'vue';
import * as THREE from 'three';
import { threeCase, drawFace } from './three-control';
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
  viewpoint: [0, 0, 0],
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
const dialogVisible = ref(true);
const handleClose = () => {
  dialogVisible.value = false;
  roomData.value = null;
};

// 房间
const roomEl = ref();
const addRoom = () => {
  dialogVisible.value = false;
};

const addThreeRoom = (data) => {
  console.log(data);
  // let data = {};
  // Object.assign(data, pointMould.room, roomEl.value.form);
  let index = rooms.value.findIndex((res) => res.id == data.id);
  console.log(index);
  if (index != -1) {
    rooms.value[index] = data;
  } else {
    // data.id = Math.random().toString().slice(-10);
    rooms.value.push(data);
  }
  roomData.value = null;
  dialogVisible.value = true;
};

const onRoom = async (item) => {
  console.log(item);
  if (item.id == room.value.id) return;
  // threeCase.foundSpherome(item.toMap);
  await onClear(item.toMap);
  room.value = item;
};

const handleReactivePointClick = (data) => {
  console.log(data);
  // Object.assign(form, data);
  if (data.type == 'direction') {
    onClear(data.toMap);
  }
};

const onClear = (image = null) => {
  emits('setLoading', true);
  let img = room.value.toMap;
  // 朝向
  // threeCase.room.dispose()
  threeCase.scene.remove(threeCase.room);
  room.value.interactivePoints.map((item) => {
    threeCase.deletePoint(item);
  });
  setTimeout(() => {
    threeCase.foundSpherome(image || img);
    if (room.value.interactivePoints.length > 0) {
      room.value.interactivePoints.map((item) => {
        threeCase.createLableIcon(item, () => {
          handleReactivePointClick(item);
        });
      });
    }
    if (room.value.viewpoint && room.value.viewpoint.length > 0) {
      threeCase.camera.position.set(room.value.viewpoint[0], room.value.viewpoint[1], room.value.viewpoint[2]);
    } else {
      threeCase.camera.position.set(0, 0, 0);
    }
    emits('setLoading', false);
  }, 1000);
};

// 修改
const roomData = ref();
const cutRoom = (item) => {
  console.log(item);
  roomData.value = item;
  dialogVisible.value = false;
};

const deleteRoom = (data) => {
  let index = rooms.value.findIndex((res) => res.id == data.id);
  if (index != -1) {
    rooms.value.splice(index, 1);
  }
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

// 清除点
const deletePoint = (data) => {
  threeCase.scene.remove(threeCase.dropPoints[data.id]);
  delete threeCase.dropPoints[data.id];
  let index = room.value.interactivePoints.findIndex((res) => res.id == data.id);
  if (index != -1) {
    room.value.interactivePoints.splice(index, 1);
  }
};

// 绘制面
const onDrawFace = () => {
  threeCase.mixin(drawFace);
  threeCase.drawInit();
  threeCase.addEventcClick(setDrawFace);
};

const setDrawFace = ([x, y, z]) => {
  console.log(x,y,z);
  console.log(threeCase.drawData.line);
  var positions = threeCase.drawData.line.geometry.attributes.position.array;
  var data = [];
  // // console.log(positions.length);
  // // positions.set([x, y, z]);
  // console.log(positions);
  // // console.log(positions.slice());
  for (let index = 0; index < positions.length; index++) {
    const element = positions[index];
    data.push(element);
  }
  data.push(...[x, y, z]);
  // // positions.set(data);
  let float32Array = new Float32Array(data);
  // console.log(positions.length);
  // console.log(float32Array);
  threeCase.drawData.line.geometry.attributes.position.array = float32Array;
  console.log(threeCase.drawData.line.geometry);
  threeCase.drawData.line.geometry.setAttribute('position', new THREE.BufferAttribute(float32Array, 3));
  threeCase.drawData.Mesh.geometry.setAttribute('position', new THREE.BufferAttribute(float32Array, 3));
  // // console.log(threeCase.drawData.points.geometry);
  // // console.log(threeCase.drawData.points.geometry.attributes.position.needsUpdate);
  // threeCase.drawData.positionAttribute.needsUpdate = true;
  threeCase.drawData.line.geometry.attributes.position.needsUpdate = true;
};
</script>
