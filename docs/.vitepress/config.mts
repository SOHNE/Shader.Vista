import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'

const Resources: DefaultTheme.NavItemWithLink[] = [
  { text: 'Playground', link: '/play/', target: '_blank' },
]

const Nav: DefaultTheme.NavItem[] = [
  { text: 'Home', link: '/' },
  { text: 'Guide', link: '/guide/' },
  {
    text: 'Resources',
    items: Resources,
  },
]

export default defineConfig({
  outDir: './dist',
  title: 'Actis',
  description: 'A versatile WebGL renderer designed with multipass support in mind.',
  themeConfig: {
    nav: Nav,

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is Actis?', link: '/' },
          { text: 'Getting Started', link: '/guide/' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SOHNE/Actis' },
    ],
  },
  vite: {},
})
