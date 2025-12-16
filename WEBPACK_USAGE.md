# 在 Webpack 项目中使用 Simple Editor Pro

## 兼容性说明

✅ **完全支持**：这个包可以在 Webpack 项目中使用。

包构建时同时输出了：
- **ES Module** (`dist/index.esm.js`) - 现代打包工具使用
- **CommonJS** (`dist/index.js`) - Webpack 默认使用
- **TypeScript 类型定义** (`dist/index.d.ts`)

## 基本使用

### 1. 安装包

```bash
npm install simple-editor-pro
# 或使用 file: 协议
npm install file:../../path/to/simple-editor-pro
```

### 2. 安装 peer dependencies

```bash
npm install react react-dom
```

### 3. 在代码中使用

```tsx
import { SimpleEditor, PreviewPanel } from 'simple-editor-pro'
import 'simple-editor-pro/styles'
```

## Webpack 配置

### 基本配置（通常不需要修改）

大多数情况下，Webpack 可以自动处理这个包，无需额外配置。但如果遇到问题，可以添加以下配置：

### webpack.config.js

```javascript
module.exports = {
  // ... 其他配置
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    // 确保可以解析 node_modules 中的包
    modules: ['node_modules', 'src']
  },
  module: {
    rules: [
      // ... 其他规则
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        // 确保处理 node_modules 中的 CSS
        include: [
          /node_modules\/simple-editor-pro/,
          // ... 其他路径
        ]
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        include: [
          /node_modules\/simple-editor-pro/,
          // ... 其他路径
        ]
      }
    ]
  }
}
```

### 如果使用 TypeScript

确保 `tsconfig.json` 中允许从 node_modules 导入：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 常见问题

### 1. 样式不生效

**问题**：导入样式后样式不生效

**解决方案**：

确保 webpack 配置中处理 CSS：

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
    // 或者使用 MiniCssExtractPlugin
    // {
    //   test: /\.css$/,
    //   use: [MiniCssExtractPlugin.loader, 'css-loader']
    // }
    ]
  }
}
```

### 2. 找不到模块

**问题**：`Cannot find module 'simple-editor-pro'`

**解决方案**：

1. 确保包已构建：
```bash
cd packages/simple-editor-pro
npm run build
```

2. 检查 package.json 中的路径是否正确

3. 重新安装依赖：
```bash
npm install
```

### 3. TypeScript 类型错误

**问题**：TypeScript 找不到类型定义

**解决方案**：

确保 `tsconfig.json` 配置正确：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": [
    "src/**/*",
    "node_modules/simple-editor-pro/dist/index.d.ts"
  ]
}
```

### 4. 构建时警告

**问题**：Webpack 警告关于某些依赖

**解决方案**：

如果看到关于 peer dependencies 的警告，这是正常的。确保已安装 `react` 和 `react-dom`。

## 完整示例

### React + Webpack + TypeScript 项目

```tsx
// src/App.tsx
import React, { useRef } from 'react'
import { SimpleEditor, type Editor } from 'simple-editor-pro'
import 'simple-editor-pro/styles'

function App() {
  const editorRef = useRef<Editor | null>(null)

  return (
    <div>
      <SimpleEditor
        onEditorReady={(editor) => {
          editorRef.current = editor
        }}
        themeColor="#1677ff"
        language="zh"
      />
    </div>
  )
}

export default App
```

### webpack.config.js

```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}
```

## 与 Create React App 一起使用

如果你使用的是 Create React App（内部使用 Webpack），可以直接使用：

```tsx
import { SimpleEditor } from 'simple-editor-pro'
import 'simple-editor-pro/styles'
```

无需修改任何配置！

## 总结

✅ **Webpack 完全支持**
✅ **无需特殊配置**（大多数情况）
✅ **自动处理依赖**
✅ **TypeScript 支持**

只需要：
1. 安装包
2. 导入组件和样式
3. 使用即可

