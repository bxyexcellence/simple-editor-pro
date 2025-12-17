# Markdown 功能测试 Demo

这个 demo 用于测试 SimpleEditor 的 markdown 解析和转换功能。

## 运行方式

### 方式 1：使用 npm 脚本（推荐）

在项目根目录运行：

```bash
npm run demo
```

### 方式 2：直接运行 vite

```bash
cd demo
vite
```

然后在浏览器中打开 `http://localhost:3000`

## 功能测试

这个 demo 包含以下测试功能：

1. **加载测试内容**：点击按钮加载不同类型的 markdown 内容
   - 基础 Markdown：包含标题、列表、链接、图片、代码等
   - 链接测试：测试各种链接格式
   - 图片测试：测试图片 markdown 语法
   - 混合内容：包含多种格式的混合内容

2. **实时编辑**：在编辑器中直接输入 markdown 语法
   - 输入 `[链接文本](url)` 会自动转换为链接
   - 输入 `![图片描述](url)` 会自动转换为图片
   - 输入空格或回车后会自动解析 markdown 语法

3. **粘贴测试**：点击"粘贴 Markdown 测试"按钮，测试粘贴 markdown 内容的自动转换

4. **实时输出**：查看编辑器实时输出的 HTML 和 Markdown 内容

## 测试要点

- ✅ 检查 markdown 是否正确解析为 HTML
- ✅ 检查 HTML 是否能正确转换回 markdown
- ✅ 检查输入 markdown 语法时是否自动转换
- ✅ 检查粘贴 markdown 内容时是否自动转换
- ✅ 检查 `editor.getMarkdown()` 方法是否正常工作
- ✅ 检查 `editor.commands.setContent(content, { contentType: 'markdown' })` 是否正常工作

