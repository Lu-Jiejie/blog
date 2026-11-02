<template>
  <!-- 页脚已移出 main，补上原来 main 提供的内边距 -->
  <div class="px-7">
    <div class="prose" mt-10 mb-6 m-auto flex select-none>
      <span text-sm op-50 flex flex-wrap items-baseline>
        <UiLink
          :border="true"
          important-color-inherit mr-3 op-100!
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
        >
          CC BY-NC-SA 4.0
        </UiLink>

        <span mr-3 mb-2>2025-PRESENT © Lu Jiejie</span>
      </span>
      <div flex-auto />
    </div>
  </div>
</template>
