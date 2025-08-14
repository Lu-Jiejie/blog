import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
  },
).removeRules(
  'vue/valid-attribute-name',
)
