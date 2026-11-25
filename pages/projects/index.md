---
title: 项目
description: Lu Jiejie 的项目
wide: true
---

<script setup>
import { computed } from 'vue'
import { projectsData } from '~/data/projects'

const projects = computed(() => {
  return projectsData.reduce((acc, project) => {
    const category = project.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(project)
    return acc
  }, {})
})
</script>

<ListProjects :projects="projects" />
