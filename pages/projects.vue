<script setup lang="ts">
import type { Projects } from '~/data/projects'
import { projectsData } from '~/data/projects'

const projects = projectsData.reduce<Projects>((acc, project) => {
  (acc[project.category] ||= []).push(project)
  return acc
}, {})
</script>

<template>
  <PageLayout :frontmatter="{ title: '项目', description: 'Lu Jiejie 的项目', wide: true }">
    <ListProjects :projects="projects" />
  </PageLayout>
</template>
