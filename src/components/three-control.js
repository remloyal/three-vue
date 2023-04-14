import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { mainStore } from '../store/index';
import { mixin, throttle, values } from 'lodash';

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
    // this.initGui(pointLabel);
  }
  initGui(pointLabel) {
    const gui = new GUI({ width: 310 });
    // panel.add(this.room.rotation, 'myBoolean')/
    // panel.add( this.controls, 'property' );
    // const folderLocal = gui.addFolder('pointLabel');
    // gui.add(pointLabel, 'position.x', -200, 200);
    const euler = new THREE.Euler(0, 0, 0, 'XYZ');
    gui.add(pointLabel.rotation, 'x', 0, 200).onChange((value) => {
      // console.log(value);
      // pointLabel.rotateX(`${value}deg`)
      euler.set(value, euler.y, euler.z);
      pointLabel.rotation.set(euler.x, euler.y, euler.z);
      this.labelRenderer.render(this.scene, this.camera);
      // console.log(pointLabel.rotation.x.set());
    });
    gui.add(pointLabel.rotation, 'y', 0, 200).onChange((value) => {
      // console.log(value);
      // pointLabel.rotateX(`${value}deg`)
      euler.set(euler.x, value, euler.z);
      pointLabel.rotation.set(euler.x, euler.y, euler.z);
      this.labelRenderer.render(this.scene, this.camera);
      // console.log(pointLabel.rotation.x.set());
    });
    gui.add(pointLabel.rotation, 'z', 0, 200).onChange((value) => {
      // console.log(value);
      // pointLabel.rotateX(`${value}deg`)
      euler.set(euler.x, value, euler.z);
      pointLabel.rotation.set(euler.x, euler.y, euler.z);
      this.labelRenderer.render(this.scene, this.camera);
      // console.log(pointLabel.rotation.x.set());
    });
    // function updateCamera() {
    //   this.camera.updateProjectionMatrix();
    // }
    // gui.add(this.camera, 'fov', 1, 180).onChange(updateCamera);
    // gui.add(this.camera, 'near', 1, 200).onChange(updateCamera);
    // gui.add(this.camera, 'far', 1, 200).onChange(updateCamera);
    // gui.add(new PositionGUI(pointLabel.rotation, 'x'), 'modify', 0, 200).name('x').onChange(value=>{
    //   pointLabel.rotateX(value)
    // });;
    // gui.add(pointLabel.rotation, 'rotationy', 0, 200).onChange(value=>{
    //   pointLabel.rotateY(value)
    // });;
    // gui.add(new PositionGUI(pointLabel.rotation, 'z'), 'modify', 0, 200).name('z').onChange(value=>{
    //   pointLabel.rotateZ(value)
    // });

    // panel.add( this.room.rotation, 'number', 0, 100, 1 );
    // panel.add( this.room.rotation, 'options', [ 1, 2, 3 ] );
  }

  deletePoint(data) {
    console.log('deletePoint', data);
    if (this.dropPoints[data.id]) {
      this.scene.remove(this.dropPoints[data.id]);
      delete this.dropPoints[data.id];
    }
  }
}

class PositionGUI {
  constructor(obj, name) {
    this.obj = obj;
    this.name = name;
  }
  get modify() {
    return this.obj[this.name];
  }
  set modify(v) {
    console.log(v, this.name);
    this.obj[this.name] = v;
    console.log(this.obj);
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
  mixin(obj) {
    if (Object.keys(obj).length > 0) {
      Object.keys(obj).map((item) => {
        this[item] = obj[item];
      });
    }
  }
  init(id) {
    this.threeEl = document.getElementById(id);
    this.scene = new THREE.Scene();
    //antialias:true 启用抗锯齿渲染
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.threeEl.appendChild(this.renderer.domElement);
    // 相机
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 0.1, 1500);
    var width = this.width * 4; //窗口宽度
    var height = this.height * 4; //窗口高度
    var k = (width / height) * 4; //窗口宽高比
    var s = 20;
    // this.camera = new THREE.OrthographicCamera(-width , width, height, -height, 1, width);
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
      // console.log(this.dropPoints);
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
    // this.controls.zoomSpeed = 5.0;

    // this.controls.addEventListener('change', this.controlRender);
    // 缩放限制
    this.controls.maxDistance = 180;
    // this.controls.minDistance = -50;
    // this.initGui()
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

    // var mouse = new THREE.Vector2(
    //   (event.clientX / threeCase.width) * 2 - 1,
    //   -(event.clientY / threeCase.height) * 2 + 1
    // );
    // console.log(mouse);

    var vector = new THREE.Vector3(); //三维坐标对象
    vector.set((event.clientX / threeCase.width) * 2 - 1, -(event.clientY / threeCase.height) * 2 + 1, 0.5);
    vector.unproject(threeCase.camera);
    var raycaster = new THREE.Raycaster(threeCase.camera.position, vector.sub(threeCase.camera.position).normalize());
    var intersects = raycaster.intersectObjects(threeCase.scene.children);
    console.log(intersects);

    const x = event.clientX;
    const y = event.clientY;
    const pos = new THREE.Vector3();
    console.log(threeCase.threeEl);
    pos.x = (x / threeCase.width) * 2;
    pos.y = -(y / threeCase.height) * 2;
    pos.z = 0.5;

    if (intersects.length > 0) {
      var selected = intersects[0]; //取第一个物体
      console.log('x坐标:' + selected.point.x);
      console.log('y坐标:' + selected.point.y);
      console.log('z坐标:' + selected.point.z);
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // 创建一个 Raycaster 对象
      const raycasters = new THREE.Raycaster();

      // 将鼠标位置转换为三维坐标
      raycasters.setFromCamera(mouse, threeCase.camera);
      const intersectsss = raycasters.intersectObjects(threeCase.scene.children);
      // let pickPosition = threeCase.setPickPosition(event);
      console.log(intersectsss[0].normal);
      let z;
      let x;
      let y;
      intersectsss.forEach((item) => {
        if (item.normal) {
          z = item.normal.z;
          x = item.normal.x;
          y = item.normal.y;
        }
      });
      threeCase.threeElEvent && threeCase.threeElEvent([x, y, z || 0]);
      // if (selected.normal) {
      // }else{
      //   threeCase.threeElEvent && threeCase.threeElEvent([selected.point.x, selected.point.y, selected.point.z]);
      // }

      // const x = event.clientX;
      // const y = event.clientY;
      // const pos = new THREE.Vector3();
      // pos.x = (x / window.innerWidth) * 2 - 1;
      // pos.y = -(y / window.innerHeight) * 2 + 1;
      // pos.z = 0.5;
      // this.drawData.geometry.setPositions([...this.drawData.geometry.attributes.position.array, ...pos.toArray()]);

      // threeCase.store.pointCoordinate = [selected.point.x, selected.point.y, selected.point.z];
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

// 动态绘制
export const drawFace = {
  drawInit() {
    var drawData = {
      index: 3,
    };
    // // 创建空的BufferGeometry对象
    // drawData.geometry = new THREE.BufferGeometry();

    // // 创建空的BufferAttribute对象
    // drawData.positionAttribute = new THREE.BufferAttribute(new Float32Array([]), 3);
    // // 将BufferAttribute对象添加到BufferGeometry对象中
    // drawData.geometry.setAttribute('position', drawData.positionAttribute);
    // // 创建PointsMaterial对象
    // drawData.material = new THREE.PointsMaterial({
    //   color: 0xffffff,
    //   size: 0.1,
    // });
    // // 创建Points对象
    // drawData.points = new THREE.Points(drawData.geometry, drawData.material);
    // this.scene.add(drawData.points);

    // 创建一个包含两个顶点的线段几何体
    // drawData.geometry = new THREE.LINE();
    // drawData.geometry.setPositions([0, 0, 0, 1, 1, 0]);
    // drawData.geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
    // drawData.geometry.vertices.push(new THREE.Vector3(0, 10, 0));
    // drawData.geometry.vertices.push(new THREE.Vector3(10, 0, 0));
    // 将几何体添加到场景中
    drawData.material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const points = [];
    points.push(new THREE.Vector3(-10, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));
    points.push(new THREE.Vector3(10, 0, 0));

    drawData.geometry = new THREE.BufferGeometry().setFromPoints(points);

    drawData.line = new THREE.Line(drawData.geometry, drawData.material);

    this.scene.add(drawData.line);
    this.drawData = drawData;

    this.threeEl.addEventListener('mousemove', onRay);
    function onRay(event) {
      // console.log(event);
      const mouse = new THREE.Vector3();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // 创建一个 Raycaster 对象
      const raycaster = new THREE.Raycaster(mouse);

      // 将鼠标位置转换为三维坐标
      // raycaster.setFromCamera(mouse, threeCase.camera);
      const intersects = raycaster.intersectObjects(threeCase.scene.children);
      // let pickPosition = threeCase.setPickPosition(event);
      console.log(intersects[0].point);
      // const raycaster = new THREE.Raycaster();
      // raycaster.setFromCamera(pickPosition, threeCase.camera);
      // // 计算物体和射线的交点
      // const intersects = raycaster.intersectObjects(threeCase.scene.children, true);
      // // const labelRenderer = raycaster.intersectObjects([threeCase.room]);
      // console.log(intersects);
      // // 数组大于0 表示有相交对象
      // if (intersects.length > 0) {
      //   if (lastPick) {
      //     lastPick.object.material.color.set('yellow');
      //   }
      //   threeCase.lastPick = intersects[0];
      // } else {
      //   if (lastPick) {
      //     // 复原
      //     threeCase.lastPick.object.material.color.set(0x6688aa);
      //     threeCase.lastPick = null;
      //   }
      // }
    }

    const geometry = new THREE.BufferGeometry();

    // 定义顶点数组、颜色数组和 UV 坐标数组
    const vertices = new Float32Array([-1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0]);
    const colors = new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0]);
    const uvs = new Float32Array([0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);

    // 将顶点、颜色和 UV 坐标属性添加到 BufferGeometry 对象中
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // 定义面的索引数组并将其添加到 BufferGeometry 对象中
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    // 创建一个 Mesh 对象来渲染几何体
    const material = new THREE.MeshBasicMaterial({ vertexColors: true,side: THREE.DoubleSide, });
    const mesh = new THREE.Mesh(geometry, material);

    // 将 Mesh 对象添加到场景中进行渲染
    drawData.Mesh = mesh
    this.scene.add(mesh);
  },
};
