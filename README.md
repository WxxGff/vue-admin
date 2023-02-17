# 简介

Gauss Web Framework 脱胎于 [Naive Ui Admin](https://github.com/jekip/naive-ui-admin)，基于基于 [Vue3.2](https://github.com/vuejs/vue-next)、[Vite](https://github.com/vitejs/vite)、 [Naive UI](https://www.naiveui.com/)、[TypeScript](https://www.typescriptlang.org/) ，项目包含典型的业务模型。二次封装通用组件。包含 表单、表格、图片上传、弹窗等，文档看[这里](https://docs.naiveadmin.com/components/table.html)。

# 特性

- 二次封装实用高扩展性组件
- 响应式、多主题，多配置，快速集成，开箱即用
- 最新技术栈，使用 `Vue3`、`Typescript`、`Pinia`、`Vite` 等前端前沿技术
- 强大的鉴权系统，对路由、菜单、功能点等支持`三种鉴权模式`，满足不同的业务鉴权需求
- 持续更新，实用性页面模板功能和交互，随意搭配组合，让构建页面变得简单化

# 准备

- [node](http://nodejs.org/) 和 [git](https://git-scm.com/) -项目开发环境
- [Vite](https://vitejs.dev/) - 熟悉 vite 特性
- [Vue3](https://v3.vuejs.org/) - 熟悉 Vue 基础语法
- [TypeScript](https://www.typescriptlang.org/) - 熟悉 `TypeScript` 基本语法
- [Es6+](http://es6.ruanyifeng.com/) - 熟悉 es6 基本语法
- [Vue-Router-Next](https://next.router.vuejs.org/) - 熟悉 vue-router 基本使用
- [Naive-ui-admin](https://www.naiveui.com/) - ui 基本使用
- [Mock.js](https://github.com/nuysoft/Mock) - mockjs 基本语法
- [windicss](https://cn.windicss.org/guide/) - 原子化 css 基本使用
- [husk](https://github.com/typicode/husky) 、[lint-staged](https://github.com/okonet/lint-staged)、[commitlint](https://github.com/conventional-changelog/commitlint)、[commitizen](https://github.com/conventional-changelog/commitlint)、[cz-git](https://cz-git.qbb.sh/zh/) - 了解前端工程化的一些基本知识

# 工具配置

如果您使用的 IDE 是 [vscode](https://code.visualstudio.com/) (推荐)的话，可以安装以下工具来提高开发效率及代码格式化

- [Iconify IntelliSense](https://marketplace.visualstudio.com/items?itemName=antfu.iconify) - Iconify 图标插件
- [windicss IntelliSense](https://marketplace.visualstudio.com/items?itemName=voorjaar.windicss-intellisense) - windicss 提示插件
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 脚本代码检查
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) - css 格式化
- [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv) - .env 文件 高亮

# 使用

- 获取项目代码

请确保本机与服务器已经配置好 ssh 公钥私钥

```bash
git clone ssh://git@gitlab.riemann.com:222/ai-platform/gauss-web-framework.git
```

- 安装依赖

项目统一使用 pnpm 包管理器

```bash
cd gauss-web-framework

pnpm install
```

- 运行

```bash
pnpm run dev
```

- 打包

```bsha
pnpm run build
```

# Git 贡献提交规范

- 参考 [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) 规范 ([Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular))
  - `feat` 增加新功能
  - `fix` 修复问题/BUG
  - `style` 代码风格相关无影响运行结果的
  - `perf` 优化/性能提升
  - `refactor` 重构
  - `revert` 撤销修改
  - `test` 测试相关
  - `docs` 文档/注释
  - `chore` 依赖更新/脚手架配置修改等
  - `workflow` 工作流改进
  - `ci` 持续集成
  - `types` 类型定义文件更改
  - `wip` 开发中

# 浏览器支持

本地开发推荐使用`Chrome 80+` 浏览器

支持现代浏览器, 不支持 IE

| [![ Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](http://godban.github.io/browsers-support-badges/) IE | [![ Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png)](http://godban.github.io/browsers-support-badges/) Edge | [![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](http://godban.github.io/browsers-support-badges/) Firefox | [![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](http://godban.github.io/browsers-support-badges/) Chrome | [![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png)](http://godban.github.io/browsers-support-badges/) Safari |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| not support                                                  | last 2 versions                                              | last 2 versions                                              | last 2 versions                                              | last 2 versions                                              |

# 维护者

null

# package.json

讲一下 `scripts` 下的相关命令

```bash
  "scripts": {
     # commit 提交代码使用这个命令，或者 git cz，注：使用 git commit -m 'xxx' 原生会被打断提交
    "commit": "git cz",	
     # 不是命令，强制规定项目使用 pnpm 包管理器
    "preinstall": "npx only-allow pnpm",
     # 安装依赖
    "bootstrap": "pnpm install",
     # 运行项目
    "serve": "npm run dev",
     # 运行项目
    "dev": "vite",
     # 构建项目
    "build": "vite build && esno ./build/script/postBuild.ts",
     # 清空缓存后构建项目
    "build:no-cache": "yarn clean:cache && npm run build",
     # 生成打包分析，在 `Mac OS` 电脑上执行完成后会自动打开界面，在 `Window` 电脑上执行完成后需要打开 `./build/.cache/stats.html` 查看
    "report": "cross-env REPORT=true npm run build",
     # 预览打包后的内容（先打包在进行预览）
    "preview": "npm run build && vite preview",
     # 直接预览本地 dist 文件目录
    "preview:dist": "vite preview",
     # 删除缓存
    "clean:cache": "rimraf node_modules/.cache/ && rimraf node_modules/.vite",
     # 删除 node_modules (`window` 系统手动删除该目录较慢，可以使用该命令来进行删除)
    "clean:lib": "rimraf node_modules",
     # 校验整个项目的 ts 类型错误，并输出编辑器控制台信息
    "type:check": "vue-tsc --noEmit --skipLibCheck",
     # eslint 检查自动修复，无法修复会输出编辑器控制台信息
    "lint:eslint": "eslint \"{src,mock}/**/*.{vue,ts,tsx}\" --fix",
     # stylelint 检查自动修复，无法修复会输出编辑器控制台信息
    "lint:stylelint": "stylelint --fix \"**/*.{html,vue,css,less,css}\" --cache --cache-location node_modules/.cache/stylelint/",
     # 只校验暂存区的文件格式
    "lint:lint-staged": "lint-staged",
     # husky 配置自动加入，不是命令
    "prepare": "husky install"
  },
```

# vue-admin
