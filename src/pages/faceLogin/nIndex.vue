<route lang="json5" type="home">
{
  style: {
    navigationBarTitleText: '人脸登录',
    navigationStyle: 'custom',
  },
}
</route>
<template>
  <view class="w-full h-full">
    <view v-if="!state.cilckSwitch" class="w-full h-full flex flex-col items-center container">
      <view class="pt-35%"></view>
      <view class="flex flex-1 flex-col items-center mt-20%">
        <view class="text-[28rpx] font-bold mt-30rpx" @click="toCamera">人脸识别认证登录</view>
      </view>
    </view>
    <view
      v-if="state.cilckSwitch"
      class="w-full h-full flex flex-col items-center"
      style="background-color: #ffffff"
    >
      <view
        class="w-full text-center color-[#666666] font-bold text-[38rpx] mt-160rpx"
        v-if="!state.reMonitoring"
        style="color: #666666"
      >
        请面向屏幕
      </view>
      <view v-if="state.reMonitoring" class="mb-15rpx flex-1 flex flex-col items-center mt-170rpx">
        <view class="text-[#000000] text-[38rpx] font-bold mt-30rpx" style="color: #000000">
          {{ state.errorMessage || '人脸对比失败！' }}
        </view>
      </view>
      <view class="flex-shrink-0 flex flex-row justify-center items-center mb-100rpx">
        <view
          class="re-button"
          @click="resetCamera"
          v-if="
            state.reMonitoring &&
            state.errorMessage != '原始录入图片检测不到人脸，请重新录入' &&
            state.errorMessage != '原始录入图片检测到多张人脸，请重新录入'
          "
        >
          再试一次
        </view>
      </view>
    </view>
    <canvas
      canvas-id="myCanvas"
      style="
        width: 400px;
        height: 300px;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        pointer-events: none;
      "
    ></canvas>
    <wd-message-box />
  </view>
</template>
<script setup lang="ts">
import permission from '@/utils/permission'
import { reactive } from 'vue'
import { useUserStore } from '@/store/user'
import { useMessage } from 'wot-design-uni'
const message = useMessage()
const userStore = useUserStore()
const { proxy } = getCurrentInstance()
const { safeAreaInsets } = uni.getSystemInfoSync()
uni.$on('update', function (data) {
  console.log('监听到事件来自 update ，携带参数 msg 为：' + data.msg)
})
const state = reactive({
  type: '', //是否是补签拉起的人脸识别
  imgData: '',
  pusher: null,
  scanWin: null,
  winLoading: null,
  faceInitTimeout: null,
  snapshTimeout: null,
  uploadFileTask: null,
  cilckSwitch: false, //防止多次点击
  count: 3,
  intervalTimer: null, //倒计时
  reMonitoring: false, //是否重新检测中
  errorMessage: '',
  reqLoading: false,
  mode: 'SD',
})
const basicInfo = ref({})
const redirectRoute = ref(null)
onHide(() => {
  state.count = 3
  state.pusher?.close()
  state.winLoading?.hide()
  state.scanWin?.hide()
  state.cilckSwitch = false
})
const selectInfo = ref({
  name: '',
  idCard: '',
})
function pickerConfirm({ value, selectedItems }) {
  selectInfo.value.idCard = value
  selectInfo.value.name = selectedItems.label
}
let testModule = {}
function statechange(e) {
  console.log('statechange:' + JSON.stringify(e))
}
function netstatus(e) {
  console.log('netstatus:' + JSON.stringify(e))
}
function error(e) {
  console.log('error:' + JSON.stringify(e))
}
async function resetCamera() {
  state.reMonitoring = false
  state.imgData = ''
  await nextTick()
  state.pusher?.close()
  pusherInit()
}
function toLoginPassword() {
  uni.navigateTo({
    url: '/pages/login/index',
  })
}
async function toCamera() {
  uni.navigateTo({
    url: '/pages/faceLogin/camera',
  })
  return
}
//开始倒计时
function beginSetTimeout() {
  state.count = 3
  state.reMonitoring = false
  state.intervalTimer = setInterval(() => {
    if (state.count > 1) {
      state.count-- // 每秒减1
    } else {
      clearInterval(state.intervalTimer) // 清除倒计时

      // 倒计时结束时的操作
      snapshotPusher()
    }
  }, 1000)
}
//获取图片base64
function getMinImage(imgPath) {
  state.pusher.stop()
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
        reader.onloadend = async (res) => {
          var speech = (res.target as any).result //base64图片
          const base64 = await rotateImage(speech, 'myCanvas')
          state.imgData = base64 as string
          pkiReq()
        }
        reader.readAsDataURL(plus.io.convertLocalFileSystemURL(zipRes.target) as any)
      }, 500)
    },
    function (error) {
      console.log('Compress error!', error)
    },
  )
}
function removeBase64Prefix(base64Str) {
  if (typeof base64Str !== 'string') {
    console.warn('输入不是有效的字符串')
    return base64Str
  }
  // 匹配 base64 前缀的正则（支持任意图片格式，如 jpeg、png、gif 等）
  const prefixRegex = /^data:image\/\w+;base64,/
  // 替换前缀为空字符串
  return base64Str.replace(prefixRegex, '')
}
function rotateImage(base64Img, canvasId) {
  console.log({ base64Img: base64Img }, 'rotateImage-base64Img')
  return new Promise(async (resolve, reject) => {
    const ctx = uni.createCanvasContext(canvasId, proxy)
    // ctx.drawImage(base64Img, 0, 0, 300, 400)
    ctx.translate(0, 300)
    ctx.rotate(-Math.PI / 2)
    ctx.drawImage(base64Img, 0, 0, 300, 300)
    ctx.draw(false, async () => {
      const res = (await uni.canvasToTempFilePath({ canvasId: canvasId }, proxy)) as any

      const path = plus.io.convertLocalFileSystemURL(res.tempFilePath)
      //console.log('>>>', path)
      const fileReader = new plus.io.FileReader()
      fileReader.readAsDataURL(path as any)
      fileReader.onloadend = (res) => {
        //console.log('>>>', res)
        const base64 = (res.target as any).result
        resolve(base64)
      }
    })
  })
}
async function pkiReq() {
  state.pusher.close()
  state.winLoading.close()
  state.scanWin.close()
  const res = {
    success: false,
    data: {
      status: 400,
      message: '人脸识别失败',
    },
  }
  if (res.success) {
    const targetUrl = redirectRoute.value || '/pages/homeWork/index'
    uni.reLaunch({ url: targetUrl })
  } else {
    state.reMonitoring = true
    const data = res.data
    //console.log(data,'data')
    if (data.status == 400) {
      state.errorMessage = data.message
    }
  }
}
//快照
function snapshotPusher() {
  if (state.winLoading) {
    state.winLoading.close()
    state.winLoading = null
  }
  //覆盖在视频之上的内容，根据实际情况编写
  state.winLoading = plus.webview.create(
    `/static/faceLoading.html?w=${uni.upx2px(300)}&h=${uni.upx2px(300)}&left=${uni.upx2px(225)}&top=${safeAreaInsets.top}`,
    '',
    {
      background: 'transparent',
      // borderRaduis: '50%',
      // border: '1px solid #fff',
      top: safeAreaInsets.top + uni.upx2px(435) + 'px',
      left: uni.upx2px(305) + 'px',
      width: uni.upx2px(300) + 'px',
      height: uni.upx2px(300) + 'px',
      position: 'absolute',
    },
  )
  //新引入的webView显示
  state.winLoading.show()

  state.snapshTimeout = setTimeout(() => {
    state.pusher.snapshot(
      (e) => {
        //拿到本地文件路径
        var src = e.tempImagePath
        // uploadImg(src)
        //获取图片base64
        getMinImage(src)
        //console.log(srcBase64,'srcBase64')
      },
      function (e) {
        plus.nativeUI.alert('snapshot error: ' + JSON.stringify(e))
        state.cilckSwitch = false
        uni.hideLoading()
      },
    )
  }, 100)
}
function scanWinInit() {
  if (state.scanWin) {
    state.scanWin.close()
    state.scanWin = null
  }
  //覆盖在视频之上的内容，根据实际情况编写
  state.scanWin = plus.webview.create(
    `/static/face.html?w=${uni.upx2px(300)}&h=${uni.upx2px(300)}&left=${uni.upx2px(225)}&top=${safeAreaInsets.top}`,
    '',
    {
      background: 'transparent',
      // borderRaduis: '50%',
      // border: '1px solid #fff',
      top: safeAreaInsets.top + uni.upx2px(245) + 'px',
      left: uni.upx2px(75) + 'px',
      width: uni.upx2px(600) + 'px',
      height: uni.upx2px(600) + 'px',
      position: 'absolute',
    },
  )
  // //新引入的webView显示
  state.scanWin.show()
}
async function pusherInit() {
  scanWinInit()
  state.pusher = uni.createLivePusherContext('livePusher', proxy)
}
//根据屏幕分辨率和像素比确定像素级别
function getPixelLevel() {
  try {
    const systemInfo = uni.getSystemInfoSync()

    // 关键参数
    const {
      screenWidth, // 屏幕逻辑宽度（px）
      screenHeight, // 屏幕逻辑高度（px）
      pixelRatio, // 像素比（物理像素 / 逻辑像素）
    } = systemInfo

    // 计算物理宽度（取屏幕宽度，竖屏状态下更能反映清晰度等级）
    const physicalWidth = screenWidth * pixelRatio
    // 计算物理高度（辅助信息）
    const physicalHeight = screenHeight * pixelRatio
    // 定义像素级别划分标准（可根据需求调整）
    let mode = 'SD' // 低清
    if (physicalWidth >= 1440) {
      mode = 'HD' // 超清（如 2K+/4K）
    } else if (physicalWidth >= 1080) {
      mode = 'HD' // 高清（如 1080p）
    } else if (physicalWidth >= 720) {
      mode = 'SD' // 标清（如 720p）
    }

    return mode
  } catch (e) {
    console.error('获取像素级别失败：', e)
    return 'SD' // 异常时默认标清
  }
}
//初始化
function faceInit() {
  uni.showLoading({ title: '请稍等' })
  state.faceInitTimeout = setTimeout(async () => {
    pusherInit()
    //创建livepusher
  }, 500)
}

function destroyPusher() {
  let pusher = state.pusher
  if (!pusher) return // 已销毁或未初始化，直接返回
  try {
    // 1. 停止推流（若正在推流）
    if (pusher.status === 'started') {
      // 检查推流状态
      pusher.stop()
    }

    // 2. 停止预览，释放摄像头/麦克风
    //pusher?.stopPreview();

    // 3. 从页面中移除推流组件
    const parentWebview = plus.webview.currentWebview() // 获取当前页面Webview
    parentWebview.remove(pusher) // 移除推流组件

    // 4. 清空引用，彻底释放
    pusher = null
    state.pusher = null // 若保存在状态中，同步清空

    console.log('推流实例已彻底销毁')
  } catch (e) {
    console.error('销毁推流实例失败：', e)
  }
}
onLoad((option) => {
  console.log('nIndex')

  state.mode = getPixelLevel()
  if (option.redirect) {
    redirectRoute.value = option.redirect
  }
})
onUnmounted(() => {
  destroyPusher()
  state.winLoading?.close()
  state.scanWin?.close()
})
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  //background-image: url('/static/images/face-login-bg.png');
  background-repeat: no-repeat;
  background-color: #f9f9f9;
  background-size: 100% 100%;
  background-position: center;
  position: relative;
}
.count {
  font-size: 40rpx;
  margin-top: 15rpx;
  color: #e6a23c;
  font-weight: bolder;
}
.img {
  width: 500rpx;
  height: 500rpx;
  display: block;
  flex-shrink: 0;
  margin-bottom: 10rpx;
  margin-top: 10rpx;
  //border-radius: 50%;
  //transform: rotate(-90deg);
}
.choice {
  position: absolute;
  left: 10rpx;
  right: 10rpx;
}
.re-button {
  padding: 15rpx 40rpx;
  background-color: #f2f2f2;
  color: #585858;
  margin-bottom: 15rpx;
  font-size: 36rpx;
}
</style>
