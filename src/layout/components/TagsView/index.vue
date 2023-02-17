<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  toRefs,
  unref,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, useThemeVars } from 'naive-ui'
import Draggable from 'vuedraggable'
import {
  CloseOutlined,
  ColumnWidthOutlined,
  DownOutlined,
  LeftOutlined,
  MinusOutlined,
  ReloadOutlined,
  RightOutlined,
} from '@vicons/antd'
import elementResizeDetectorMaker from 'element-resize-detector'
import { storage } from '@/utils/Storage'
import { TABS_ROUTES } from '@/store/mutation-types'
import type { RouteItem } from '@/store/modules/tabsView'
import { useTabsViewStore } from '@/store/modules/tabsView'
import { useAsyncRouteStore } from '@/store/modules/asyncRoute'

import { useProjectSetting } from '@/hooks/setting/useProjectSetting'
import { PageEnum } from '@/enums/pageEnum'
import { renderIcon } from '@/utils'
import { useDesignSetting } from '@/hooks/setting/useDesignSetting'
import { useProjectSettingStore } from '@/store/modules/projectSetting'

import { useGo } from '@/hooks/web/usePage'

export default defineComponent({
  name: 'TabsView',
  components: {
    DownOutlined,
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
    Draggable,
  },
  props: {
    collapsed: {
      type: Boolean,
    },
  },
  setup(props) {
    const { getDarkTheme, getAppTheme } = useDesignSetting()
    const { getNavMode, getHeaderSetting, getMenuSetting, getMultiTabsSetting, getIsMobile }
        = useProjectSetting()
    const settingStore = useProjectSettingStore()

    const message = useMessage()
    const route = useRoute()
    const router = useRouter()
    const tabsViewStore = useTabsViewStore()
    const asyncRouteStore = useAsyncRouteStore()
    const navScroll: any = ref(null)
    const navWrap: any = ref(null)
    const isCurrent = ref(false)
    const go = useGo()

    const themeVars = useThemeVars()

    const getCardColor = computed(() => {
      return themeVars.value.cardColor
    })

    const getBaseColor = computed(() => {
      return themeVars.value.textColor1
    })

    const state = reactive({
      activeKey: route.fullPath,
      scrollable: false,
      dropdownX: 0,
      dropdownY: 0,
      showDropdown: false,
      isMultiHeaderFixed: false,
      multiTabsSetting: getMultiTabsSetting,
    })

    // 获取简易的路由对象
    const getSimpleRoute = (route): RouteItem => {
      const { fullPath, hash, meta, name, params, path, query } = route
      return { fullPath, hash, meta, name, params, path, query }
    }

    const isMixMenuNoneSub = computed(() => {
      const mixMenu = settingStore.menuSetting.mixMenu
      const currentRoute = useRoute()
      const navMode = unref(getNavMode)
      if (unref(navMode) !== 'horizontal-mix')
        return true
      return !(unref(navMode) === 'horizontal-mix' && mixMenu && currentRoute.meta.isRoot)
    })

    // 动态组装样式 菜单缩进
    const getChangeStyle = computed(() => {
      const { collapsed } = props
      const navMode = unref(getNavMode)
      const { minMenuWidth, menuWidth }: any = unref(getMenuSetting)
      const { fixed }: any = unref(getMultiTabsSetting)
      const lenNum
          = (navMode === 'horizontal' || !isMixMenuNoneSub.value)
            ? '0px'
            : collapsed
              ? `${minMenuWidth}px`
              : `${menuWidth}px`

      if (getIsMobile.value) {
        return {
          left: '0px',
          width: '100%',
        }
      }
      return {
        left: lenNum,
        width: `calc(100% - ${!fixed ? '0px' : lenNum})`,
      }
    })

    let cacheRoutes: RouteItem[] = []
    const simpleRoute = getSimpleRoute(route)
    try {
      const routesStr = storage.get(TABS_ROUTES) as string | null | undefined
      cacheRoutes = routesStr ? JSON.parse(routesStr) : [simpleRoute]
    }
    catch (e) {
      cacheRoutes = [simpleRoute]
    }

    // 将最新的路由信息同步到 localStorage 中
    const routes = router.getRoutes()
    cacheRoutes.forEach((cacheRoute) => {
      const route = routes.find(route => route.path === cacheRoute.path)
      if (route) {
        cacheRoute.meta = route.meta || cacheRoute.meta
        cacheRoute.name = (route.name || cacheRoute.name) as string
      }
    })

    // 初始化标签页
    tabsViewStore.initTabs(cacheRoutes)

    // 监听滚动条
    function onScroll(e) {
      const scrollTop
          = e.target.scrollTop
          || document.documentElement.scrollTop
          || window.pageYOffset
          || document.body.scrollTop // 滚动条偏移量
      state.isMultiHeaderFixed = !!(
        !getHeaderSetting.value.fixed
          && getMultiTabsSetting.value.fixed
          && scrollTop >= 64
      )
    }

    window.addEventListener('scroll', onScroll, true)

    // 移除缓存组件名称
    const delKeepAliveCompName = () => {
      if (route.meta.keepAlive) {
        const name = router.currentRoute.value.matched.find(item => item.name === route.name)
          ?.components?.default.name
        if (name) {
          asyncRouteStore.keepAliveComponents = asyncRouteStore.keepAliveComponents.filter(
            item => item !== name,
          )
        }
      }
    }

    // 标签页列表
    const tabsList: any = computed(() => tabsViewStore.tabsList)
    const whiteList: string[] = [
      PageEnum.BASE_LOGIN_NAME,
      PageEnum.REDIRECT_NAME,
      PageEnum.ERROR_PAGE_NAME,
    ]

    // tags 右侧下拉菜单
    const TabsMenuOptions = computed(() => {
      const isDisabled = unref(tabsList).length <= 1
      return [
        {
          label: '刷新当前',
          key: '1',
          icon: renderIcon(ReloadOutlined),
        },
        {
          label: '关闭当前',
          key: '2',
          disabled: unref(isCurrent) || isDisabled,
          icon: renderIcon(CloseOutlined),
        },
        {
          label: '关闭其他',
          key: '3',
          disabled: isDisabled,
          icon: renderIcon(ColumnWidthOutlined),
        },
        {
          label: '关闭全部',
          key: '4',
          disabled: isDisabled,
          icon: renderIcon(MinusOutlined),
        },
      ]
    })
    watch(
      () => route.fullPath,
      (to) => {
        if (whiteList.includes(route.name as string))
          return
        state.activeKey = to
        tabsViewStore.addTabs(getSimpleRoute(route))
        updateNavScroll(true)
      },
      { immediate: true },
    )

    // 在页面关闭或刷新之前，保存数据
    window.addEventListener('beforeunload', () => {
      storage.set(TABS_ROUTES, JSON.stringify(tabsList.value))
    })

    // 关闭当前页面
    const removeTab = (route) => {
      if (tabsList.value.length === 1)
        return message.warning('这已经是最后一页，不能再关闭了！')

      delKeepAliveCompName()
      tabsViewStore.closeCurrentTab(route)
      // 如果关闭的是当前页
      if (state.activeKey === route.fullPath) {
        const currentRoute = tabsList.value[Math.max(0, tabsList.value.length - 1)]
        state.activeKey = currentRoute.fullPath
        router.push(currentRoute)
      }
      updateNavScroll()
    }

    // 刷新页面
    const reloadPage = () => {
      delKeepAliveCompName()
      router.push({
        path: `/redirect${unref(route).fullPath}`,
      })
    }

    // 注入刷新页面方法
    provide('reloadPage', reloadPage)

    // 关闭左侧
    const closeLeft = (route) => {
      tabsViewStore.closeLeftTabs(route)
      state.activeKey = route.fullPath
      router.replace(route.fullPath)
      updateNavScroll()
    }

    // 关闭右侧
    const closeRight = (route) => {
      tabsViewStore.closeRightTabs(route)
      state.activeKey = route.fullPath
      router.replace(route.fullPath)
      updateNavScroll()
    }

    // 关闭其他
    const closeOther = (route) => {
      tabsViewStore.closeOtherTabs(route)
      state.activeKey = route.fullPath
      router.replace(route.fullPath)
      updateNavScroll()
    }

    // 关闭全部
    const closeAll = () => {
      tabsViewStore.closeAllTabs()
      router.replace(PageEnum.BASE_HOME)
      updateNavScroll()
    }

    // tab 操作
    const closeHandleSelect = (key) => {
      switch (key) {
        // 刷新
        case '1':
          reloadPage()
          break
          // 关闭
        case '2':
          removeTab(route)
          break
          // 关闭其他
        case '3':
          closeOther(route)
          break
          // 关闭所有
        case '4':
          closeAll()
          break
      }
      updateNavScroll()
      state.showDropdown = false
    }

    /**
       * @param value 要滚动到的位置
       * @param amplitude 每次滚动的长度
       */
    function scrollTo(value: number, amplitude: number) {
      const currentScroll = navScroll.value.scrollLeft
      const scrollWidth
          = ((amplitude > 0 && currentScroll + amplitude >= value)
          || (amplitude < 0 && currentScroll + amplitude <= value))
            ? value
            : currentScroll + amplitude
      navScroll.value && navScroll.value.scrollTo(scrollWidth, 0)
      if (scrollWidth === value)
        return
      return window.requestAnimationFrame(() => scrollTo(value, amplitude))
    }

    function scrollPrev() {
      const containerWidth = navScroll.value.offsetWidth
      const currentScroll = navScroll.value.scrollLeft

      if (!currentScroll)
        return
      const scrollLeft = currentScroll > containerWidth ? currentScroll - containerWidth : 0
      scrollTo(scrollLeft, (scrollLeft - currentScroll) / 20)
    }

    function scrollNext() {
      const containerWidth = navScroll.value.offsetWidth
      const navWidth = navScroll.value.scrollWidth
      const currentScroll = navScroll.value.scrollLeft

      if (navWidth - currentScroll <= containerWidth)
        return
      const scrollLeft
          = navWidth - currentScroll > containerWidth * 2
            ? currentScroll + containerWidth
            : navWidth - containerWidth
      scrollTo(scrollLeft, (scrollLeft - currentScroll) / 20)
    }

    /**
       * @param autoScroll 是否开启自动滚动功能
       */
    async function updateNavScroll(autoScroll?: boolean) {
      await nextTick()
      if (!navScroll.value)
        return
      const containerWidth = navScroll.value.offsetWidth
      const navWidth = navScroll.value.scrollWidth

      if (containerWidth < navWidth) {
        state.scrollable = true
        if (autoScroll) {
          const tagList = navScroll.value.querySelectorAll('.tabs-card-scroll-item') || [];
          [...tagList].forEach((tag: HTMLElement) => {
            // fix SyntaxError
            if (tag.id === `tag${state.activeKey.split('/').join('\/')}`)
              tag.scrollIntoView && tag.scrollIntoView()
          })
        }
      }
      else {
        state.scrollable = false
      }
    }

    function handleResize() {
      updateNavScroll(true)
    }

    function handleContextMenu(e, item) {
      e.preventDefault()
      isCurrent.value = PageEnum.BASE_HOME_REDIRECT === item.path
      state.showDropdown = false
      nextTick().then(() => {
        state.showDropdown = true
        state.dropdownX = e.clientX
        state.dropdownY = e.clientY
      })
    }

    function onClickOutside() {
      state.showDropdown = false
    }

    // tags 跳转页面
    function goPage(e) {
      const { fullPath } = e
      if (fullPath === route.fullPath)
        return
      state.activeKey = fullPath
      go(e, true)
    }

    // 删除tab
    function closeTabItem(e) {
      const { fullPath } = e
      const routeInfo = tabsList.value.find(item => item.fullPath === fullPath)
      removeTab(routeInfo)
    }

    onMounted(() => {
      onElementResize()
    })

    function onElementResize() {
      const observer = elementResizeDetectorMaker()
      observer.listenTo(navWrap.value, handleResize)
    }

    return {
      ...toRefs(state),
      navWrap,
      navScroll,
      route,
      tabsList,
      goPage,
      closeTabItem,
      closeLeft,
      closeRight,
      closeOther,
      closeAll,
      reloadPage,
      getChangeStyle,
      TabsMenuOptions,
      closeHandleSelect,
      scrollNext,
      scrollPrev,
      handleContextMenu,
      onClickOutside,
      getDarkTheme,
      getAppTheme,
      getCardColor,
      getBaseColor,
    }
  },
})
</script>

<template>
  <div
    class="tabs-view box-border"
    :class="{
      'tabs-view-fix': multiTabsSetting.fixed,
      'tabs-view-fixed-header': isMultiHeaderFixed,
      'tabs-view-default-background': getDarkTheme === false,
      'tabs-view-dark-background': getDarkTheme === true,
    }"
    :style="getChangeStyle"
  >
    <div class="tabs-view-main">
      <div ref="navWrap" class="tabs-card" :class="{ 'tabs-card-scrollable': scrollable }">
        <span
          class="tabs-card-prev"
          :class="{ 'tabs-card-prev-hide': !scrollable }"
          @click="scrollPrev"
        >
          <n-icon size="16" color="#515a6e">
            <LeftOutlined />
          </n-icon>
        </span>
        <span
          class="tabs-card-next"
          :class="{ 'tabs-card-next-hide': !scrollable }"
          @click="scrollNext"
        >
          <n-icon size="16" color="#515a6e">
            <RightOutlined />
          </n-icon>
        </span>
        <div ref="navScroll" class="tabs-card-scroll">
          <Draggable :list="tabsList" animation="300" item-key="fullPath" class="flex">
            <template #item="{ element }">
              <div
                :id="`tag${element.fullPath.split('/').join('\/')}`"
                class="tabs-card-scroll-item"
                :class="{ 'active-item': activeKey === element.path }"
                @click.stop="goPage(element)"
                @contextmenu="handleContextMenu($event, element)"
              >
                <span>{{ element.meta.title }}</span>
                <n-icon v-if="!element.meta.affix" size="14" @click.stop="closeTabItem(element)">
                  <CloseOutlined />
                </n-icon>
              </div>
            </template>
          </Draggable>
        </div>
      </div>
      <div class="tabs-close">
        <n-dropdown
          trigger="hover"
          placement="bottom-end"
          :options="TabsMenuOptions"
          @select="closeHandleSelect"
        >
          <div class="tabs-close-btn">
            <n-icon size="16" color="#515a6e">
              <DownOutlined />
            </n-icon>
          </div>
        </n-dropdown>
      </div>
      <n-dropdown
        :show="showDropdown"
        :x="dropdownX"
        :y="dropdownY"
        placement="bottom-start"
        :options="TabsMenuOptions"
        @clickoutside="onClickOutside"
        @select="closeHandleSelect"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
  .tabs-view {
    display: flex;
    width: 100%;
    padding: 6px 0;
    transition: all 0.2s ease-in-out;

    &-main {
      display: flex;
      min-width: 100%;
      max-width: 100%;
      height: 32px;

      .tabs-card {
        position: relative;
        flex-grow: 1;
        flex-shrink: 1;
        overflow: hidden;
        -webkit-box-flex: 1;

        .tabs-card-prev,
        .tabs-card-next {
          position: absolute;
          width: 32px;
          line-height: 32px;
          text-align: center;
          cursor: pointer;

          .n-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
          }
        }

        .tabs-card-prev {
          left: 0;
        }

        .tabs-card-next {
          right: 0;
        }

        .tabs-card-next-hide,
        .tabs-card-prev-hide {
          display: none;
        }

        &-scroll {
          overflow: hidden;
          white-space: nowrap;

          &-item {
            position: relative;
            display: inline-block;
            flex: 0 0 auto;
            height: 32px;
            padding: 6px 16px 4px;
            margin-right: 6px;
            color: v-bind(getBaseColor);
            cursor: pointer;
            background: v-bind(getCardColor);
            border-radius: 3px;

            span {
              float: left;
              vertical-align: middle;
            }

            &:hover {
              color: #515a6e;
            }

            .n-icon {
              position: relative;
              width: 21px;
              height: 22px;
              margin-right: -6px;
              color: #808695;
              text-align: center;
              vertical-align: middle;

              &:hover {
                color: #515a6e !important;
              }

              svg {
                display: inline-block;
                height: 21px;
              }
            }
          }

          .active-item {
            color: v-bind(getAppTheme);
          }
        }
      }

      .tabs-card-scrollable {
        padding: 0 32px;
        overflow: hidden;
      }
    }

    .tabs-close {
      width: 32px;
      min-width: 32px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      cursor: pointer;
      background: var(--color);
      border-radius: 2px;

      &-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--color);
      }
    }
  }

  .tabs-view-default-background {
    background: #f5f7f9;
  }

  .tabs-view-dark-background {
    background: #101014;
  }

  .tabs-view-fix {
    position: fixed;
    left: 200px;
    z-index: 5;
    padding: 6px 10px;
  }

  .tabs-view-fixed-header {
    top: 0;
  }
</style>
