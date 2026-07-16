<!-- 工作台：真实平台运维概览 -->
<template>
  <div>
    <CardList />

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="10">
        <RuntimeHealth />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="14">
        <ImStats />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="12">
        <QuickLinks />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <ModuleSummary />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import CardList from './modules/card-list.vue'
  import RuntimeHealth from './modules/runtime-health.vue'
  import ImStats from './modules/im-stats.vue'
  import QuickLinks from './modules/quick-links.vue'
  import ModuleSummary from './modules/module-summary.vue'

  defineOptions({ name: 'Console' })
</script>
