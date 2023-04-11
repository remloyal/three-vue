<template>
  <div class="three-main">
    <div v-loading="loading">
      <div class="three-map" id="three-map" ref="threeEl"></div>
    </div>
    <div class="three-coordinate">{{ counterStore.cameraPoints.toString() }}</div>
    <threeRight :threeCase="threeCase" @setLoading="setLoading">
      <!-- <div id="three-tag">
        <button @click="onPunctuate">{{ punctuate ? '关闭' : '开启' }}</button>
      </div> -->
    </threeRight>
  </div>
</template>

<script setup>
import * as THREE from 'three';

import { onMounted, ref, reactive, watch } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import threeRight from './three-right.vue';
import { threeCase } from './three-control';
import { pointMould } from './three-config';

import { mainStore } from '../store/index';

const counterStore = mainStore();

const threeEl = ref();
const loading = ref(false);

const setLoading = (state = false) => {
  loading.value = state;
};

// let threeCase ;

const data = {
  scene: null,
  box: null,
  sphere: null,
  camera: null,
  renderer: null,
  // 镜头控制器
  controls: null,
  // 点
  geometry: null,
  labelRenderer: null,
};


const width = window.innerWidth - 400;
const height = window.innerHeight;

function getImageUrl(name) {
  return new URL(`../assets/${name}`, import.meta.url).href;
}

const rooms = [
  {
    name: '客厅',
    key: 'living-room',
    map: '地拍/2 一层门口.jpg',
    position: new THREE.Vector3(0, 0, 0),
    interactivePoints: [
      {
        key: 'tv',
        value: '电视机',
        description: '智能电视',
        cover: new URL('@/assets/images/123.jpg', import.meta.url).href,
        position: new THREE.Vector3(-6, 2, -8),
      },
    ],
  },
  {
    name: '客厅2',
    key: 'living-room1',
    map: '地拍/1 前坪.jpg',
    position: new THREE.Vector3(0, 0, 0),
    interactivePoints: [
      {
        key: 'tv',
        value: '电视机',
        description: '智能电视',
        cover: new URL('@/assets/images/123.jpg', import.meta.url).href,
        position: new THREE.Vector3(-6, 2, -8),
      },
    ],
  },
];

const createRoom = (name, position, map) => {
  let image = getImageUrl(map);
  let texture = new THREE.TextureLoader().load(image);
  const geometry = new THREE.SphereGeometry(16, 256, 256);
  geometry.scale(1, 1, -1);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const room = new THREE.Mesh(geometry, material);
  room.name = name;
  room.position.set(position.x, position.y, position.z);
  room.rotation.y = Math.PI / 2;
  data.scene.add(room);
  return room;
};

function onDocumentMouseDown(event) {
  event.preventDefault();
  var vector = new THREE.Vector3(); //三维坐标对象
  vector.set((event.clientX / threeCase.width) * 2 - 1, -(event.clientY / threeCase.height) * 2 + 1, 0.5);
  vector.unproject(threeCase.camera);
  var raycaster = new THREE.Raycaster(threeCase.camera.position, vector.sub(threeCase.camera.position).normalize());
  var intersects = raycaster.intersectObjects(threeCase.scene.children);
  console.log(intersects);
  if (intersects.length > 0) {
    var selected = intersects[0]; //取第一个物体
    console.log('x坐标:' + selected.point.x);
    console.log('y坐标:' + selected.point.y);
    console.log('z坐标:' + selected.point.z);
    CreatingPoints(selected.point.x, selected.point.y, selected.point.z);
  }
}

onMounted(() => {
  // threeCase = new ThreeControl('three-map', width, height);
  threeCase.createInit('three-map', width, height);
  threeCase.foundSpherome();
  // console.log(THREE);
  // init();
  // foundSpherome();

  // data.scene.traverse((item) => {
  //   console.log(item);
  // });
  // 监听鼠标
  // threeCase.threeEl.addEventListener('mousemove', onRay);
  // window.addEventListener('mousemove', onRay);
  // window.addEventListener('click', onDocumentMouseDown);
  // 全局对象
  // let lastPick = null;
  // function onRay(event) {
  //   let pickPosition = threeCase.setPickPosition(event);

  //   const raycaster = new THREE.Raycaster();
  //   raycaster.setFromCamera(pickPosition, threeCase.camera);
  //   // 计算物体和射线的交点
  //   const intersects = raycaster.intersectObjects(threeCase.scene.children, true);
  //   const labelRenderer = raycaster.intersectObjects([threeCase.room]);
  //   console.log(labelRenderer.length);
  //   // 数组大于0 表示有相交对象
  //   if (intersects.length > 0) {
  //     if (lastPick) {
  //       lastPick.object.material.color.set('yellow');
  //     }
  //     threeCase.lastPick = intersects[0];
  //   } else {
  //     if (lastPick) {
  //       // 复原
  //       threeCase.lastPick.object.material.color.set(0x6688aa);
  //       threeCase.lastPick = null;
  //     }
  //   }
  // }
});

const CreatingPoints = ([x, y, z]) => {
  // createLableText('text', { x: x, y: y, z: z });
  // threeCase.createLableIcon({ x: x, y: y, z: z }, handleReactivePointClick);
  // if (Object.values(threeCase.dropPoints).length > 0 ) {
  //   console.log(threeCase.dropPoints);
  //   Object.values(threeCase.dropPoints).map(item=>{
  //     item.position.set(x, y, z);
  //     // threeCase.revisePoint([x, y, z],item.id)
  //   })
  // }
  const point = pointMould.iconPoint;
  point.position = [x, y, z];
  point.id = Math.random().toString(36).slice(-10);
  threeCase.createLableIcon(point, () => {
    handleReactivePointClick(point);
  });
  // iconPoint
};

// 点击交互点
const handleReactivePointClick = (point) => {
  // toast(`您点击了${point.value}`);
  console.log(`您点击了handleReactivePointClick`, point);
};

const punctuate = ref(false);
const onPunctuate = () => {
  punctuate.value = !punctuate.value;
  if (punctuate.value) {
    // threeCase.threeEl.addEventListener('click', onDocumentMouseDown);
    threeCase.addEventcClick(CreatingPoints)
  } else {
    // threeCase.threeEl.removeEventListener('click', onDocumentMouseDown);
    threeCase.removeEventcClick(CreatingPoints)
  }
};

</script>
<style lang="less">
@import url('../assets/index.less');
</style>
