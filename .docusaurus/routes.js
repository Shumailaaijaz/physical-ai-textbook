import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/physical-ai-textbook/__docusaurus/debug',
    component: ComponentCreator('/physical-ai-textbook/__docusaurus/debug', '1b0'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/__docusaurus/debug/config',
    component: ComponentCreator('/physical-ai-textbook/__docusaurus/debug/config', '4ef'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/__docusaurus/debug/content',
    component: ComponentCreator('/physical-ai-textbook/__docusaurus/debug/content', '02c'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/__docusaurus/debug/globalData',
    component: ComponentCreator('/physical-ai-textbook/__docusaurus/debug/globalData', '58f'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/__docusaurus/debug/metadata',
    component: ComponentCreator('/physical-ai-textbook/__docusaurus/debug/metadata', '647'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/__docusaurus/debug/registry',
    component: ComponentCreator('/physical-ai-textbook/__docusaurus/debug/registry', '125'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/__docusaurus/debug/routes',
    component: ComponentCreator('/physical-ai-textbook/__docusaurus/debug/routes', 'aa1'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog',
    component: ComponentCreator('/physical-ai-textbook/blog', 'a89'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/archive',
    component: ComponentCreator('/physical-ai-textbook/blog/archive', '23c'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/authors',
    component: ComponentCreator('/physical-ai-textbook/blog/authors', 'db7'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/physical-ai-textbook/blog/authors/all-sebastien-lorber-articles', 'abc'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/authors/yangshun',
    component: ComponentCreator('/physical-ai-textbook/blog/authors/yangshun', 'c53'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/first-blog-post',
    component: ComponentCreator('/physical-ai-textbook/blog/first-blog-post', '1c9'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/long-blog-post',
    component: ComponentCreator('/physical-ai-textbook/blog/long-blog-post', '309'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/mdx-blog-post',
    component: ComponentCreator('/physical-ai-textbook/blog/mdx-blog-post', 'da9'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/tags',
    component: ComponentCreator('/physical-ai-textbook/blog/tags', '87b'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/tags/docusaurus',
    component: ComponentCreator('/physical-ai-textbook/blog/tags/docusaurus', '735'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/tags/facebook',
    component: ComponentCreator('/physical-ai-textbook/blog/tags/facebook', '736'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/tags/hello',
    component: ComponentCreator('/physical-ai-textbook/blog/tags/hello', '137'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/tags/hola',
    component: ComponentCreator('/physical-ai-textbook/blog/tags/hola', 'da4'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/blog/welcome',
    component: ComponentCreator('/physical-ai-textbook/blog/welcome', '983'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/chatbot',
    component: ComponentCreator('/physical-ai-textbook/chatbot', '736'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/login',
    component: ComponentCreator('/physical-ai-textbook/login', 'c2e'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/markdown-page',
    component: ComponentCreator('/physical-ai-textbook/markdown-page', '0c3'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/profile',
    component: ComponentCreator('/physical-ai-textbook/profile', '206'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/signup',
    component: ComponentCreator('/physical-ai-textbook/signup', '1fd'),
    exact: true
  },
  {
    path: '/physical-ai-textbook/docs',
    component: ComponentCreator('/physical-ai-textbook/docs', '44f'),
    routes: [
      {
        path: '/physical-ai-textbook/docs',
        component: ComponentCreator('/physical-ai-textbook/docs', 'e21'),
        routes: [
          {
            path: '/physical-ai-textbook/docs',
            component: ComponentCreator('/physical-ai-textbook/docs', '36c'),
            routes: [
              {
                path: '/physical-ai-textbook/docs/00-preface',
                component: ComponentCreator('/physical-ai-textbook/docs/00-preface', '911'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/01-introduction-to-physical-ai',
                component: ComponentCreator('/physical-ai-textbook/docs/01-introduction-to-physical-ai', '370'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/02-ros2-fundamentals',
                component: ComponentCreator('/physical-ai-textbook/docs/02-ros2-fundamentals', 'c80'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/03-urdf-robot-modeling',
                component: ComponentCreator('/physical-ai-textbook/docs/03-urdf-robot-modeling', 'c98'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/04-gazebo-simulation',
                component: ComponentCreator('/physical-ai-textbook/docs/04-gazebo-simulation', 'bf3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/05-unity-robotics-hub',
                component: ComponentCreator('/physical-ai-textbook/docs/05-unity-robotics-hub', '0d5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/06-isaac-sim-basics',
                component: ComponentCreator('/physical-ai-textbook/docs/06-isaac-sim-basics', '8b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/07-isaac-ros-integration',
                component: ComponentCreator('/physical-ai-textbook/docs/07-isaac-ros-integration', '592'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/08-legged-locomotion',
                component: ComponentCreator('/physical-ai-textbook/docs/08-legged-locomotion', '9ef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/09-manipulation-grasping',
                component: ComponentCreator('/physical-ai-textbook/docs/09-manipulation-grasping', '4ac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/10-vision-language-action',
                component: ComponentCreator('/physical-ai-textbook/docs/10-vision-language-action', '287'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/11-capstone-project',
                component: ComponentCreator('/physical-ai-textbook/docs/11-capstone-project', '213'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/12-hardware-guide',
                component: ComponentCreator('/physical-ai-textbook/docs/12-hardware-guide', '897'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/13-ethics-future-physical-ai',
                component: ComponentCreator('/physical-ai-textbook/docs/13-ethics-future-physical-ai', '724'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/CHAPTER_OUTLINES',
                component: ComponentCreator('/physical-ai-textbook/docs/CHAPTER_OUTLINES', 'c15'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/physical-ai-textbook/docs/example-diagrams',
                component: ComponentCreator('/physical-ai-textbook/docs/example-diagrams', 'dea'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/physical-ai-textbook/',
    component: ComponentCreator('/physical-ai-textbook/', '94f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
