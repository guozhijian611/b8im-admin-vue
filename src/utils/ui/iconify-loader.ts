/**
 * 离线图标加载器
 *
 * 预加载 Remixicon 等图标集，避免运行时依赖 Iconify CDN（国内/内网常加载失败导致菜单无图标）。
 *
 * @module utils/ui/iconify-loader
 */

import { addCollection } from '@iconify/vue'
import riIcons from '@iconify-json/ri/icons.json'

let loaded = false

/** 注册离线图标集（幂等） */
export function setupOfflineIcons(): void {
  if (loaded) return
  addCollection(riIcons as Parameters<typeof addCollection>[0])
  loaded = true
}
