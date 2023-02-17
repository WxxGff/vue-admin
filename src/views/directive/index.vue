<!-- eslint-disable no-console -->
<script setup lang="ts" name="copyDirect">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
const data = ref<string>()
const message = useMessage()
const a = () => {
  message.success(`复制成功:${data.value}`)
}
const b = () => {
  message.success('防抖')
  console.log(data.value)
}
const c = () => {
  message.success('节流')
  console.log(data.value)
}
</script>

<template>
  <div class="card content-box">
    <n-card :bordered="false" title="复制指令">
      <n-space>
        <n-input v-model:value="data" placeholder="输入内容试试" style="width: 350px;" />
        <n-button v-copy="data" type="primary" @click="a">
          复 制
        </n-button>
      </n-space>
    </n-card>
    <n-card :bordered="false" title="防抖指令" class="mt-3">
      <n-button v-debounce="b" type="primary">
        防抖测试
      </n-button>
    </n-card>
    <n-card :bordered="false" title="节流指令" class="mt-3">
      <n-button v-throttle="c" type="primary">
        节流测试
      </n-button>
    </n-card>

    <n-card :bordered="false" title="拖拽指令" class="mt-3">
      鼠标放到矩形上面拖拽试试
    </n-card>
    <div v-draggable class="box" />
  </div>
</template>

<style scoped lang="less">
  body {
    position: relative;
    width: 100px;
    height: 100px;
    background-color: #ccc;
  }

  .content-box {
    height: 100vh;

    .box {
      position: absolute;
      z-index: 10000000;
      width: 100px;
      height: 100px;
      margin: 20px 5px;
      background-color: #2d8cf0;
      border-radius: 10px;
    }
  }
</style>
