# 在本地其他项目中使用 Simple Editor Pro

有两种方式可以在本地其他项目中使用这个包：

## 方法 1: 使用 npm link（推荐）

### 步骤 1: 在包目录中创建链接

```bash
cd packages/simple-editor-pro
npm link
```

### 步骤 2: 在目标项目中使用链接

```bash
cd /path/to/your/other/project
npm link simple-editor-pro
```

### 步骤 3: 在目标项目中安装依赖

确保目标项目已经安装了 peer dependencies：

```bash
npm install react react-dom
```

### 步骤 4: 使用包

```tsx
import { SimpleEditor, PreviewPanel } from 'simple-editor-pro'
import 'simple-editor-pro/styles'
```

### 取消链接（如果需要）

```bash
# 在目标项目中
npm unlink simple-editor-pro

# 在包目录中
npm unlink
```

---

## 方法 2: 使用 file: 协议（更简单）

### 步骤 1: 在目标项目的 package.json 中添加

```json
{
  "dependencies": {
    "simple-editor-pro": "file:../path/to/packages/simple-editor-pro"
  }
}
```

**示例路径：**
- 如果目标项目在 `/Users/mac/Desktop/my-project`
- 包在 `/Users/mac/Desktop/discourse_like_ts 2/packages/simple-editor-pro`
- 则路径为：`"file:../../discourse_like_ts 2/packages/simple-editor-pro"`

### 步骤 2: 安装依赖

```bash
cd /path/to/your/other/project
npm install
```

### 步骤 3: 使用包

```tsx
import { SimpleEditor, PreviewPanel } from 'simple-editor-pro'
import 'simple-editor-pro/styles'
```

---

## 方法 3: 使用相对路径（适合 monorepo）

如果你的项目是 monorepo（使用 pnpm/yarn workspaces），可以直接使用：

```json
{
  "dependencies": {
    "simple-editor-pro": "workspace:*"
  }
}
```

---

## 重要提示

### 1. 确保包已构建

在使用之前，确保包已经构建：

```bash
cd packages/simple-editor-pro
npm run build
```

### 2. 安装 peer dependencies

目标项目需要安装以下依赖：

```bash
npm install react react-dom
```

以及所有 tiptap 相关依赖（如果还没有）：

```bash
npm install @tiptap/react @tiptap/core @tiptap/starter-kit
# ... 其他 tiptap 扩展
```

### 3. 导入样式

**必须**导入样式文件：

```tsx
import 'simple-editor-pro/styles'
```

或者如果样式导出路径不同：

```tsx
import 'simple-editor-pro/dist/styles.css'
```

### 4. TypeScript 配置

如果目标项目使用 TypeScript，确保 `tsconfig.json` 中允许从 node_modules 导入类型：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

---

## 完整使用示例

```tsx
import { useState, useRef } from 'react'
import { SimpleEditor, PreviewPanel, type Editor } from 'simple-editor-pro'
import 'simple-editor-pro/styles'

function MyComponent() {
  const editorRef = useRef<Editor | null>(null)

  return (
    <SimpleEditor
      onEditorReady={(editor) => {
        editorRef.current = editor
      }}
      themeColor="#1677ff"
      language="zh"
      enableThemeToggle={true}
      showLeftToolbar={true}
    />
  )
}
```

---

## 常见问题

### Q: 找不到模块 'simple-editor-pro'
A: 确保已经运行 `npm install` 或 `npm link`

### Q: 样式不生效
A: 确保导入了样式文件：`import 'simple-editor-pro/styles'`

### Q: TypeScript 类型错误
A: 确保包已经构建（`npm run build`），并且 `dist/index.d.ts` 存在

### Q: 构建后修改代码不生效
A: 重新构建包：`npm run build`，或者使用 `npm run dev` 进行开发模式构建

