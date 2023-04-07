<template>
  <div class="three-main">
    <div v-loading="loading">
      <div class="three-map" id="three-map" ref="threeEl"></div>
    </div>

    <threeRight :threeCase="threeCase" @setLoading="setLoading">
      <div id="three-tag">
        <button @click="onPunctuate">{{ punctuate ? '关闭' : '开启' }}</button>
      </div>
    </threeRight>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import threeRight from './three-right.vue';
import { threeCase } from './three-control';

import { onMounted, ref, reactive } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
// import { mapState } from 'pinia';
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

// const scene = new THREE.Scene();

const width = window.innerWidth - 400;
const height = window.innerHeight;

function getImageUrl(name) {
  return new URL(`../assets/${name}`, import.meta.url).href;
}
// const initContent = async () => {
//   console.log(11);
//   let image = await getImageUrl('博物馆航拍150M.JPG');
//   let sphereGeometry = new THREE.SphereGeometry(50, 50, 50);
//   // 创建几何模型 BoxGeometry('x轴', '轴', 'z轴')
//   const geometry = new THREE.BoxGeometry(10, 10, 10);
//   // require('@/assets/three/博物馆航拍150M.jpg')
//   let texture = new THREE.TextureLoader().load(image);
//   let sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
//   // sphereGeometry.scale(16, 16, 16);
//   data.sphere = new THREE.Mesh(geometry, sphereMaterial);
//   data.scene.add(data.sphere);
// };

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
  threeCase.threeEl.addEventListener('mousemove', onRay);
  // window.addEventListener('mousemove', onRay);
  // window.addEventListener('click', onDocumentMouseDown);
  // 全局对象
  let lastPick = null;
  function onRay(event) {
    let pickPosition = threeCase.setPickPosition(event);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pickPosition, threeCase.camera);
    // 计算物体和射线的交点
    const intersects = raycaster.intersectObjects(threeCase.scene.children, true);
    const labelRenderer = raycaster.intersectObjects([threeCase.room]);
    console.log(labelRenderer.length);
    // 数组大于0 表示有相交对象
    if (intersects.length > 0) {
      if (lastPick) {
        lastPick.object.material.color.set('yellow');
      }
      threeCase.lastPick = intersects[0];
    } else {
      if (lastPick) {
        // 复原
        threeCase.lastPick.object.material.color.set(0x6688aa);
        threeCase.lastPick = null;
      }
    }
  }
});

const CreatingPoints = (x, y, z) => {
  // const geometry = new THREE.BufferGeometry();
  // const vertices = new Float32Array([
  //   x,
  //   y,
  //   z, //顶点1坐标
  // ]);
  // const attribue = new THREE.BufferAttribute(vertices, 3);
  // // 点渲染模式
  // geometry.attributes.position = attribue;
  // const material = new THREE.PointsMaterial({
  //   color: 0xffff00,
  //   size: 10.0, //点对象像素尺寸
  // });
  // const points = new THREE.Points(geometry, material);
  // //将模型添加到场景
  // data.scene.add(points);
  // const div = document.getElementById('three-tag');
  // const tag = new CSS2DObject(div);
  // tag.position.set(x, y, z);
  // data.scene.add(tag);
  // const group = new THREE.Group();
  // group.add(tag);
  // const css2Renderer = new CSS2DRenderer();
  // css2Renderer.render(data.scene, data.camera);
  // css2Renderer.setSize(width, height);
  // threeEl.appendChild(css2Renderer.domElement);

  // var labelRenderer = new THREE.CSS2DRenderer();

  // createLableText('text', { x: x, y: y, z: z });
  threeCase.createLableImg('image/image (1).jpg', { x: x, y: y, z: z }, handleReactivePointClick);
};

// 精灵图
function createLableSprite(img, vector) {
  // const texLoader = new THREE.TextureLoader();
  // let image =  getImageUrl('img');
  // const texture = texLoader.load(image);
  // const spriteMaterial = new THREE.SpriteMaterial({
  //   map: texture,
  // });
  // const sprite = new THREE.Sprite(spriteMaterial);
  // sprite.scale.set(vector.x, vector.y, vector.z);
  // data.scene.add(sprite)
  // obj是建模软件中创建的一个空对象
  // const obj = data.scene.getObjectByName('设备A标注');
  //tag会标注在空对象obj对应的位置
  // obj.add(sprite);
  // sprite.position.y = 5 / 2; //标签底部箭头和空对象标注点重合
}

// 点击交互点
const handleReactivePointClick = (point) => {
  // toast(`您点击了${point.value}`);
  console.log(`您点击了${point}`);
};

const punctuate = ref(false);
const onPunctuate = () => {
  punctuate.value = !punctuate.value;
  if (punctuate.value) {
    threeCase.threeEl.addEventListener('click', onDocumentMouseDown);
  } else {
    threeCase.threeEl.removeEventListener('click', onDocumentMouseDown);
  }
};
</script>

<style lang="less">
.three-main {
  display: flex;
  width: 100vw;
  height: 100vh;
}
.three-map {
  width: calc(100% - 400px);
  height: 100%;
  // position: absolute;
  // z-index: 100;
  // canvas {
  //   z-index: 1;
  // }
  // .laber_name{
  //   z-index: 100;
  // }
  /* background-color: aqua; */
}
#three-tag {
  // z-index: 101;
  position: fixed;
  top: 100px;
  right: 200px;
}

.laber_name {
}
</style>
