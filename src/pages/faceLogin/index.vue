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
  <view
    class="bg-white flex-col flex overflow-y-auto h-100vh"
    :style="{
      paddingTop: safeAreaInsets.top + 'px',
    }"
  >
    <view class="content-box h-700rpx flex-shrink-0 w-700rpx mx-auto"></view>
    <img :src="state.imgData" alt="" class="w-700rpx h-700rpx mx-auto block flex-shrink-0" />

    <wd-button class="but flex-shrink-0" @click="snapshotPusher" v-if="!state.cilckSwitch">
      采集本人人脸
    </wd-button>
  </view>
</template>

<script lang="ts" setup>
import permission from '@/utils/permission'
import { reactive } from 'vue'

const { safeAreaInsets } = uni.getSystemInfoSync()
const state = reactive({
  type: '', //是否是补签拉起的人脸识别
  imgData: '',
  pusher: null,
  scanWin: null,
  faceInitTimeout: null,
  snapshTimeout: null,
  uploadFileTask: null,
  cilckSwitch: false, //防止多次点击
})
//初始化
function faceInit() {
  state.faceInitTimeout = setTimeout(async () => {
    //创建livepusher
    if (uni.getSystemInfoSync().platform === 'android') {
      const data1 = await permission.requestAndroidPermission('android.permission.RECORD_AUDIO')
      const data2 = await permission.requestAndroidPermission('android.permission.CAMERA')
      console.log(data1, data2, 1111)
      if (data1 == 1 && data2 == 1) {
        pusherInit()
      }
    } else {
      pusherInit()
    }

    //覆盖在视频之上的内容，根据实际情况编写
    state.scanWin = plus.webview.create(
      `/static/face.html?w=${uni.upx2px(300)}&h=${uni.upx2px(300)}&left=${uni.upx2px(225)}&top=${safeAreaInsets.top}`,
      '',
      {
        background: 'transparent',
        // borderRaduis: '50%',
        // border: '1px solid #fff',
        top: safeAreaInsets.top + 'px',
        left: uni.upx2px(225) + 'px',
        width: uni.upx2px(300) + 'px',
        height: uni.upx2px(300) + 'px',
        position: 'absolute',
      },
    )
    //新引入的webView显示
    state.scanWin.show()

    //初始化上传本地文件的api
    // initUploader()
  }, 500)
}
//初始化播放器
function pusherInit() {
  let pages = getCurrentPages()
  let page = pages[pages.length - 1]
  let ws = page.$getAppWebview()
  const currentWebview = ws
  state.pusher = plus.video.createLivePusher('livepusher', {
    url: '',
    top: safeAreaInsets.top + 'px',
    left: uni.upx2px(225) + 'px',
    width: uni.upx2px(300) + 'px',
    height: uni.upx2px(300) + 'px',
    position: 'absolute',
    aspect: '1:1',
    muted: true,
    mode: 'HD',
  })
  currentWebview.append(state.pusher)
  //反转摄像头

  //开始预览
  setTimeout(() => {
    state.pusher.preview()
    state.pusher.switchCamera()
  }, 1000)
}

//快照
function snapshotPusher() {
  if (state.cilckSwitch) {
    uni.showToast({
      title: '请勿频繁点击',
      icon: 'none',
    })
    return
  }
  state.cilckSwitch = true
  uni.showLoading({
    title: '正在比对，请勿退出',
  })
  console.log(22222)

  state.snapshTimeout = setTimeout(() => {
    state.pusher.snapshot(
      (e) => {
        console.log(33333)

        state.pusher.close()
        // this.scanWin.hide();
        //拿到本地文件路径
        var src = e.tempImagePath
        console.log(src)
        // uploadImg(src)
        //获取图片base64
        getMinImage(src)
        uni.hideLoading()
      },
      function (e) {
        plus.nativeUI.alert('snapshot error: ' + JSON.stringify(e))
        state.cilckSwitch = false
        uni.hideLoading()
      },
    )
  }, 500)
}
//调用原生能力读取本地文件并上传
function uploadImg(imgPath) {
  state.uploadFileTask.addFile('file://' + imgPath, {
    key: 'file', // 填入图片文件对应的字段名
  })
  //添加其他表单字段（参数） 两个参数可能都只支持传字符串
  // uploadFileTask.addData("参数名", 参数值);
  state.uploadFileTask.start()
}
//获取图片base64
function getMinImage(imgPath) {
  plus.zip.compressImage(
    {
      src: imgPath,
      dst: imgPath,
      overwrite: true,
      quality: 40,
    },
    (zipRes) => {
      setTimeout(() => {
        var reader = new plus.io.FileReader()
        reader.onloadend = (res) => {
          console.log(res)
          var speech = (res.target as any).result //base64图片
          console.log(speech.length)
          state.imgData = speech
        }
        reader.readAsDataURL(plus.io.convertLocalFileSystemURL(zipRes.target) as any)
      }, 1000)
    },
    function (error) {
      console.log('Compress error!', error)
    },
  )
}

onLoad(() => {
  faceInit()
})
</script>

<style>
.main-title-color {
  color: #d14328;
}
.gaiimg {
  width: 462px;
  height: 350px;
  position: absolute;
  top: 200px;
}
</style>
