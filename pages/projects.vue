<script setup lang="ts">
import type { Projects } from '~/types'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Projects - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: 'Selection of projects by Lu Jiejie',
    },
  ],
})

const projects: Projects = {
  'NPM Packages': [
    {
      name: 'bili-live-listener',
      link: 'https://github.com/Lu-Jiejie/bili-live-listener',
      description: 'Listen to Bilibili live room events.',
      icon: 'i-ri-bilibili-line',
    },
    {
      name: 'flowmit',
      link: 'https://github.com/Lu-Jiejie/flowmit',
      description: 'Commit easily and strictly step by step.',
      icon: 'i-bx-git-commit',
    },
    {
      name: 'ncreate',
      link: 'https://github.com/Lu-Jiejie/ncreate',
      description: 'Create your new project from a NPM, GitHub or local template conveniently.',
      icon: 'i-ri-folder-add-line',
    },
    {
      name: 'vaultify',
      link: 'https://github.com/Lu-Jiejie/vaultify',
      description: 'Manage the configuration file for your command-line projects conveniently.',
      icon: 'i-carbon-document-configuration',
    },
    {
      name: 'gitignore-to-minimatch',
      link: 'https://github.com/Lu-Jiejie/gitignore-to-minimatch',
      description: 'Convert .gitignore patterns to minimatch patterns.',
      icon: 'i-qlementine-icons-match-regexp-16',
    },
    {
      name: 'wooden-fish',
      link: 'https://github.com/Lu-Jiejie/wooden-fish',
      description: 'A command-line wooden fish app.',
      icon: 'i-ph-fish-simple',
    },
    {
      name: 'cli-stepper',
      link: 'https://github.com/Lu-Jiejie/cli-stepper',
      description: 'A simple command-line tool for interactive step-by-step execution.',
      icon: 'i-material-symbols-light-steppers',
    },
    {
      name: 'endless-progress',
      link: 'https://github.com/Lu-Jiejie/endless-progress',
      description: 'A simple endless progress number generator.',
      icon: 'i-material-symbols-progress-activity-sharp',
    },
    {
      name: 'prompts-plus',
      link: 'https://github.com/Lu-Jiejie/prompts-plus',
      description: 'Lightweight, beautiful and user-friendly prompts.',
      icon: 'i-tabler-prompt',
    },
  ],
  'Raycast Extensions': [
    {
      name: 'Recent Projects',
      link: 'https://github.com/Lu-Jiejie/raycast-recent-projects',
      description: 'Access your recent projects easily.',
      icon: 'project_icons/recent-project.png',
      icon_css: 'grayscale contrast-50 op-60 dark:contrast-20',
    },
    {
      name: 'Multi Translate',
      link: 'https://github.com/Lu-Jiejie/raycast-multi-translate',
      description: 'Translate text using multiple translate services',
      icon: 'project_icons/multi-translate.png',
      icon_css: 'grayscale op-50 dark:op-70',
    },
  ],
  'VSCode Extensions': [
    {
      name: 'Open in XX',
      link: 'https://github.com/Lu-Jiejie/vscode-open-in-xx',
      description: 'Open links associated with current repo quickly.',
      icon: 'i-material-symbols-open-in-browser',
    },
    {
      name: 'Smart Select',
      link: 'https://github.com/Lu-Jiejie/vscode-smart-select',
      description: 'Select the right code scope with double click.',
      icon: 'i-ph-brackets-curly-duotone',
    },
  ],
  'User Scripts': [
    {
      name: 'Bilibili Random Play',
      link: 'https://github.com/Lu-Jiejie/UserScript/tree/main/packages/bilibili-random-play',
      description: 'Allow random play of Bilibili videos.',
      icon: 'i-ri-bilibili-line',
    },
    {
      name: 'Copyable',
      link: 'https://github.com/Lu-Jiejie/UserScript/tree/main/packages/copyable',
      description: 'Make text selectable and copyable on any website.',
      icon: 'i-ri-file-copy-line',
    },
    {
      name: 'South Multiply',
      link: 'https://github.com/Lu-Jiejie/UserScript/tree/main/packages/south-multiply',
      description: 'Enhance experience of South-Plus website.',
      icon: 'i-simple-icons-tampermonkey',
    },
  ],
  'Other Projects': [
    {
      name: 'Fuck or Not',
      link: 'https://github.com/Lu-Jiejie/fuck-or-not',
      description: 'A website to analyze image attractiveness using AI.',
      icon: 'i-fxemoji-nooneunder18symbol saturate-0 dark:brightness-300',
    },
    {
      name: 'Multi Translate for FlowLauncher',
      link: 'https://github.com/Lu-Jiejie/flow-launcher-multi-translate',
      description: 'Translate text using multiple translate services in Flow Launcher.',
      icon: 'project_icons/multi-translate.png',
      icon_css: 'grayscale op-50 dark:op-70',
    },
    {
      name: 'Octopath Traveler 2 Fast Travel to Anywhere',
      link: 'https://github.com/Lu-Jiejie/Octopath_Traveler_2_Fast_Travel_Anywhere',
      description: 'A mod to enable fast travel to any location in Octopath Traveler 2.',
      icon: 'i-lucide-gamepad-2',
    },
    {
      name: 'Powershell Prompt Starship',
      link: 'https://github.com/Lu-Jiejie/Powershell-prompt-starship',
      description: 'Change your Windows Powershell prompt to Starship style using only several ps1 scripts',
      icon: 'i-simple-icons-starship',
    },
  ],

}
</script>

<template>
  <ListProjects :projects="projects" />
</template>
