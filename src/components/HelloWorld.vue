<template>
  <section>
    <div class="three-map" id="three-map" ref="threeEl"></div>
    <div id="three-tag">
      <button @click="onPunctuate">{{ punctuate ? '关闭' : '开启' }}</button>
    </div>
  </section>
</template>

<script setup>
import * as THREE from 'three';
import { onMounted, ref, reactive } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
// import StandardCubeMap from '../../assets/three/博物馆航拍150M.JPG'
const threeEl = ref();

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
let urls = [
  '@/assets/three/博物馆航拍150M.jpg',
  // './img/home.right.jpg',
  // './img/home.top.jpg',
  // './img/home.bottom.jpg',
  // './img/home.front.jpg',
  // './img/home.back.jpg'
];
const width = window.innerWidth;
const height = window.innerHeight;
let threeData;
const init = () => {
  threeData = document.getElementById('three-map');
  data.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
  data.scene = new THREE.Scene();
  data.renderer = new THREE.WebGLRenderer();
  data.renderer.setSize(window.innerWidth, window.innerHeight);
  threeData.appendChild(data.renderer.domElement);
  data.camera.position.set(0, 0, 100);
  data.camera.lookAt(data.scene.position);
  data.renderer.render(data.scene, data.camera);
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x3c3c3c);
  // 将环境光添加到场景中
  data.scene.add(ambientLight);
  // 聚光灯
  const spotLight = new THREE.SpotLight(0xffffff, 1, 150, 120);
  spotLight.position.set(-40, 60, -10);
  // 将聚光灯添加到场景中
  data.scene.add(spotLight);

  // 摄影机空间Z轴
  // data.camera.position.set(2, 0, 0);
  data.camera.lookAt(data.scene.position);
  // 场景控制
  data.controls = new OrbitControls(data.camera, data.renderer.domElement);
  data.controls.target.set(0, 0, 0);
  data.controls.addEventListener('change', () => {
    data.renderer.render(data.scene, data.camera);
  });
  // 动画
  const tick = () => {
    data.controls && data.controls.update();
    TWEEN && TWEEN.update();
    data.renderer.render(data.scene, data.camera);
    window.requestAnimationFrame(tick);
  };
  tick();
  // 转动惯性
  data.controls.enableDamping = true;
  // 禁止平移
  data.controls.enablePan = true;
  // 缩放限制
  data.controls.maxDistance = 160;
  data.controls.minDistance = 0;
};

function getImageUrl(name) {
  return new URL(`../assets/${name}`, import.meta.url).href;
}
const initContent = async () => {
  console.log(11);
  let image = await getImageUrl('博物馆航拍150M.JPG');
  let sphereGeometry = new THREE.SphereGeometry(50, 50, 50);
  // 创建几何模型 BoxGeometry('x轴', '轴', 'z轴')
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  // require('@/assets/three/博物馆航拍150M.jpg')
  let texture = new THREE.TextureLoader().load(image);
  let sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
  // sphereGeometry.scale(16, 16, 16);
  data.sphere = new THREE.Mesh(geometry, sphereMaterial);
  data.scene.add(data.sphere);
};

const foundSpherome = async () => {
  let image = await getImageUrl('地拍/2 一层门口.jpg');
  const geometry = new THREE.SphereGeometry(16, 256, 256);
  let texture = new THREE.TextureLoader().load(image);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  geometry.scale(10, 10, 10);
  data.room = new THREE.Mesh(geometry, material);
  data.scene.add(data.room);
  // setTimeout(()=>{
  //   data.scene.remove(data.room)
  //   data.renderer.render(data.scene, data.camera)
  // },10000)
  // setTimeout(()=>{
  //   foundSpherome();
  // },15000)
};

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
  vector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
  vector.unproject(data.camera);
  var raycaster = new THREE.Raycaster(data.camera.position, vector.sub(data.camera.position).normalize());
  var intersects = raycaster.intersectObjects(data.scene.children);
  if (intersects.length > 0) {
    var selected = intersects[0]; //取第一个物体
    console.log('x坐标:' + selected.point.x);
    console.log('y坐标:' + selected.point.y);
    console.log('z坐标:' + selected.point.z);
    CreatingPoints(selected.point.x, selected.point.y, selected.point.z);
  }
}

onMounted(() => {
  console.log(THREE);
  init();
  foundSpherome();
  labelInit();

  // // 添加帧渲染
  const animate = () => {
    requestAnimationFrame(animate);
    // 渲染场景
    data.renderer.render(data.scene, data.camera);
    data.labelRenderer.render(data.scene, data.camera);
  };

  animate();

  // 自适应
  window.addEventListener('resize', () => {
    // 初始化摄像机
    data.camera.aspect = window.innerWidth / window.innerHeight;
    data.camera.updateProjectionMatrix();
    // 初始化渲染器尺寸
    data.renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // data.scene.traverse((item) => {
  //   console.log(item);
  // });
  // 监听鼠标
  // window.addEventListener('mousemove', onRay);
  // window.addEventListener('click', onDocumentMouseDown);
  // 全局对象
  let lastPick = null;
  function onRay(event) {
    let pickPosition = setPickPosition(event);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pickPosition, data.camera);
    // 计算物体和射线的交点
    const intersects = raycaster.intersectObjects(data.scene.children, true);

    // 数组大于0 表示有相交对象
    if (intersects.length > 0) {
      if (lastPick) {
        lastPick.object.material.color.set('yellow');
      }
      lastPick = intersects[0];
    } else {
      if (lastPick) {
        // 复原
        lastPick.object.material.color.set(0x6688aa);
        lastPick = null;
      }
    }
  }
});
function setPickPosition(event) {
  let pickPosition = { x: 0, y: 0 };

  // 计算后 以画布 开始为 （0，0）点
  const pos = getCanvasRelativePosition(event);

  // 数据归一化
  pickPosition.x = (pos.x / threeEl.value.width) * 2 - 1;
  pickPosition.y = (pos.y / threeEl.value.height) * -2 + 1;

  return pickPosition;
}

// 计算 以画布 开始为（0，0）点 的鼠标坐标
function getCanvasRelativePosition(event) {
  const rect = threeData.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * threeEl.value.width) / rect.width,
    y: ((event.clientY - rect.top) * threeEl.value.height) / rect.height,
  };
}

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
  // threeData.appendChild(css2Renderer.domElement);

  // var labelRenderer = new THREE.CSS2DRenderer();

  // createLableText('text', { x: x, y: y, z: z });
  createLableImg('image/image (1).jpg', { x: x, y: y, z: z });
};
const labelInit = () => {
  var labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(width, height);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = 0;
  // labelRenderer.domElement.style.zIndex = -1;
  labelRenderer.domElement.style.pointerEvents = 'none';
  // dom .style.pointerEvents = 'auto';
  threeData.appendChild(labelRenderer.domElement);
  data.labelRenderer = labelRenderer;
};

// 文字
function createLableText(text, vector) {
  let laberDiv = document.createElement('div'); //创建div容器
  laberDiv.className = 'laber_name';
  laberDiv.textContent = text + '\n' + '余量：' + Math.random().toString(36).slice(-10);
  laberDiv.style.pointerEvents = 'auto';
  laberDiv.onclick = (e) => {
    handleReactivePointClick(laberDiv.textContent);
  };
  let pointLabel = new CSS2DObject(laberDiv);
  pointLabel.position.set(vector.x, vector.y, vector.z);
  data.scene.add(pointLabel);
  data.labelRenderer.render(data.scene, data.camera);
  // return pointLabel;
}

// 图片
function createLableImg(img, vector) {
  let laberDiv = document.createElement('div'); //创建div容器
  laberDiv.className = 'laber_name';
  // laberDiv.textContent = text + '\n' + '余量：' + Math.random().toString(36).slice(-10);
  let image = document.createElement('img');
  image.src = getImageUrl(img);
  // laberDiv.innerHTML = image;
  laberDiv.appendChild(image)
  laberDiv.style.pointerEvents = 'auto';
  laberDiv.onclick = (e) => {
    handleReactivePointClick(laberDiv.textContent);
  };
  let pointLabel = new CSS2DObject(laberDiv);
  pointLabel.position.set(vector.x, vector.y, vector.z);
  data.scene.add(pointLabel);
  data.labelRenderer.render(data.scene, data.camera);
  // return pointLabel;
}

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
    window.addEventListener('click', onDocumentMouseDown);
  } else {
    window.removeEventListener('click', onDocumentMouseDown);
  }
};
</script>

<style lang="less" scoped >
.three-map {
  width: 100%;
  height: 100%;
  position: absolute;
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
</style>
