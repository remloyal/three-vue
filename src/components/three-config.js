export const pointMould = {
  // 房间
  room: {
    id: '',
    name: '7 二层长廊',
    // map: new URL('@/assets/images/map/map_living_room.jpg', import.meta.url).href,
    toMap: null,
    mainBody:false,
    // toMap: new URL('../assets//地拍/7 二层长廊.jpg', import.meta.url).href,
    interactivePoints: [],
  },

  // icon点
  iconPoint: {
    name: '冰箱',
    icon: 'icon-fangxiangyuanjiantou-xiangshang',
    // 旋转角度
    revolve: {
      x: 45,
      y: 0,
      z:0
    },
    size:'',
    toMap:'',
    // toMap: new URL('@/assets/images/home/cover_living_room_fridge.png', import.meta.url).href,
    position: [], // x y z
  },
};

