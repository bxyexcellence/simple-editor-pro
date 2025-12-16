import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, join } from 'path'
import dts from 'vite-plugin-dts'
import { renameSync, existsSync } from 'fs'

// Plugin to rename style.css to styles.css after build
const renameStylesPlugin = () => {
  return {
    name: 'rename-styles',
    closeBundle() {
      const distPath = resolve(__dirname, 'dist')
      const stylePath = join(distPath, 'style.css')
      const stylesPath = join(distPath, 'styles.css')
      
      if (existsSync(stylePath)) {
        renameSync(stylePath, stylesPath)
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx']
    }),
    renameStylesPlugin()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SimpleEditorPro',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tiptap/react',
        '@tiptap/core',
        '@tiptap/starter-kit',
        '@tiptap/extension-list',
        '@tiptap/extension-text-align',
        '@tiptap/extension-typography',
        '@tiptap/extension-highlight',
        '@tiptap/extension-subscript',
        '@tiptap/extension-superscript',
        '@tiptap/extensions',
        '@tiptap/pm',
        '@tiptap/extension-table',
        '@tiptap/extension-table-row',
        '@tiptap/extension-table-cell',
        '@tiptap/extension-table-header',
        '@tiptap/extension-mention',
        '@tiptap/suggestion',
        '@floating-ui/react',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-context-menu',
        'lodash.throttle',
        'react-hotkeys-hook'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    cssCodeSplit: false,
    sourcemap: true,
    // 确保 CSS 文件被复制到 dist 目录
    copyPublicDir: false
  }
})

