import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
    markdown: false,
  },
).removeRules(
  'vue/valid-attribute-name',
)
