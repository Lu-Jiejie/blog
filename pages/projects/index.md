---
title: Projects
description: Selection of projects by Lu Jiejie
wrapperComponent: WrapperPage
---

<script setup>
import { computed } from 'vue'
import { projectsData } from './data'

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
