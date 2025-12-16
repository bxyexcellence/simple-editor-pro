/**
 * 主题色工具函数
 * 用于生成和设置主题色 CSS 变量
 */

/**
 * 将 hex 颜色转换为 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// RGB 转 hex (保留以备将来使用)
// function rgbToHex(r: number, g: number, b: number): string {
//   return `#${[r, g, b].map((x) => {
//     const hex = x.toString(16);
//     return hex.length === 1 ? `0${hex}` : hex;
//   }).join('')}`;
// }

/**
 * 混合两个颜色
 */
function mixColor(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }, ratio: number) {
  const r = Math.round(color1.r * (1 - ratio) + color2.r * ratio);
  const g = Math.round(color1.g * (1 - ratio) + color2.g * ratio);
  const b = Math.round(color1.b * (1 - ratio) + color2.b * ratio);
  return { r, g, b };
}

/**
 * 从基础颜色生成主题色变量
 * @param baseColor 基础颜色（如 #6366f1）
 * @returns 主题色变量对象
 */
export function generateThemeColors(baseColor: string): Record<string, string> {
  const rgb = hexToRgb(baseColor);
  if (!rgb) {
    console.warn(`Invalid color: ${baseColor}, using default`);
    return {};
  }

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const colors: Record<string, string> = {};

  // 生成不同深浅的主题色
  // 50-400: 与白色混合，逐渐变浅
  // 500: 基础颜色
  // 600-950: 与黑色混合，逐渐变深
  const shades = [
    { name: '50', ratio: 0.95 },   // 95% 白色
    { name: '100', ratio: 0.9 },   // 90% 白色
    { name: '200', ratio: 0.8 },   // 80% 白色
    { name: '300', ratio: 0.6 },   // 60% 白色
    { name: '400', ratio: 0.4 },   // 40% 白色
    { name: '500', ratio: 0 },      // 基础颜色
    { name: '600', ratio: 0.2 },    // 20% 黑色
    { name: '700', ratio: 0.4 },    // 40% 黑色
    { name: '800', ratio: 0.6 },    // 60% 黑色
    { name: '900', ratio: 0.8 },    // 80% 黑色
    { name: '950', ratio: 0.9 },   // 90% 黑色
  ];

  shades.forEach(({ name, ratio }) => {
    let mixed;
    if (ratio === 0) {
      mixed = rgb;
    } else if (name === '50' || name === '100' || name === '200' || name === '300' || name === '400') {
      // 与白色混合（变浅）
      mixed = mixColor(white, rgb, ratio);
    } else {
      // 与黑色混合（变深）
      mixed = mixColor(rgb, black, ratio);
    }
    colors[`--tt-brand-color-${name}`] = `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, 1)`;
  });

  // 生成带透明度的背景色变量（用于 mention 等）
  colors['--tt-brand-color-500-alpha-10'] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
  colors['--tt-brand-color-500-alpha-20'] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;

  return colors;
}

/**
 * 应用主题色到文档根元素
 * @param baseColor 基础颜色（如 #6366f1）
 */
export function applyThemeColor(baseColor: string): void {
  const colors = generateThemeColors(baseColor);
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

