<div align="center">

# PromptVault 🗃️
### *Good prompts aren't lucky guesses—they're engineered iterations.*
### *好提示词不靠玄学，靠版本记录和一次次改写。*

</div>

---

<div align="center">

**[English](#english) · [中文](#chinese)**

</div>

---

<a name="english"></a>

## What is this?

**PromptVault** is a browser app for collecting prompts and actually using them. The **广场** (square) is a curated catalog you can fill in, copy, and save. **我的库** is your own library: create, edit, favorite, delete, and keep every rewrite on a version timeline.

Data stays in **localStorage**. Google Gemini rewrites run in your browser with a key you enter yourself — the Pages build does not contain an API key.

## ✨ Features

- 🟪 **Colorful square** — featured row, category bar, model filter, sort by popular / newest / most used
- 🧩 **Fill-in variables** — `{{变量}}` becomes inputs, with a live preview of the filled prompt
- ✨ **Gemini rewrite** — AI 优化 appends a new version and never overwrites history
- 📜 **Version timeline** — switch back when the new draft isn't better
- ⭐ **Favorites** — heart a square card or a prompt in your library
- 📤 **Import / export** — download and merge your library as JSON (the Gemini key is not included)
- 🌙 **Light / dark** — and `/` focuses search
- 📱 **Responsive** — 4 / 3 / 2 / 1 columns, drawer on small screens

## 🛠️ Tech Stack

```
Runtime:     React 19 · TypeScript · Vite 6 · Tailwind CSS
AI:          Google Gemini (@google/genai). Each browser stores its own key.
Storage:     localStorage (library, favorites, theme, API key)
Catalog:     data/square-prompts.json
Deploy:      GitHub Actions → GitHub Pages
```

## 🚀 Local development

```bash
git clone https://github.com/Timelovers/promptvault.git
cd promptvault
npm install
npm run dev
```

No API key is required to browse, copy, or edit. Open **设置** and paste a Gemini key only when you want **AI 优化**. The key is saved in this browser's localStorage and is not uploaded.

```bash
npm run build
npm run preview
```

## 🌐 Deploy to GitHub Pages

1. Push this repo to GitHub (or use your fork).
2. **Pages**: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Push to `main`. The **Deploy to GitHub Pages** workflow runs `npm run build` and publishes `dist/`.

The workflow does **not** read an `API_KEY` secret. If that secret is still on the repository, you can delete it. Visitors enter their own key in the app.

## 📚 Editing the square

Starter prompts live in [`data/square-prompts.json`](data/square-prompts.json). Append an object:

| Field | Notes |
| --- | --- |
| `id` | Stable id. 「加入我的库」 copies this id onto the library item as `sourceId`. |
| `title`, `description`, `category`, `model`, `tags`, `author` | Shown on the card. |
| `likes`, `uses` | Display stats for sorting. They are editorial, not live counters. |
| `featured` | `true` puts it in 本周精选. Keep this to a few cards. |
| `cover` | Tailwind stops such as `"from-sky-400 to-indigo-500"` (palette shades 200–700). |
| `createdAt` | `YYYY-MM-DD`. |
| `versions` | Oldest first. `{{变量名}}` becomes a fill-in field. |

Categories used by the filters: 办公效率, 编程开发, 学习成长, 产品设计, 内容创作, AI 绘图, 职场求职. Other categories still load if they are already in someone's library.

## 🔗 Live demo

- Pages: [timelovers.github.io/promptvault](https://timelovers.github.io/promptvault/)

## 📬 Contact

- GitHub: [@Timelovers](https://github.com/Timelovers)
- Website: [lijiaxing.com.cn](https://lijiaxing.com.cn/)

---

<a name="chinese"></a>

## 这是什么？

**PromptVault** 是跑在浏览器里的提示词工具。**广场**放着一批可以直接填空、复制、收进自己库的模板；**我的库**是你自己的提示词，可以新建、编辑、收藏、删除，每次改写都留在版本时间线上。

数据在 **localStorage**。Gemini 改写使用你自己填写的 Key，在浏览器里直接请求 Google。GitHub Pages 的构建产物里不再包含 API Key。

## ✨ 功能亮点

- 🟪 **提示词广场** — 本周精选、分类、模型筛选，按热门 / 最新 / 最多使用排序
- 🧩 **变量填空** — `{{变量}}` 会变成输入框，并实时预览填好的正文
- ✨ **Gemini 改写** — 「AI 优化」只追加新版本，不覆盖旧版本
- 📜 **版本时间线** — 新版本不顺手就切回去
- ⭐ **收藏** — 广场和我的库都能点亮小心心
- 📤 **导入 / 导出** — 我的库导出为 JSON，再合并导入。文件里不含 Gemini Key
- 🌙 **浅色 / 深色** — 按 `/` 聚焦搜索
- 📱 **响应式** — 四、三、二、一列，窄屏用抽屉看详情

## 🛠️ 技术栈

```
前端：    React 19 · TypeScript · Vite 6 · Tailwind CSS
模型：    Google Gemini（@google/genai，Key 由每位用户保存在自己的浏览器）
存储：    localStorage（提示词库、收藏、主题、API Key）
广场：    data/square-prompts.json
部署：    GitHub Actions → GitHub Pages
```

## 🚀 本地运行

```bash
git clone https://github.com/Timelovers/promptvault.git
cd promptvault
npm install
npm run dev
```

不填 Key 也能浏览、复制和编辑。要用 **AI 优化** 时，打开右上角 **设置**，粘贴自己的 Gemini API Key。密钥只写进这块浏览器的 localStorage，不会上传到服务器。

```bash
npm run build
npm run preview
```

## 🌐 部署到 GitHub Pages

1. 代码推到 GitHub。
2. **Settings → Pages**：部署来源选 **GitHub Actions**。
3. 推送到 `main`。工作流 **Deploy to GitHub Pages** 会执行 `npm run build` 并发布 **dist**。

构建**不再读取** `API_KEY` secret。仓库里如果还留着这个旧密钥，可以删掉。线上访客在页面设置里填写自己的 Key。

## 📚 修改广场内容

起始提示词在 [`data/square-prompts.json`](data/square-prompts.json)，按现有条目追加即可。

- `id`：稳定 id。「加入我的库」会把这个 id 记到库条目的 `sourceId` 上，避免重复收藏成两条。
- `likes` / `uses`：卡片上的展示数字，用来排序，不是实时计数。
- `featured: true`：出现在「本周精选」，建议只留几条。
- `cover`：Tailwind 渐变，例如 `"from-sky-400 to-indigo-500"`（色阶 200–700）。
- `versions`：从旧到新。正文里的 `{{变量名}}` 会变成填空。

筛选条上的分类是：办公效率、编程开发、学习成长、产品设计、内容创作、AI 绘图、职场求职。老数据里的其他分类（例如「创意写作」）仍会显示在我的库里。

## 🔗 在线访问

- 演示：[timelovers.github.io/promptvault](https://timelovers.github.io/promptvault/)

## 📬 联系方式

- GitHub：[@Timelovers](https://github.com/Timelovers)
- 主页：[lijiaxing.com.cn](https://lijiaxing.com.cn/)

---

> 「铸魂于言，迭代于心。」
>
> *Shape the soul in words; iterate with intention.*

---

<div align="center">

Made with 💜 by [Sara](https://lijiaxing.com.cn/) · [@Timelovers](https://github.com/Timelovers)

</div>
