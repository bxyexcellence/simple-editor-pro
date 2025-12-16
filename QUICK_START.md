# 快速开始 - 在其他项目中使用

## 最简单的方法（推荐）

### 1. 构建包

```bash
cd packages/simple-editor-pro
npm install
npm run build
```

### 2. 在目标项目的 package.json 中添加

```json
{
  "dependencies": {
    "simple-editor-pro": "file:../../discourse_like_ts 2/packages/simple-editor-pro"
  }
}
```

**注意：** 根据你的实际路径调整 `file:` 后面的路径。

### 3. 安装依赖

```bash
cd /path/to/your/project
npm install
```

### 4. 使用

```tsx
import { SimpleEditor } from 'simple-editor-pro'
import 'simple-editor-pro/styles'

function App() {
  return <SimpleEditor />
}
```

---

## 使用 npm link（开发时推荐）

### 1. 在包目录创建链接

```bash
cd packages/simple-editor-pro
npm link
```

### 2. 在目标项目中使用链接

```bash
cd /path/to/your/project
npm link simple-editor-pro
npm install  # 安装 peer dependencies
```

### 3. 使用

```tsx
import { SimpleEditor } from 'simple-editor-pro'
import 'simple-editor-pro/styles'

function App() {
  return <SimpleEditor />
}
```

**优点：** 修改包代码后，重新构建即可在目标项目中看到变化，无需重新安装。

---

## 完整示例

```tsx
import { useState, useRef } from 'react'
import { SimpleEditor, PreviewPanel, type Editor } from 'simple-editor-pro'
import 'simple-editor-pro/styles'

function MyApp() {
  const editorRef = useRef<Editor | null>(null)

  return (
    <div>
      <SimpleEditor
        onEditorReady={(editor) => {
          editorRef.current = editor
        }}
        themeColor="#1677ff"
        language="zh"
        enableThemeToggle={true}
        showLeftToolbar={true}
      />
    </div>
  )
}
```

---

## 注意事项

1. **必须导入样式**：`import 'simple-editor-pro/styles'`
2. **需要安装 peer dependencies**：`react` 和 `react-dom`
3. **需要安装 tiptap 依赖**：包会自动安装，但确保版本兼容
4. **TypeScript 支持**：包包含类型定义，开箱即用

