
import React from 'react';

export const CATEGORIES = [
  '创意写作',
  '绘图',
  '编程',
  'ChatGPT'
];

export const DISCOVERY_RESOURCES = [
  {
    title: 'GPT-4o 图像案例',
    subtitle: '精选图像生成提示词',
    desc: '收录了大量 GPT-4o 和 gpt-image-1 生成的高质量图像案例和对应的提示词，包含各种风格和场景。',
    icon: '🖼️',
    color: 'bg-purple-100',
    linkText: '访问资源'
  },
  {
    title: 'ChatGPT Prompts',
    subtitle: '经典提示词合集',
    desc: '包含各种场景的 ChatGPT 提示词模板，涵盖写作、编程、分析、创意等多个领域的实用案例。',
    icon: '💡',
    color: 'bg-green-100',
    linkText: '访问资源'
  },
  {
    title: 'Image to Prompt',
    subtitle: '图像反向工程',
    desc: '通过上传图像自动生成对应的提示词，帮助你理解如何描述特定的视觉效果和风格。',
    icon: '🎨',
    color: 'bg-blue-100',
    linkText: '访问工具'
  },
  {
    title: 'God of Prompt',
    subtitle: 'AI 提示词专家',
    desc: '专业的 AI 提示词平台，提供高质量的提示词模板、教程 and 最佳实践指南。',
    icon: '⚡',
    color: 'bg-orange-100',
    linkText: '访问平台'
  }
];

export const INITIAL_PROMPTS = [
  {
    id: '1',
    title: '英语口语老师',
    description: '一个能够像真实口语老师一样与你对话、纠正发音和语法的助手。',
    category: '创意写作',
    tags: ['contribute', 'pedagogy'],
    author: '阿德民',
    likes: 25,
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 270, // ~9 months ago
    updatedAt: Date.now() - 86400000,
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        content: "I want you to act as an English speaking teacher. I'll send you the question and my answer in the following format. Please correct my grammar and provide suggestions on how to speak more naturally like a native speaker.",
        notes: 'Initial version.',
        timestamp: Date.now() - 86400000 * 270
      }
    ]
  },
  {
    id: '2',
    title: 'React 架构优化专家',
    description: '专注于 React 项目结构和组件设计的深度代码审计。',
    category: '编程',
    tags: ['react', 'clean-code'],
    author: 'CodeMaster',
    likes: 42,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000,
    currentVersionId: 'v1',
    versions: [
      {
        id: 'v1',
        versionNumber: 1,
        content: "Act as a Senior React Architect. Review the following code for patterns that break separation of concerns, unnecessary prop drilling, and state management inefficiencies.",
        notes: 'Strict review criteria.',
        timestamp: Date.now() - 86400000 * 30
      }
    ]
  }
];
