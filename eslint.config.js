import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    markdown: false,
    unocss: false,
  },
).removeRules(
  'vue/valid-attribute-name',
  'vue/attributes-order',
)
