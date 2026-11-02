import { ref } from 'vue'

// 纯数据驱动：全局只存放“布尔值”，谁想用谁就直接来读写，没有中间商
export const isTocOpen = ref(false) // 移动端目录 Panel 是否打开
export const hasTocHeadings = ref(false) // 当前页面到底有没有目录标题
