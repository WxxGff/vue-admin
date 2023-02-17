<script lang="ts" setup>
import { useGlobSetting } from '@/hooks/setting'

const props = defineProps({
  collapsed: {
    type: Boolean,
  },
})

const globSetting = useGlobSetting()
// system title
const { title } = globSetting
</script>

<template>
  <div class="logo">
    <img src="~@/assets/images/logo.svg" alt="" :class="{ 'mr-2': !props.collapsed }">
    <h2 v-show="!props.collapsed" class="title">
      {{ title }}
    </h2>
  </div>
</template>

<style lang="less" scoped>
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    line-height: 64px;
    overflow: hidden;
    white-space: nowrap;

    img {
      width: auto;
      height: 40px;
    }

    .title {
      font-size: 19px;
      transition: all 0.5s;
      line-height: normal;
    }
  }
</style>
