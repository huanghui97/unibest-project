<template>
    <wd-tabbar v-model="tabbar" class="tab" @change="whenTagChange">
    <wd-tabbar-item title="首页" icon="home"></wd-tabbar-item>
    <wd-tabbar-item title="分类" icon="cart"></wd-tabbar-item>
    <wd-tabbar-item title="我的" icon="user"></wd-tabbar-item>
  </wd-tabbar>
</template>

<script setup>
import {onMounted} from 'vue'
import pagesConfig from '@/pages.json'

console.log(pagesConfig)

onMounted(() => {
    // 获取当前页面栈
const pages = getCurrentPages();
// 获取当前页面实例
const currentPage = pages[pages.length - 1];
console.log(pages)
})
const tabbar=ref(1)
function whenTagChange(){
  if(tabbar.value==2){
    uni.navigateTo({url: "/pages/login/index"})

  }
}
</script>

<style>
.tab {

}
</style>