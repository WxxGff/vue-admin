<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { LockClosedOutline, PersonOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/store/modules/user'
import { ResultEnum } from '@/enums/httpEnum'
import { PageEnum } from '@/enums/pageEnum'
import { Logo } from '@/layout/components/Logo'
import { useGlobSetting } from '@/hooks/setting'

interface FormState {
  username: string
  password: string
}

const formRef = ref()
const message = useMessage()
const loading = ref(false)
const autoLogin = ref(true)
const LOGIN_NAME = PageEnum.BASE_LOGIN_NAME

const formInline = reactive({
  username: 'admin',
  password: '123456',
  isCaptcha: true,
})

const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

const userStore = useUserStore()
const globSetting = useGlobSetting()
const router = useRouter()
const route = useRoute()

const { titleCN } = globSetting

const handleSubmit = (e) => {
  e.preventDefault()
  formRef.value.validate(async (errors) => {
    if (!errors) {
      const { username, password } = formInline
      message.loading('登录中...')
      loading.value = true

      const params: FormState = {
        username,
        password,
      }

      try {
        const { code, message: msg } = await userStore.login(params)
        message.destroyAll()
        if (code === ResultEnum.SUCCESS) {
          const toPath = decodeURIComponent((route.query?.redirect || '/') as string)
          message.success('登录成功，即将进入系统')
          if (route.name === LOGIN_NAME)
            router.replace('/')

          else router.replace(toPath)
        }
        else {
          message.info(msg || '登录失败')
        }
      }
      finally {
        loading.value = false
      }
    }
    else {
      message.error('请填写完整信息，并且进行验证码校验')
    }
  })
}
</script>

<template>
  <n-layout>
    <div
      class="flex items-center justify-be w-full h-screen pt-32 pb-32 bg-gray-800 xl:pt-0 xl:pb-0 xl:bg-transparent"
    >
      <div class="w-full absolute top-0 flex items-center justify-between xl:justify-end xl:top-3 ">
        <div class="ml-4 logo -enter-x xl:hidden">
          <Logo />
        </div>

        <div class="mr-4 enter-x">
          <DarkModeToggle />
        </div>
      </div>

      <div class="hidden w-2/4 bg-blue-500 left-bg xl:block xl:w-2/4 xl:h-full">
        <div class="flex items-end justify-center h-full">
          <div
            class="flex flex-col items-start justify-center w-9/12 -enter-x left-container sm:px-10 2xl:w-4/6"
          >
            <Logo class="absolute logo -enter-x top-20" />
            <div class="left-title">
              <img class="xl:w-4/6 2xl:w-3/5" src="~@/assets/images/login-bg.svg">
              <div class="mt-10 font-medium text-white -enter-x">
                <span class="inline-block mt-4 text-3xl font-bold tracking-widest">{{ titleCN }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex items-center justify-center w-full p-12 m-4 bg-white rounded-md shadow-xl login-form-container sm:m-32 md:m-40 md:w-96 xl:m-0 xl:w-2/4 xl:bg-transparent xl:rounded-none xl:shadow-none"
      >
        <div class="w-full xl:w-2/3 xl:max-w-sm">
          <h2 class="mb-6 text-2xl font-bold text-center xl:text-3xl enter-x xl:text-left">
            登录
          </h2>
          <div class="form">
            <n-form
              ref="formRef"
              class="enter-x"
              label-placement="left"
              size="large"
              :model="formInline"
              :rules="rules"
            >
              <n-form-item path="username" class="enter-x">
                <n-input v-model:value="formInline.username" placeholder="请输入用户名">
                  <template #prefix>
                    <n-icon size="18">
                      <PersonOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="password" class="enter-x">
                <n-input
                  v-model:value="formInline.password"
                  type="password"
                  show-password-on="click"
                  placeholder="请输入密码"
                >
                  <template #prefix>
                    <n-icon size="18">
                      <LockClosedOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item class="enter-x">
                <div class="flex justify-between">
                  <div class="flex-initial">
                    <n-checkbox v-model:checked="autoLogin">
                      记住我
                    </n-checkbox>
                  </div>
                </div>
              </n-form-item>
              <n-form-item class="enter-x">
                <n-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  block
                  @click="handleSubmit"
                >
                  登录
                </n-button>
              </n-form-item>
            </n-form>
          </div>
        </div>
      </div>
    </div>
  </n-layout>
</template>

<style scoped lang="less">
  html[data-theme='dark'] {
    .login-form-container {
      background: transparent !important;
    }

    .left-bg {
      background-color: rgba(30, 64, 175, 1);
    }
  }

  .left-container {
    height: 100%;
    @media (min-width: 1200px) {
      min-width: 600px;
    }
    @media (min-width: 1800px) {
      max-width: 600px;
    }
  }

  .logo {
    height: auto;
    line-height: auto;
    color: #fff;

    @media (min-width: 1200px) {
      ::v-deep(img) {
        width: auto;
        height: 40px !important;
      }

      ::v-deep(.title) {
        font-size: 22px;
      }
    }
  }
</style>
