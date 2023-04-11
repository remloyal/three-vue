import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
const app = createApp(App);

import './assets/font/iconfont.css';
// import './assets/index.less';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


app.use(ElementPlus);
app.use(createPinia());

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app');
