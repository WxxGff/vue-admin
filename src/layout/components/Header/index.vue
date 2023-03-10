<script lang="ts">
import { computed, defineComponent, reactive, ref, toRefs, unref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NDialogProvider, useDialog, useMessage } from 'naive-ui'
import components from './components'
import ProjectSetting from './ProjectSetting.vue'
import { TABS_ROUTES } from '@/store/mutation-types'
import { useUserStore } from '@/store/modules/user'
import { useLockscreenStore } from '@/store/modules/lockscreen'
import { AsideMenu } from '@/layout/components/Menu'
import { Logo } from '@/layout/components/Logo'
import { useProjectSetting } from '@/hooks/setting/useProjectSetting'

export default defineComponent({
  name: 'PageHeader',
  components: { ...components, NDialogProvider, ProjectSetting, AsideMenu, Logo },
  props: {
    collapsed: {
      type: Boolean,
    },
    inverted: {
      type: Boolean,
    },
  },
  emits: ['update:collapsed'],

  setup(props) {
    const userStore = useUserStore()
    const useLockscreen = useLockscreenStore()
    const message = useMessage()
    const dialog = useDialog()
    const { getNavMode, getNavTheme, getHeaderSetting, getMenuSetting, getCrumbsSetting }
        = useProjectSetting()

    const { username } = userStore?.info || {}

    const drawerSetting = ref()
    const state = reactive({
      username: username || '',
      fullscreenIcon: 'FullscreenOutlined',
      navMode: getNavMode,
      navTheme: getNavTheme,
      headerSetting: getHeaderSetting,
      crumbsSetting: getCrumbsSetting,
      isCollapsed: props.collapsed,
    })

    const getInverted = computed(() => {
      const navTheme = unref(getNavTheme)
      return ['light', 'header-dark'].includes(navTheme) ? props.inverted : !props.inverted
    })

    const mixMenu = computed(() => {
      return unref(getMenuSetting).mixMenu
    })

    const getChangeStyle = computed(() => {
      const { collapsed } = props
      const { minMenuWidth, menuWidth }: any = unref(getMenuSetting)
      return {
        left: collapsed ? `${minMenuWidth}px` : `${menuWidth}px`,
        width: `calc(100% - ${collapsed ? `${minMenuWidth}px` : `${menuWidth}px`})`,
      }
    })

    const getMenuLocation = computed(() => {
      return 'header'
    })

    const router = useRouter()
    const route = useRoute()

    const generator: any = (routerMap) => {
      return routerMap.map((item) => {
        const currentMenu = {
          ...item,
          label: item.meta.title,
          key: item.name,
          disabled: item.path === '/',
        }
        // ????????????????????????????????????
        if (item.children && item.children.length > 0) {
          // Recursion
          currentMenu.children = generator(item.children, currentMenu)
        }
        return currentMenu
      })
    }

    const breadcrumbList = computed(() => {
      return generator(route.matched)
    })

    const dropdownSelect = (key) => {
      router.push({ name: key })
    }

    // ????????????
    const reloadPage = () => {
      router.push({
        path: `/redirect${unref(route).fullPath}`,
      })
    }

    // ????????????
    const doLogout = () => {
      dialog.info({
        title: '??????',
        content: '???????????????????????????',
        positiveText: '??????',
        negativeText: '??????',
        onPositiveClick: () => {
          userStore.logout().then(() => {
            message.success('??????????????????')
            // ???????????????
            localStorage.removeItem(TABS_ROUTES)
            router
              .replace({
                name: 'Login',
                query: {
                  redirect: route.fullPath,
                },
              })
              .finally(() => location.reload())
          })
        },
        onNegativeClick: () => {},
      })
    }

    // ??????????????????
    const toggleFullscreenIcon = () =>
      (state.fullscreenIcon
          = document.fullscreenElement !== null ? 'FullscreenExitOutlined' : 'FullscreenOutlined')

    // ????????????????????????
    document.addEventListener('fullscreenchange', toggleFullscreenIcon)

    // ????????????
    const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      }
      else {
        if (document.exitFullscreen)
          document.exitFullscreen()
      }
    }

    // ????????????
    const iconList = [
      {
        icon: 'SearchOutlined',
        tips: '??????',
      },
      {
        icon: 'LockOutlined',
        tips: '??????',
        eventObject: {
          click: () => useLockscreen.setLock(true),
        },
      },
    ]
    const avatarOptions = [
      // {
      //   label: '????????????',
      //   key: 1,
      // },
      {
        label: '????????????',
        key: 2,
      },
    ]

    // ??????????????????
    const avatarSelect = (key) => {
      switch (key) {
        // case 1:
        //   router.push({ name: 'Setting' })
        //   break
        case 2:
          doLogout()
          break
      }
    }

    function openSetting() {
      const { openDrawer } = drawerSetting.value
      openDrawer()
    }

    return {
      ...toRefs(state),
      iconList,
      toggleFullScreen,
      doLogout,
      route,
      dropdownSelect,
      avatarOptions,
      getChangeStyle,
      avatarSelect,
      breadcrumbList,
      reloadPage,
      drawerSetting,
      openSetting,
      getInverted,
      getMenuLocation,
      mixMenu,
    }
  },
})
</script>

<template>
  <div class="layout-header">
    <!-- ???????????? -->
    <div
      v-if="navMode === 'horizontal' || (navMode === 'horizontal-mix' && mixMenu)"
      class="layout-header-left"
    >
      <Logo :collapsed="collapsed" />
      <AsideMenu
        v-model:collapsed="isCollapsed"
        v-model:location="getMenuLocation"
        :inverted="getInverted"
        mode="horizontal"
      />
    </div>
    <!-- ???????????? -->
    <div v-else class="layout-header-left">
      <!-- ???????????? -->
      <div
        class="ml-1 layout-header-trigger layout-header-trigger-min"
        @click="() => $emit('update:collapsed', !collapsed)"
      >
        <n-icon v-if="collapsed" size="18">
          <MenuUnfoldOutlined />
        </n-icon>
        <n-icon v-else size="18">
          <MenuFoldOutlined />
        </n-icon>
      </div>
      <!-- ?????? -->
      <div
        v-if="headerSetting.isReload"
        class="mr-1 layout-header-trigger layout-header-trigger-min"
        @click="reloadPage"
      >
        <n-icon size="18">
          <ReloadOutlined />
        </n-icon>
      </div>
      <!-- ????????? -->
      <n-breadcrumb v-if="crumbsSetting.show">
        <template v-for="routeItem in breadcrumbList" :key="routeItem.name">
          <n-breadcrumb-item v-if="routeItem.meta.title">
            <n-dropdown
              v-if="routeItem.children.length"
              :options="routeItem.children"
              @select="dropdownSelect"
            >
              <span class="link-text">
                <component
                  :is="routeItem.meta.icon"
                  v-if="crumbsSetting.showIcon && routeItem.meta.icon"
                />
                {{ routeItem.meta.title }}
              </span>
            </n-dropdown>
            <span v-else class="link-text">
              <component
                :is="routeItem.meta.icon"
                v-if="crumbsSetting.showIcon && routeItem.meta.icon"
              />
              {{ routeItem.meta.title }}
            </span>
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>
    </div>
    <div class="layout-header-right">
      <div
        v-for="(item, index) in iconList"
        :key="index"
        class="layout-header-trigger layout-header-trigger-min"
      >
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-icon size="18">
              <component :is="item.icon" v-on="item.eventObject || {}" />
            </n-icon>
          </template>
          <span>{{ item.tips }}</span>
        </n-tooltip>
      </div>
      <!-- ???????????? -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-tooltip placement="bottom">
          <template #trigger>
            <n-icon size="18">
              <component :is="fullscreenIcon" @click="toggleFullScreen" />
            </n-icon>
          </template>
          <span>??????</span>
        </n-tooltip>
      </div>
      <!-- ???????????? -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <n-dropdown trigger="hover" :options="avatarOptions" @select="avatarSelect">
          <div class="avatar">
            <n-avatar round>
              {{ username }}
              <template #icon>
                <UserOutlined />
              </template>
            </n-avatar>
          </div>
        </n-dropdown>
      </div>
      <!-- ?????? -->
      <div class="layout-header-trigger layout-header-trigger-min" @click="openSetting">
        <n-tooltip placement="bottom-end">
          <template #trigger>
            <n-icon size="18" style="font-weight: bold;">
              <SettingOutlined />
            </n-icon>
          </template>
          <span>????????????</span>
        </n-tooltip>
      </div>
    </div>
  </div>
  <!-- ???????????? -->
  <ProjectSetting ref="drawerSetting" />
</template>

<style lang="less" scoped>
  .layout-header {
    z-index: 11;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: @header-height;
    padding: 0;
    box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
    transition: all 0.2s ease-in-out;

    &-left {
      display: flex;
      align-items: center;

      .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 64px;
        padding-left: 10px;
        overflow: hidden;
        line-height: 64px;
        white-space: nowrap;

        img {
          width: auto;
          height: 32px;
          margin-right: 10px;
        }

        .title {
          margin-bottom: 0;
        }
      }

      ::v-deep(.ant-breadcrumb span:last-child .link-text) {
        color: #515a6e;
      }

      .n-breadcrumb {
        display: inline-block;
      }

      &-menu {
        color: var(--text-color);
      }
    }

    &-right {
      display: flex;
      align-items: center;
      margin-right: 20px;

      .avatar {
        display: flex;
        align-items: center;
        height: 64px;
      }

      > * {
        cursor: pointer;
      }
    }

    &-trigger {
      display: inline-block;
      width: 64px;
      height: 64px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      .n-icon {
        display: flex;
        align-items: center;
        height: 64px;
        line-height: 64px;
      }

      &:hover {
        background: hsl(0deg 0% 100% / 8%);
      }

      .anticon {
        font-size: 16px;
        color: #515a6e;
      }
    }

    &-trigger-min {
      width: auto;
      padding: 0 12px;
    }
  }

  .layout-header-light {
    color: #515a6e;
    background: #fff;

    .n-icon {
      color: #515a6e;
    }

    .layout-header-left {
      ::v-deep(.n-breadcrumb .n-breadcrumb-item:last-child .n-breadcrumb-item__link) {
        color: #515a6e;
      }
    }

    .layout-header-trigger {
      &:hover {
        background: #f8f8f9;
      }
    }
  }

  .layout-header-fix {
    position: fixed;
    top: 0;
    right: 0;
    left: 200px;
    z-index: 11;
  }

  //::v-deep(.menu-router-link) {
  //  color: #515a6e;
  //
  //  &:hover {
  //    color: #1890ff;
  //  }
  //}
</style>
