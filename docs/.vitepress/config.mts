import { defineConfig } from 'vitepress'

export default defineConfig({
  outDir: './dist',
  title: 'Actis',
  description: 'A versatile WebGL renderer designed with multipass support in mind.',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
    ],

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
