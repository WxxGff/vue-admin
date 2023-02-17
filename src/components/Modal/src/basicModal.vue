<script lang="ts" setup>
import {
  computed,
  defineEmits,
  defineProps,
  getCurrentInstance,
  nextTick,
  ref,
  unref,
  useAttrs,
} from 'vue'
import { basicProps } from './props'
import type { ModalMethods, ModalProps } from './type'
import startDrag from '@/utils/Drag'
import { deepMerge } from '@/utils'
import type { FormProps } from '@/components/Form'

const props = defineProps({ ...basicProps })
const emit = defineEmits(['onClose', 'onOk', 'register'])
const attrs = useAttrs()
const propsRef = ref<Partial<ModalProps> | null>(null)

const isModal = ref(false)
const subLoading = ref(false)

const getProps = computed((): FormProps => {
  return { ...props, ...(unref(propsRef) as any) }
})

const subBtuText = computed(() => {
  const { subBtuText } = propsRef.value as any
  return subBtuText || props.subBtuText
})

async function setProps(modalProps: Partial<ModalProps>): Promise<void> {
  propsRef.value = deepMerge(unref(propsRef) || ({} as any), modalProps)
}

const getBindValue = computed(() => {
  return {
    ...attrs,
    ...unref(getProps),
    ...unref(propsRef),
  }
})

function setSubLoading(status: boolean) {
  subLoading.value = status
}

function openModal() {
  isModal.value = true
  nextTick(() => {
    const oBox = document.getElementById('basic-modal')
    const oBar = document.getElementById('basic-modal-bar')
    startDrag(oBar, oBox)
  })
}

function closeModal() {
  isModal.value = false
  subLoading.value = false
  emit('onClose')
}

function onCloseModal() {
  isModal.value = false
  emit('onClose')
}

function handleSubmit() {
  subLoading.value = true
  emit('onOk')
}

const modalMethods: ModalMethods = {
  setProps,
  openModal,
  closeModal,
  setSubLoading,
}

const instance = getCurrentInstance()
if (instance)
  emit('register', modalMethods)
</script>

<template>
  <n-modal id="basic-modal" v-bind="getBindValue" v-model:show="isModal" @close="onCloseModal">
    <template #header>
      <div id="basic-modal-bar" class="w-full cursor-move">
        {{ getBindValue.title }}
      </div>
    </template>
    <template #default>
      <slot name="default" />
    </template>
    <template v-if="!$slots.action" #action>
      <n-space>
        <n-button @click="closeModal">
          取消
        </n-button>
        <n-button type="primary" :loading="subLoading" @click="handleSubmit">
          {{
            subBtuText
          }}
        </n-button>
      </n-space>
    </template>
    <template v-else #action>
      <slot name="action" />
    </template>
  </n-modal>
</template>

<style lang="less">
  .cursor-move {
    cursor: move;
  }
</style>
