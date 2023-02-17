import { resolve } from 'path'
import type { ConfigEnv, UserConfig } from 'vite'
import { loadEnv } from 'vite'
import { format } from 'date-fns'
import { wrapperEnv } from './build/utils'
import { createVitePlugins } from './build/vite/plugin'
import { OUTPUT_DIR } from './build/constant'
import { createProxy } from './build/vite/proxy'
import pkg from './package.json'
const { dependencies, devDependencies, name, version } = pkg

const __APP_INFO__ = {
  // APP 后台管理信息
  pkg: { dependencies, devDependencies, name, version },
  // 最后编译时间
  lastBuildTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
}
// path.resolve () 方法用于将一系列路径段解析为绝对路径。它通过处理从右到左的路径序列来工作，在每个路径之前添加，直到创建绝对路径。
function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

export default ({ command, mode }: ConfigEnv): UserConfig => {
  // process.cwd() 方法返回 Node.js 进程的当前工作目录
  // mode 返回应用的环境模式 development（开发环境） 或者 production（生产环境）
  // command 返回（dev/serve 或 build）命令模式，yarn dev 返回 dev/serve yarn build 返回 build
  const root = process.cwd()
  // loadEnv() 根据 mode 检查 process.cwd() 路径下 .env、.env.development 环境文件，输出 NODE_ENV 和 VITE_ 开头的键值对
  const env = loadEnv(mode, root)
  // 读取并处理所有环境变量配置文件 .env
  const viteEnv = wrapperEnv(env)
  const { VITE_PUBLIC_PATH, VITE_DROP_CONSOLE, VITE_PORT, VITE_GLOB_PROD_MOCK, VITE_PROXY }
    = viteEnv
  const prodMock = VITE_GLOB_PROD_MOCK
  const isBuild = command === 'build'
  return {
    base: VITE_PUBLIC_PATH,
    esbuild: {
      // 使用 esbuild 压缩 剔出 console.log 的配置
      pure: VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : [],
      // minify: true, // minify: true, 等于 minify: 'esbuild',
    },
    // 别名
    resolve: {
      alias: [
        {
          find: /\/#\//,
          replacement: `${pathResolve('types')}/`,
        },
        {
          find: '@',
          replacement: `${pathResolve('src')}/`,
        },
      ],
      dedupe: ['vue'],
    },
    // 加载插件
    plugins: createVitePlugins(viteEnv, isBuild, prodMock),
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    css: {
      // 指定传递给 CSS 预处理器的选项
      preprocessorOptions: {
        less: {
          modifyVars: {},
          javascriptEnabled: true,
          additionalData: '@import "src/styles/var.less";',
        },
      },
    },
    server: {
      host: true,
      port: VITE_PORT,
      proxy: createProxy(VITE_PROXY),
      // proxy: {
      //     '/api': {
      //         target: '',
      //         changeOrigin: true,
      //         rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      //     }
      // }
    },
    optimizeDeps: {
      include: [],
      exclude: ['vue-demi'],
    },
    build: {
      // 设置最终构建的浏览器兼容目标
      target: 'es2015',
      minify: 'esbuild',
      // 构建后是否生成 source map 文件(用于线上报错代码报错映射对应代码)
      sourcemap: false,
      cssTarget: 'chrome80',
      outDir: OUTPUT_DIR,
      // 只有 minify 为 terser 的时候, 本配置项才能起作用
      // terserOptions: {
      //   compress: {
      //     // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
      //     keep_infinity: true,
      //     // 打包是否自动删除 console
      //     drop_console: VITE_DROP_CONSOLE,
      //   },
      // },
      // 进行压缩计算
      reportCompressedSize: false,
      // chunk 大小警告的限制（以 kbs 为单位）
      chunkSizeWarningLimit: 2000,
    },
  }
}
