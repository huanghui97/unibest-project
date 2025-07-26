<template>
  <wd-config-provider :themeVars="themeVars"> 
    <div class="h-100vh page-container bg-#000 ">
      <div class="h-full app relative overflow-hidden">
        <slot />
      </div>
      <wd-toast />
      <wd-message-box />
      <privacy-popup />
    </div>
  </wd-config-provider>
</template>

<script lang="ts" setup>
import tabbar from '../components/tabbar/tabbar.vue'
import type { ConfigProviderThemeVars } from 'wot-design-uni'

const themeVars: ConfigProviderThemeVars = {
  // colorTheme: 'red',
  // buttonPrimaryBgColor: '#07c160',
  // buttonPrimaryColor: '#07c160',
}
</script>
<style>
.page-container{
  padding-top:var(--status-bar-height);
}
</style>
