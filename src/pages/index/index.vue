<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
  needLogin: true,
  needTabbar: false,
}
</route>
<template>
  <view class="bg-white overflow-hidden bg-#ff00ff flex flex-col h-full" @click="closeOutside">
    <view class="w-full">
      <TextCollapse
        :text="'一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字一串很长的文字这是文字的结尾'"
        :n="3"
      />
    </view>
    <!-- <choice-area/> -->
    <!-- <view class="flex-1 bg-#ff0000" @click="goPdf"></view> -->
    <tabbar page="index" />
  </view>
</template>

<script lang="ts" setup>
import TextCollapse from '@/components/common/TextCollapse.vue'
import PLATFORM from '@/utils/platform'
import { useQueue } from 'wot-design-uni'
const { closeOutside } = useQueue()
defineOptions({
  name: 'Home',
})

// 获取屏幕边界到安全区域距离
let safeAreaInsets
// #ifdef MP-WEIXIN
// 微信小程序使用新的API
const systemInfo = wx.getWindowInfo()
safeAreaInsets = systemInfo.safeArea
  ? {
      top: systemInfo.safeArea.top,
      right: systemInfo.windowWidth - systemInfo.safeArea.right,
      bottom: systemInfo.windowHeight - systemInfo.safeArea.bottom,
      left: systemInfo.safeArea.left,
    }
  : null
// #endif

// #ifndef MP-WEIXIN
// 其他平台继续使用uni API
const systemInfo = uni.getSystemInfoSync()
safeAreaInsets = systemInfo.safeAreaInsets
// #endif
const author = ref('菲鸽')
const description = ref(
  'unibest 是一个集成了多种工具和技术的 uniapp 开发模板，由 uniapp + Vue3 + Ts + Vite6 + UnoCss + VSCode 构建，模板具有代码提示、自动格式化、统一配置、代码片段等功能，并内置了许多常用的基本组件和基本功能，让你编写 uniapp 拥有 best 体验。',
)
const goPdf = () => {
  uni.navigateTo({
    url: '/pages/pdf/index?pdfUrl=http://192.168.31.204:3000/2023.pdf',
  })
}
// 测试 uni API 自动引入
onLoad(() => {
  console.log('项目作者:', author.value)
})
</script>

<style>
.main-title-color {
  color: #d14328;
}

.container {
  background-color: #d14328;
}
</style>
