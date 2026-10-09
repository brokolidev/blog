# blog.brokolidev.com

A lightning-fast, zero-cost static developer worklog and engineering blog built with pure **Markdown**, **Vanilla CSS**, and a lightweight **Bun Static Site Generator (SSG)**.

---

## ✨ Features

- **Zero-Cost & Serverless**: No database, no server maintenance, 100% pre-rendered static HTML.
- **Rich Aesthetics**:
  - Matches the `brokolidev.com` signature aesthetic: Zinc 950 base, Teal-500 accents, and subtle ambient light glow.
  - Interactive Dark/Light mode toggle with persistence in `localStorage`.
  - Modern typography powered by Inter & JetBrains Mono.
- **Interactive Worklog Timeline**: Clean date & year-based collapsible worklog accordion.
- **Code Block Enhancements**: Prism syntax highlighting for multiple languages with one-click code copy button.
- **Conversational Publishing**: Add articles by creating `.md` files in `content/posts/` and running `bun run build`.

---

## 🚀 Getting Started with Bun

### 1. Install Dependencies
```bash
bun install
```

### 2. Build Static Site
```bash
bun run build
# Compiles Markdown in content/posts/ into production HTML files in dist/
```

### 3. Local Development Preview
```bash
bun run dev
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
category: "Engineering"
tags: ["DevOps", "Architecture"]
excerpt: "A concise summary of what this article covers."
author: "Ted Choi"
readTime: "3 min"
---

## First Heading

Your article content in standard Markdown format...
```

Run `bun run build` to generate the new static page instantly.
