import type { Plugin, PluginOption } from 'vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

import WindiCSS from 'vite-plugin-windicss'
import { configHtmlPlugin } from './html'
import { configMockPlugin } from './mock'
import { configCompressPlugin } from './compress'
import { configVisualizerConfig } from './visualizer'
/**
 * 配置 vite 插件
 * @param viteEnv vite 环境变量配置文件键值队 object
 * @param isBuild 是否是 build 环境 true/false
 * @returns vitePlugins[]
 */
export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean, prodMock) {
  // VITE_BUILD_COMPRESS 是否启用 gzip 压缩或 brotli 压缩
  // 可选: gzip | brotli | none，
  // 如果你需要多种形式，你可以用','来分隔

  // VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE 打包使用压缩时是否删除原始文件，默认为 false
  const { VITE_USE_MOCK, VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE } = viteEnv

  const vitePlugins: (Plugin | Plugin[] | PluginOption[])[] = [
    // have to
    vue(),
    // have to
    vueJsx(),

    // 按需引入NaiveUi且自动创建组件声明
    Components({
      dts: true,
      resolvers: [NaiveUiResolver()],
    }),
  ]

  // vite-plugin-windicss
  vitePlugins.push(WindiCSS())

  // 加载 html 插件 vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild))

  // rollup-plugin-visualizer
  vitePlugins.push(configVisualizerConfig())

  // vite-plugin-mock
  VITE_USE_MOCK && vitePlugins.push(configMockPlugin(isBuild, prodMock))

  if (isBuild) {
    // rollup-plugin-gzip
    // 加载 gzip 打包
    vitePlugins.push(
      configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE),
    )
  }

  return vitePlugins
}
