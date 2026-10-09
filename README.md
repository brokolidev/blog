# 🥦 brokoli.blog (blog.brokolidev.com)

A lightning-fast, zero-cost static developer blog built with pure **Markdown**, **Vanilla CSS**, and a lightweight **Node.js Static Site Generator (SSG)**.

Designed to deploy seamlessly to **Cloudflare Pages** with unlimited bandwidth and sub-20ms global edge delivery.

---

## ✨ Features

- **Zero-Cost & Serverless**: No database, no server maintenance, 100% pre-rendered static HTML.
- **Rich Aesthetics**:
  - Matches the `brokolidev.com` signature aesthetic: Zinc 950 base, Teal-500 & Cyan accents, and subtle ambient light glow.
  - Interactive Dark/Light mode toggle with persistence in `localStorage`.
  - Modern typography powered by Google Fonts (Inter & JetBrains Mono).
- **Instant Search & Category Filter**: Client-side instant keyword filtering and category tag chips.
- **Reading Progress Bar**: Dynamic scroll progress bar on all article pages.
- **Code Block Enhancements**: Prism syntax highlighting for multiple languages with one-click code copy button.
- **Conversational Publishing**: Add articles by creating `.md` files in `content/posts/` and running `node build.js`.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Static Site
```bash
npm run build
# Compiles Markdown in content/posts/ into production HTML files in dist/
```

### 3. Local Development Preview
```bash
npm run dev
# Starts local server at http://localhost:8080/
```
Or open `dist/index.html` directly in your browser:
```bash
open dist/index.html
```

---

## ✍️ Writing a New Article

Simply add a Markdown file inside `content/posts/YYYY-MM-DD-your-slug.md`:

```markdown
---
title: "Your Article Title"
slug: "your-article-slug"
date: "2026-10-09"
category: "Cloud & DevOps"
tags: ["Cloudflare", "Architecture"]
excerpt: "A concise summary of what this article covers."
author: "Ted Choi"
readTime: "3 min read"
featured: false
---

## First Heading

Your article content in standard Markdown format...
```

Run `npm run build` to generate the new static page instantly.

---

## 🌐 Cloudflare Pages Deployment

Deploy via Cloudflare Pages using GitHub Actions or direct upload:

```bash
npx wrangler pages deploy dist --project-name=brokolidev-blog
```
Custom Domain: `blog.brokolidev.com`
