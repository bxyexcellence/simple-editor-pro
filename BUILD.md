# 构建说明

## 快速开始

这个包是自包含的，不依赖 client 或 server 目录。

## 步骤 1: 复制文件（首次设置）

运行复制脚本将必要的文件复制到包中：

```bash
cd packages/simple-editor-pro
./copy-files.sh
```

这会从 `../../client/src` 复制所有必要的文件到 `src/` 目录。

## 步骤 2: 安装依赖

```bash
npm install
```

## 步骤 3: 修改导入路径（如果需要）

如果文件中有 `@/` 路径别名，需要：
- 改为相对路径，或
- 确保 `vite.config.ts` 中的路径别名配置正确（已配置）

## 步骤 4: 构建

```bash
npm run build
```

构建完成后，`dist/` 目录将包含：
- `index.js` - CommonJS 格式
- `index.esm.js` - ES Module 格式  
- `index.d.ts` - TypeScript 类型定义
- `styles.css` - 样式文件（如果配置了样式复制）

## 步骤 5: 本地测试（可选）

在项目根目录使用 npm link：

```bash
# 在包目录
npm link

# 在使用包的项目中
npm link simple-editor-pro
```

## 步骤 6: 发布（可选）

```bash
npm publish
```

## 包结构

```
simple-editor-pro/
├── src/
│   ├── components/      # 所有组件
│   ├── hooks/          # 所有 hooks
│   ├── lib/            # 工具函数和配置
│   ├── styles/         # 样式文件
│   └── index.ts        # 入口文件
├── dist/               # 构建输出
├── package.json
├── tsconfig.json
└── vite.config.ts
```
