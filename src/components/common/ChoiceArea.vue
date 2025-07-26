<template>
    <view>
      <wd-popover use-content-slot>
        <template #content>
          <view class="tags">
            <view v-for="item in areaList" :key="item.id" :class="{active:item.id==tabArea}" class="tag" @click="tagClick(item.id)">{{ item.label }}</view>
          </view>
        </template>
        <wd-icon name="arrow-right" size="22px"></wd-icon>
      </wd-popover>
    </view>
</template>

<script setup>
const areaList=ref([
  {id:1,label:'北京'},
  {id:2,label:'上海'},
  {id:3,label:'广州'}
])
const tabArea=ref(null)
const tagClick=(tag)=>{
  tabArea.value=tag
}

</script>

<style>
.div{
  position: relative;
}
.tags{
  display: flex;
  flex-direction: column;
  justify-content: center;
  .tag{
    white-space:nowrap; 
  }
}
.active{
  color:red
}
</style>