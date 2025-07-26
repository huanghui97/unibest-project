<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>
<template>
  <view class="bg-white overflow-hidden h-100vh">
    <!-- <BaseMap :graph-data="data" /> -->
    <!-- <web-view src="hybrid/html/pdf-preview.html" /> -->
  </view>
</template>

<script lang="ts" setup>
// import BaseMap from '@/components/base-map.vue'

// const data = ref([
//   {
//     type: 'Circle',
//     data: { center: [104.065735, 30.575366], radius: 5000 },
//   },
// ])
const scanWin = ref(null)
const pdfUrl = ref('http://192.168.31.204:3000/2023.pdf')
//const allUrl = ref(`hybrid/html/pdf-preview.html?pdfUrl=${encodeURIComponent(pdfUrl.value)}`)
const allUrl = ref('')
onMounted(() => {
  console.log(allUrl.value)
  const info = uni.getSystemInfoSync()
  const safeAreaInsets = info.safeAreaInsets
  const screen = plus.screen
  const width = screen.resolutionWidth // 屏幕宽度（像素）
  const height = screen.resolutionHeight // 屏幕高度（像素）
  console.log(width, height)
  setTimeout(() => {
    scanWin.value = plus.webview.create(allUrl.value, '', {
      background: 'transparent',
      top: safeAreaInsets.top + uni.upx2px(50) + 'px',
      //width: width+'px',
      //height: (height - safeAreaInsets.top - uni.upx2px(50))+'px',
      left: '0px',
      right: '0ox',
      bottom: '0px',
      // position: 'absolute',
    })
    //新引入的webView显示
    scanWin.value.show()
  }, 1000)
})
onUnmounted(() => {
  scanWin.value.close()
})
onLoad((options) => {
  pdfUrl.value = options.pdfUrl
  allUrl.value = `hybrid/html/pdf-preview.html?pdfUrl=${encodeURIComponent(pdfUrl.value)}`
})
</script>

<style>
.main-title-color {
  color: #d14328;
}
</style>
