export type Language = 'zh' | 'en'

export interface Translations {
  undo: string
  redo: string
  bold: string
  italic: string
  underline: string
  strike: string
  code: string
  heading: string
  heading1: string
  heading2: string
  heading3: string
  heading4: string
  heading5: string
  heading6: string
  bulletList: string
  orderedList: string
  taskList: string
  blockquote: string
  codeBlock: string
  table: string
  insertTable: string
  deleteTable: string
  tableOperations: string
  addRowBefore: string
  addRowAfter: string
  deleteRow: string
  addColumnBefore: string
  addColumnAfter: string
  deleteColumn: string
  alignLeft: string
  alignCenter: string
  alignRight: string
  alignJustify: string
  highlight: string
  removeHighlight: string
  link: string
  image: string
  list: string
  listOptions: string
  formatTextAsHeading: string
  highlightColors: string
  green: string
  blue: string
  red: string
  purple: string
  yellow: string
  save: string
  fullscreen: string
  exitFullscreen: string
  switchToDarkMode: string
  switchToLightMode: string
  superscript: string
  subscript: string
}

const translations: Record<Language, Translations> = {
  zh: {
    undo: '撤销',
    redo: '重做',
    bold: '加粗',
    italic: '斜体',
    underline: '下划线',
    strike: '删除线',
    code: '行内代码',
    heading: '标题',
    heading1: '标题 1',
    heading2: '标题 2',
    heading3: '标题 3',
    heading4: '标题 4',
    heading5: '标题 5',
    heading6: '标题 6',
    bulletList: '无序列表',
    orderedList: '有序列表',
    taskList: '任务列表',
    blockquote: '引用',
    codeBlock: '代码块',
    table: '表格',
    insertTable: '插入表格',
    deleteTable: '删除表格',
    tableOperations: '表格操作',
    addRowBefore: '在上方插入行',
    addRowAfter: '在下方插入行',
    deleteRow: '删除行',
    addColumnBefore: '在左侧插入列',
    addColumnAfter: '在右侧插入列',
    deleteColumn: '删除列',
    alignLeft: '左对齐',
    alignCenter: '居中',
    alignRight: '右对齐',
    alignJustify: '两端对齐',
    highlight: '高亮',
    removeHighlight: '移除高亮',
    link: '链接',
    image: '图片',
    list: '列表',
    listOptions: '列表选项',
    formatTextAsHeading: '格式化为标题',
    highlightColors: '高亮颜色',
    green: '绿色',
    blue: '蓝色',
    red: '红色',
    purple: '紫色',
    yellow: '黄色',
    save: '保存',
    fullscreen: '全屏',
    exitFullscreen: '退出全屏',
    switchToDarkMode: '切换到深色模式',
    switchToLightMode: '切换到浅色模式',
    superscript: '上标',
    subscript: '下标',
  },
  en: {
    undo: 'Undo',
    redo: 'Redo',
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strike: 'Strikethrough',
    code: 'Inline Code',
    heading: 'Heading',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    heading4: 'Heading 4',
    heading5: 'Heading 5',
    heading6: 'Heading 6',
    bulletList: 'Bullet List',
    orderedList: 'Ordered List',
    taskList: 'Task List',
    blockquote: 'Blockquote',
    codeBlock: 'Code Block',
    table: 'Table',
    insertTable: 'Insert Table',
    deleteTable: 'Delete Table',
    tableOperations: 'Table Operations',
    addRowBefore: 'Add Row Before',
    addRowAfter: 'Add Row After',
    deleteRow: 'Delete Row',
    addColumnBefore: 'Add Column Before',
    addColumnAfter: 'Add Column After',
    deleteColumn: 'Delete Column',
    alignLeft: 'Align Left',
    alignCenter: 'Align Center',
    alignRight: 'Align Right',
    alignJustify: 'Align Justify',
    highlight: 'Highlight',
    removeHighlight: 'Remove Highlight',
    link: 'Link',
    image: 'Image',
    list: 'List',
    listOptions: 'List Options',
    formatTextAsHeading: 'Format text as heading',
    highlightColors: 'Highlight colors',
    green: 'Green',
    blue: 'Blue',
    red: 'Red',
    purple: 'Purple',
    yellow: 'Yellow',
    save: 'Save',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    switchToDarkMode: 'Switch to Dark Mode',
    switchToLightMode: 'Switch to Light Mode',
    superscript: 'Superscript',
    subscript: 'Subscript',
  },
}

let currentLanguage: Language = 'zh'

export function setLanguage(lang: Language) {
  currentLanguage = lang
}

export function getLanguage(): Language {
  return currentLanguage
}

export function getTranslation(key: keyof Translations): string {
  return translations[currentLanguage][key] || key
}

// 保持向后兼容
export function t(key: keyof Translations): string {
  return getTranslation(key)
}

export function getTranslations(): Translations {
  return translations[currentLanguage]
}

