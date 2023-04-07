import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export class ThreeControl {
  threeEl = null;
  scene = null;
  sphere = null;
  camera = null;
  renderer = null;
  controls = null;
  labelRenderer = null;
  // constructor(id, width, height) {
  //   this.width = width;
  //   this.height = height;
  //   this.init(id);
  // }
  createInit(id, width, height) {
    this.width = width;
    this.height = height;
    this.init(id);
  }
  init(id) {
    this.threeEl = document.getElementById(id);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.threeEl.appendChild(this.renderer.domElement);
    // 相机
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 0.1, 1500);
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer.render(this.scene, this.camera);
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x3c3c3c);
    // 将环境光添加到场景中
    this.scene.add(ambientLight);
    // 聚光灯
    const spotLight = new THREE.SpotLight(0xffffff, 1, 150, 120);
    spotLight.position.set(-40, 60, -10);
    // 将聚光灯添加到场景中
    this.scene.add(spotLight);

    // 摄影机空间Z轴
    // this.camera.position.set(2, 0, 0);
    // this.camera.lookAt(this.scene.position);

    // 动画
    const tick = () => {
      this.controls && this.controls.update();
      TWEEN && TWEEN.update();
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(tick);
    };
    tick();

    this.labelInit();
    this.animate();
    this.resize();

    // 场景控制
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();
    this.controls.target.set(0, 0, 0);
    this.controls.addEventListener('change', () => {
      this.renderer.render(this.scene, this.camera);
    });
    // 转动惯性
    this.controls.enableDamping = true;
    // 禁止平移
    this.controls.enablePan = true;
    // 缩放限制
    // this.controls.maxDistance = 160;
    // this.controls.minDistance = -50;
  }
  getImageUrl(name) {
    return new URL(`../assets/${name}`, import.meta.url).href;
  }
  // 加载全景图
  foundSpherome(imgUrl) {
    console.log(imgUrl);
    let image = this.getImageUrl(imgUrl || '地拍/2 一层门口.jpg');
    const geometry = new THREE.SphereGeometry(16, 256, 256);
    let texture = new THREE.TextureLoader().load(imgUrl || image);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    });
    geometry.scale(10, 10, 10);
    this.room = new THREE.Mesh(geometry, material);
    this.scene.add(this.room);
    // setTimeout(()=>{
    //   data.scene.remove(data.room)
    //   data.renderer.render(data.scene, data.camera)
    // },10000)
    // setTimeout(()=>{
    //   foundSpherome();
    // },15000)
  }

  // 初始化CSS2 层
  labelInit = () => {
    var labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(this.width, this.height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = 0;
    // labelRenderer.domElement.style.zIndex = -1;
    labelRenderer.domElement.style.pointerEvents = 'none';
    // dom .style.pointerEvents = 'auto';
    this.threeEl.appendChild(labelRenderer.domElement);
    this.labelRenderer = labelRenderer;
  };

  //控制更新
  animate = () => {
    requestAnimationFrame(this.animate);
    // 渲染场景
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  };
  // 自适应
  resize() {
    // 自适应
    window.addEventListener('resize', () => {
      // 初始化摄像机
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      // 初始化渲染器尺寸
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // 文字
  createLableText(text, vector, click) {
    let laberDiv = document.createElement('div'); //创建div容器
    laberDiv.className = 'laber_name';
    laberDiv.textContent = text + '\n' + Math.random().toString(36).slice(-10);
    laberDiv.style.pointerEvents = 'auto';
    laberDiv.onclick = click;
    let pointLabel = new CSS2DObject(laberDiv);
    pointLabel.position.set(vector.x, vector.y, vector.z);
    this.scene.add(pointLabel);
    this.labelRenderer.render(this.scene, this.camera);
    // return pointLabel;
  }
  // 图片
  createLableImg(img, vector , click) {
    let laberDiv = document.createElement('div'); //创建div容器
    laberDiv.className = 'laber_img';
    let image = document.createElement('img');
    image.src = this.getImageUrl(img);
    laberDiv.appendChild(image);
    laberDiv.style.pointerEvents = 'auto';
    laberDiv.onclick = click;
    let pointLabel = new CSS2DObject(laberDiv);
    pointLabel.position.set(vector.x, vector.y, vector.z);
    this.scene.add(pointLabel);
    this.labelRenderer.render(this.scene, this.camera);
  }

  // Raycaster计算
  getCanvasRelativePosition(event) {
    const rect = this.threeEl.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * this.width) / rect.width,
      y: ((event.clientY - rect.top) * this.height) / rect.height,
    };
  }
  setPickPosition(event) {
    let pickPosition = { x: 0, y: 0 };

    // 计算后 以画布 开始为 （0，0）点
    const pos = this.getCanvasRelativePosition(event);

    // 数据归一化
    pickPosition.x = (pos.x / this.width) * 2 - 1;
    pickPosition.y = (pos.y / this.height) * -2 + 1;

    return pickPosition;
  }
}

export const threeCase = new ThreeControl();
