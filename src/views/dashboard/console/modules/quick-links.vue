<template>
  <div class="art-card p-5 mb-5 max-sm:mb-4 min-h-80">
    <div class="art-card-header">
      <div class="title">
        <h4>常用入口</h4>
        <p>平台管理与运维快捷导航</p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        v-for="link in links"
        :key="link.path"
        class="flex-cb h-14 px-3.5 border border-g-300 c-p rounded-lg text-sm bg-g-100 duration-300 hover:-translate-y-0.5"
        @click="go(link.path)"
      >
        <div class="flex items-center gap-2 min-w-0">
          <ArtSvgIcon :icon="link.icon" class="text-lg text-theme shrink-0" />
          <div class="min-w-0">
            <div class="text-g-900 font-medium truncate">{{ link.label }}</div>
            <div class="text-xs text-g-600 truncate">{{ link.desc }}</div>
          </div>
        </div>
        <ArtSvgIcon icon="ri:arrow-right-s-line" class="text-lg text-g-600 shrink-0" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  // path 与动态菜单 fullPath 一致：父 path + 子 path
  const links = [
    {
      label: '机构用户',
      desc: '租户侧账号管理',
      path: '/panel/user',
      icon: 'ri:file-user-line'
    },
    {
      label: '平台账号',
      desc: '总后台管理员',
      path: '/system/user',
      icon: 'ri:user-settings-line'
    },
    {
      label: '机构管理',
      desc: '开通与维护租户',
      path: '/panel/organization',
      icon: 'ri:building-line'
    },
    {
      label: 'IM 运维',
      desc: '用户 / 设备 / 会话 / 策略',
      path: '/im/operations',
      icon: 'ri:message-3-line'
    },
    {
      label: '模块管理',
      desc: '商业模块安装与授权',
      path: '/panel/module',
      icon: 'ri:puzzle-line'
    },
    {
      label: '系统设置',
      desc: '上传、邮件、社交开关等',
      path: '/system/config',
      icon: 'ri:settings-4-line'
    }
  ]

  const go = (path: string) => {
    router.push(path)
  }
</script>
