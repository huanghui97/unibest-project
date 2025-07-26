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
  <view class="bg-white overflow-hidden h-100vh"></view>
</template>

<script>
const plugin = uni.requireNativePlugin('Pdf-Plugin')

export default {
  data() {
    return {}
  },
  onLoad() {
    plugin.showPdf({
      title: '名称',
      url: 'http://192.168.31.204:3000/2023.pdf',
      maxScale: '20',
      waterMark: '这是水印',
    })
  },
  methods: {},
}
</script>

<style>
.main-title-color {
  color: #d14328;
}
</style>
