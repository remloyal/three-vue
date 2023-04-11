import { defineStore } from 'pinia';

// useStore 可以是 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的唯一 id
const state = {
  map: null,
  iconPoint: {},
  cameraPoints:[],
  pointCoordinate:[]
};

export const mainStore = defineStore('main', {
  // other options...
  state: () => {
    return state;
  },
  actions: {},
});
