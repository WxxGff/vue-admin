import { getCurrentInstance, ref, unref, watch } from 'vue'
import { tryOnUnmounted } from '@vueuse/core'
import type { ModalMethods, UseModalReturnType } from '../type'
import { isProdMode } from '@/utils/env'
import { getDynamicProps } from '@/utils'
export function useModal(props): UseModalReturnType {
  const modalRef = ref<Nullable<ModalMethods>>(null)
  const currentInstance = getCurrentInstance()

  const getInstance = () => {
    const instance = unref(modalRef.value)
    if (!instance)
      console.error('useModal instance is undefined!')

    return instance
  }

  const register = (modalInstance: ModalMethods) => {
    isProdMode()
      && tryOnUnmounted(() => {
        modalRef.value = null
      })
    modalRef.value = modalInstance
    currentInstance?.emit('register', modalInstance)

    watch(
      () => props,
      () => {
        props && modalInstance.setProps(getDynamicProps(props))
      },
      {
        immediate: true,
        deep: true,
      },
    )
  }

  const methods: ModalMethods = {
    setProps: (props): void => {
      getInstance()?.setProps(props)
    },
    openModal: () => {
      getInstance()?.openModal()
    },
    closeModal: () => {
      getInstance()?.closeModal()
    },
    setSubLoading: (status) => {
      getInstance()?.setSubLoading(status)
    },
  }

  return [register, methods]
}
