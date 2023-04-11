import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { mainStore } from '../store/index';
import { throttle } from 'lodash';

class Drop {
  // 点集合
  dropPoints = {};

  revisePoint([x, y, z], id) {
    this.dropPoints[id].position.set(x, y, z);
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
  createLableImg(img, vector, click) {
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

  // Icon
  createLableIcon(point, event = null) {
    let laberDiv = document.createElement('div'); //创建div容器
    laberDiv.className = 'laber_icon';
    // let image = document.createElement('img');
    // image.src = this.getImageUrl(img);
    let mould = `
    <div id='${point.id}' style='transform: rotateX(${point.revolve.x}deg) rotateY(${point.revolve.y || 0}deg) rotateZ(${point.revolve.z || 0}deg)'>
      <span class="iconfont ${point.icon}" style='font-size: ${point.size || 36}px;'></span>
    </div>
    `;
    laberDiv.innerHTML = mould;
    laberDiv.style.pointerEvents = 'auto';
    if (event) {
      laberDiv.onclick = event;
    }
    let pointLabel = new CSS2DObject(laberDiv);
    pointLabel.position.set(point.position[0], point.position[1], point.position[2]);
    this.scene.add(pointLabel);
    this.labelRenderer.render(this.scene, this.camera);
    // console.log(pointLabel);
    this.dropPoints[point.id] = pointLabel;
  }
}

export class ThreeControl extends Drop {
  threeEl = null;
  scene = null;
  sphere = null;
  camera = null;
  renderer = null;
  controls = null;
  labelRenderer = null;
  cameraPoints = null;
  // constructor(id, width, height) {
  //   this.width = width;
  //   this.height = height;
  //   this.init(id);
  // }
  createInit(id, width, height) {
    this.width = width;
    this.height = height;
    this.init(id);
    this.store = mainStore();
    this.renewCameraPoints = throttle(() => {
      this.store.cameraPoints = this.cameraPoints;
    }, 500);
  }
  init(id) {
    this.threeEl = document.getElementById(id);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.threeEl.appendChild(this.renderer.domElement);
    // 相机
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 0.1, 1500);
    // this.camera = new THREE.PerspectiveCamera(this.width/10, - this.width/this.width, this.height/12, -this.height/this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 0);
    this.cameraVector3 = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(this.cameraVector3);

    this.renderer.render(this.scene, this.camera);

    // 相机辅助线
    // const cameraHelper = new THREE.CameraHelper(this.camera)
    // this.scene.add(cameraHelper)

    // 环境光
    const ambientLight = new THREE.AmbientLight(0x3c3c3c, 1);
    // 将环境光添加到场景中
    this.scene.add(ambientLight);
    // 聚光灯
    // const spotLight = new THREE.SpotLight(0xffffff, 1, 150, 120);
    // spotLight.position.set(-40, 60, -10);
    // // 将聚光灯添加到场景中
    // this.scene.add(spotLight);

    // 摄影机空间Z轴
    // this.camera.position.set(2, 0, 0);
    // this.camera.lookAt(this.scene.position);

    // 动画
    // const tick = () => {
    //   this.controls && this.controls.update();
    //   TWEEN && TWEEN.update();
    //   this.renderer.render(this.scene, this.camera);
    //   window.requestAnimationFrame(tick);
    // };
    // tick();

    this.labelInit();
    this.animate();
    this.resize();

    // 场景控制
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, -1);
    this.controls.update();
    this.controls.addEventListener('change', () => {
      this.renderer.render(this.scene, this.camera);
      let cameraPoints = this.camera.getWorldDirection(this.cameraVector3);
      this.cameraPoints = [cameraPoints.x, cameraPoints.y, cameraPoints.z];
      this.renewCameraPoints();
      // console.log(this.room.toJSON());
    });
    // 转动惯性
    this.controls.enableDamping = true;
    // 禁止平移
    // this.controls.enablePan = true;
    // this.controls.minDistance = 0.01;
    // this.controls.maxDistance = 500;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 5.0;

    // this.controls.addEventListener('change', this.controlRender);
    // 缩放限制
    this.controls.maxDistance = 180;
    // this.controls.minDistance = -50;
  }
  controlRender(event) {
    //相机位置与目标观察点距离
    console.log('controlRender', event);
    const dis = event.target.getDistance();
    console.log('dis', dis);
    // this.renderer.render(this.scene, this.camera);
  }
  getImageUrl(name) {
    return new URL(`../assets/${name}`, import.meta.url).href;
  }
  // 加载全景图
  foundSpherome(imgUrl) {
    console.log(imgUrl);
    let image = this.getImageUrl(imgUrl || '博物馆航拍150M.JPG');
    this.geometry = new THREE.SphereGeometry(100, 256, 256);
    let texture = new THREE.TextureLoader().load(imgUrl || image);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    // material.customProgramCacheKey =
    // geometry.scale(10, 10, 10);
    this.room = new THREE.Mesh(this.geometry, material);
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
    this.controls && this.controls.update();
    // TWEEN && TWEEN.update();
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

  onDocumentMouseDown(event) {
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
      threeCase.threeElEvent([selected.point.x, selected.point.y, selected.point.z]);
      threeCase.store.pointCoordinate = [selected.point.x, selected.point.y, selected.point.z];
    }
  }
  // .threeEl.addEventListener('click', onDocumentMouseDown);
  addEventcClick(scene = function () {}) {
    this.threeElEvent = scene;
    this.threeEl.addEventListener('click', this.onDocumentMouseDown);
  }
  removeEventcClick(scene) {
    this.threeElEvent = null;
    this.threeEl.removeEventListener('click', this.onDocumentMouseDown);
  }
}

export const threeCase = new ThreeControl();
