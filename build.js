import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import frontMatter from 'front-matter';
import { marked } from 'marked';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';

// Safely load common languages for syntax highlighting
try {
  loadLanguages(['bash', 'json', 'javascript', 'typescript', 'python', 'php', 'css']);
} catch (e) {
  // Ignore fallback
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom marked renderer with Prism code highlighting
const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }) {
  const cleanLang = (lang || '').toLowerCase().trim();
  let highlighted = text;
  if (cleanLang && Prism.languages[cleanLang]) {
    try {
      highlighted = Prism.highlight(text, Prism.languages[cleanLang], cleanLang);
    } catch (e) {
      highlighted = text;
    }
  }
  return `<pre><code class="language-${cleanLang || 'text'}">${highlighted}</code></pre>`;
};
marked.setOptions({ renderer });

const POSTS_DIR = path.join(__dirname, 'content', 'posts');
const DIST_DIR = path.join(__dirname, 'dist');
const DIST_POSTS_DIR = path.join(DIST_DIR, 'posts');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Google Analytics Tag (gtag.js) - Unified brokolidev.com Property
const GA_TAG_HTML = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-0KR5V5X1NT"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-0KR5V5X1NT');
  </script>`;

// Helper: Common Favicons & Web Manifest
function getFaviconHtml(rootPrefix = '') {
  return `
  <!-- Favicons & Manifest -->
  <link rel="icon" type="image/x-icon" href="${rootPrefix}favicon.ico">
  <link rel="shortcut icon" href="${rootPrefix}img/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="${rootPrefix}img/favicon_io/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${rootPrefix}img/favicon_io/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${rootPrefix}img/favicon_io/apple-touch-icon.png">
  <link rel="manifest" href="${rootPrefix}img/favicon_io/site.webmanifest">`;
}

// Helper: Copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper: Format Date String safely without UTC timezone shift
function parseDateParts(dateStr) {
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  let year = 2026, month = '10', day = '08';
  let d;
  if (match) {
    year = Number(match[1]);
    month = match[2];
    day = match[3];
    d = new Date(year, Number(month) - 1, Number(day));
  } else {
    d = new Date(dateStr);
    year = d.getFullYear() || 2026;
    month = String(d.getMonth() + 1).padStart(2, '0');
    day = String(d.getDate()).padStart(2, '0');
  }

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const weekday = weekdays[d.getDay()] || 'DAY';
  return {
    year: String(year),
    monthDay: `${month}.${day}`,
    weekday,
    full: `${year}.${month}.${day}`,
  };
}

// Strict Zero-Flash Bilingual CSS Guard (Inlined in head to eliminate caching issues)
const CRITICAL_LANG_CSS = `
  <style id="bilingual-guard-style">
    /* Show ONLY active language, never both */
    html[data-lang="ko"] .lang-en,
    html:not([data-lang="en"]) .lang-en {
      display: none !important;
    }
    html[data-lang="en"] .lang-ko {
      display: none !important;
    }
  </style>`;

// Head Initialization Script (Zero-Flash + Instant Fail-Safe Language Toggle)
function getHeadInitScript() {
  return `
  <script>
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    var savedLang = localStorage.getItem('lang');
    var activeLang = 'ko';
    if (savedLang === 'ko' || savedLang === 'en') {
      activeLang = savedLang;
    } else {
      var navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang && !navLang.startsWith('ko') && navLang.startsWith('en')) {
        activeLang = 'en';
      }
    }
    document.documentElement.setAttribute('data-lang', activeLang);

    // Global fail-safe language toggle (instant execution, zero cache-lag, no double toggle)
    window.toggleAppLanguage = function (e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }
      var html = document.documentElement;
      var cur = html.getAttribute('data-lang') === 'en' ? 'en' : 'ko';
      var next = cur === 'ko' ? 'en' : 'ko';
      html.setAttribute('data-lang', next);
      try {
        localStorage.setItem('lang', next);
      } catch (err) {}
    };
  </script>`;
}

// Helper: Common Header - 100% Identical metrics with brokolidev.com
function getHeaderHtml(rootPrefix = '') {
  return `
  <!-- Ambient Background Light Effects (Identical to brokolidev.com) -->
  <div class="ambient-glow" aria-hidden="true">
    <div class="ambient-blob-1"></div>
    <div class="ambient-blob-2"></div>
  </div>

  <header class="site-header">
    <div class="header-outer">
      <div class="header-inner">
        <!-- Brand / Logo -->
        <a href="https://brokolidev.com" class="header-brand">
          <span>brokoli<span class="text-accent">.dev</span></span>
        </a>

        <!-- Navigation Links & Theme Toggle -->
        <nav class="header-nav">
          <a href="https://brokolidev.com" class="nav-tab-inactive">
            <span>Profile</span>
          </a>
          <a href="${rootPrefix ? rootPrefix + 'index.html' : '/'}" class="nav-tab-active">
            <span>Blog</span>
          </a>
          <a href="https://history.brokolidev.com" class="nav-tab-inactive">
            <span>History</span>
          </a>

          <!-- Theme Toggle -->
          <button type="button" id="theme-toggle" aria-label="Toggle theme" class="theme-btn">
            <i class="fas fa-sun theme-icon-sun"></i>
            <i class="fas fa-moon theme-icon-moon"></i>
          </button>
        </nav>
      </div>
    </div>
  </header>`;
}

// Helper: Common Footer
function getFooterHtml() {
  return `
  <footer class="site-footer">
    <div class="footer-inner">
      <p>© 2026 <strong>brokolidev.com</strong> · Ted Choi</p>
    </div>
  </footer>`;
}

// AI Translation Disclaimer notice for English versions
const EN_DISCLAIMER_HTML = `
<div class="ai-disclaimer" role="note">
  <span class="ai-disclaimer-badge"><i class="fas fa-robot"></i> AI Translated</span>
  <span class="ai-disclaimer-text">Please note that this post was translated by AI and may feel slightly awkward or unnatural. If you wish to experience the raw, genuine sentiment of my writing, you should probably learn Korean! 😉</span>
</div>`;

function formatEnContent(html) {
  if (!html) return '';
  if (html.includes('ai-disclaimer')) return html;
  return `${EN_DISCLAIMER_HTML}\n${html}`;
}

// Build Pipeline
async function build() {
  console.log('⚡️ Compiling minimalist bilingual Worklog...');

  if (fs.existsSync(DIST_POSTS_DIR)) {
    fs.rmSync(DIST_POSTS_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_POSTS_DIR, { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'css'), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'js'), { recursive: true });

  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const postFiles = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const postMap = {};

  for (const file of postFiles) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const parsed = frontMatter(raw);

    let lang = (parsed.attributes.lang || '').toLowerCase();
    if (!lang) {
      if (file.endsWith('.en.md')) lang = 'en';
      else if (file.endsWith('.ko.md')) lang = 'ko';
      else lang = 'ko';
    }

    let baseSlug = parsed.attributes.slug;
    if (!baseSlug) {
      baseSlug = file.replace(/\.(ko|en)\.md$/, '').replace(/\.md$/, '');
    }

    const dateMeta = parseDateParts(parsed.attributes.date || '2026-10-08');

    const item = {
      ...parsed.attributes,
      lang,
      slug: baseSlug,
      title: parsed.attributes.title || baseSlug,
      body: parsed.body,
      html: marked(parsed.body),
      date: parsed.attributes.date || '2026-10-08',
      dateMeta,
      readTime: parsed.attributes.readTime || '1 min',
      tags: parsed.attributes.tags || [],
      category: parsed.attributes.category || 'Essay',
      excerpt: parsed.attributes.excerpt || '',
    };

    if (!postMap[baseSlug]) {
      postMap[baseSlug] = {
        slug: baseSlug,
        date: item.date,
        dateMeta: item.dateMeta,
        ko: null,
        en: null,
      };
    }

    if (lang === 'en') {
      postMap[baseSlug].en = item;
    } else {
      postMap[baseSlug].ko = item;
    }
  }

  // Fallback: If either ko or en is missing, mirror the other
  const pairedPosts = Object.values(postMap).map((group) => {
    if (!group.ko && group.en) {
      group.ko = { ...group.en, lang: 'ko' };
    }
    if (!group.en && group.ko) {
      group.en = { ...group.ko, lang: 'en' };
    }
    return group;
  });

  // Sort by date descending
  pairedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group by Year
  const yearGroups = {};
  for (const post of pairedPosts) {
    const yr = post.dateMeta.year;
    if (!yearGroups[yr]) yearGroups[yr] = [];
    yearGroups[yr].push(post);
  }
  const sortedYears = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));

  // 1. Generate Individual Standalone Post Pages
  for (const post of pairedPosts) {
    const postHtml = `<!DOCTYPE html>
<html lang="en" class="h-full antialiased dark" data-lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#09090b">

  <!-- Primary Meta Tags -->
  <title class="lang-ko">${post.ko.title} - Blog - brokolidev</title>
  <meta name="title" content="${post.ko.title} - Blog - brokolidev">
  <meta name="description" content="${(post.ko.excerpt || '').replace(/"/g, '&quot;')}">
  <meta name="keywords" content="${[...post.ko.tags, post.ko.category, 'brokolidev', 'Engineering Worklog', 'Ted Choi'].join(', ')}">
  <meta name="author" content="Ted Choi">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://blog.brokolidev.com/posts/${post.slug}.html">

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="brokolidev">
  <meta property="og:title" content="${post.ko.title} - Blog - brokolidev">
  <meta property="og:description" content="${(post.ko.excerpt || '').replace(/"/g, '&quot;')}">
  <meta property="og:url" content="https://blog.brokolidev.com/posts/${post.slug}.html">
  <meta property="og:image" content="https://brokolidev.com/img/profile.png">
  <meta property="article:published_time" content="${post.date}">
  <meta property="article:author" content="Ted Choi">
  <meta property="og:locale" content="en_US">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.ko.title} - Blog - brokolidev">
  <meta name="twitter:description" content="${(post.ko.excerpt || '').replace(/"/g, '&quot;')}">
  <meta name="twitter:image" content="https://brokolidev.com/img/profile.png">
  <meta name="twitter:creator" content="@brokolidev">

  ${getFaviconHtml('../')}

  <!-- Fonts -->
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css?v=20261008c">
  ${CRITICAL_LANG_CSS}
  ${getHeadInitScript()}

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.ko.title.replace(/"/g, '\\"')}",
    "datePublished": "${post.date}",
    "description": "${(post.ko.excerpt || '').replace(/"/g, '\\"')}",
    "url": "https://blog.brokolidev.com/posts/${post.slug}.html",
    "author": {
      "@type": "Person",
      "name": "Ted Choi",
      "url": "https://brokolidev.com"
    }
  }
  </script>

  ${GA_TAG_HTML}
</head>
<body>
  ${getHeaderHtml('../')}

  <main class="main-wrapper">
    <div class="main-outer">
      <div class="main-inner">
        <div class="post-top-nav" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <a href="../index.html" class="nav-tab-active" style="display: inline-flex; gap: 0.4rem;">
            <i class="fas fa-arrow-left" style="font-size: 0.75rem;"></i>
            <span>Timeline</span>
          </a>
          <button type="button" class="lang-toggle-btn" id="lang-toggle-btn" onclick="toggleAppLanguage(event)" aria-label="Toggle language">
            <span class="lang-toggle-opt lang-opt-ko">KR</span>
            <span class="lang-toggle-sep">/</span>
            <span class="lang-toggle-opt lang-opt-en">EN</span>
          </button>
        </div>

        <article class="log-item is-open" style="border: none; background: transparent; box-shadow: none;">
          <div class="log-meta-strip" style="border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
            <div>
              <span class="log-date" style="font-size: 0.9rem;">${post.date}</span>
              <span style="margin: 0 0.5rem; color: var(--text-faint);">•</span>
              <span class="log-tag lang-ko">${post.ko.category}</span>
              <span class="log-tag lang-en">${post.en.category}</span>
              <span style="margin: 0 0.5rem; color: var(--text-faint);">•</span>
              <span class="lang-ko">${post.ko.readTime}</span>
              <span class="lang-en">${post.en.readTime}</span>
            </div>
          </div>

          <h1 class="lang-ko" style="font-size: 1.85rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1.5rem; color: var(--text-main);">
            ${post.ko.title}
          </h1>
          <h1 class="lang-en" style="font-size: 1.85rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1.5rem; color: var(--text-main);">
            ${post.en.title}
          </h1>

          <div class="prose-content lang-ko">
            ${post.ko.html}
          </div>
          <div class="prose-content lang-en">
            ${formatEnContent(post.en.html)}
          </div>
        </article>
      </div>
    </div>
  </main>

  ${getFooterHtml()}
  <script src="../js/main.js?v=20261008c"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(DIST_POSTS_DIR, `${post.slug}.html`), postHtml, 'utf-8');
  }

  // 2. Generate Worklog Timeline Index Page
  const timelineHtml = `<!DOCTYPE html>
<html lang="en" class="h-full antialiased dark" data-lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#09090b">

  <!-- Primary Meta Tags -->
  <title>Blog - brokolidev</title>
  <meta name="title" content="Blog - brokolidev">
  <meta name="description" content="Engineering worklog, architecture retrospectives, and development notes by Ted Choi.">
  <meta name="keywords" content="Ted Choi, Software Engineer, Full Stack, Laravel, TypeScript, Docker, Cloud, AI Developer, brokolidev, Engineering Blog, Worklog">
  <meta name="author" content="Ted Choi">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://blog.brokolidev.com/">

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="brokolidev">
  <meta property="og:title" content="Blog - brokolidev">
  <meta property="og:description" content="Engineering worklog, architecture retrospectives, and development notes by Ted Choi.">
  <meta property="og:url" content="https://blog.brokolidev.com/">
  <meta property="og:image" content="https://brokolidev.com/img/profile.png">
  <meta property="og:locale" content="en_US">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Blog - brokolidev">
  <meta name="twitter:description" content="Engineering worklog, architecture retrospectives, and development notes by Ted Choi.">
  <meta name="twitter:image" content="https://brokolidev.com/img/profile.png">
  <meta name="twitter:creator" content="@brokolidev">

  ${getFaviconHtml('')}

  <!-- Fonts -->
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css?v=20261008c">
  ${CRITICAL_LANG_CSS}
  ${getHeadInitScript()}

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Blog - brokolidev",
    "url": "https://blog.brokolidev.com/",
    "description": "Engineering worklog, architecture retrospectives, and development notes by Ted Choi.",
    "author": {
      "@type": "Person",
      "name": "Ted Choi",
      "url": "https://brokolidev.com"
    }
  }
  </script>

  ${GA_TAG_HTML}
</head>
<body>
  ${getHeaderHtml('')}

  <main class="main-wrapper">
    <div class="main-outer">
      <div class="main-inner">
        <!-- Timeline Sections by Year -->
        <section class="worklog-timeline">
          ${sortedYears
            .map(
              (year, yearIdx) => `
          <div class="year-block" id="year-${year}">
            <div class="year-heading">
              <span class="year-title">${year}</span>
              <span class="year-count-badge">${yearGroups[year].length}</span>
              <div class="year-divider"></div>
              ${
                yearIdx === 0
                  ? `<div class="year-heading-actions">
                       <button type="button" id="toggle-all-btn" class="toggle-all-btn">Expand All</button>
                       <button type="button" id="lang-toggle-btn" class="lang-toggle-btn" onclick="toggleAppLanguage(event)" aria-label="Toggle language">
                         <span class="lang-toggle-opt lang-opt-ko">KR</span>
                         <span class="lang-toggle-sep">/</span>
                         <span class="lang-toggle-opt lang-opt-en">EN</span>
                       </button>
                     </div>`
                  : ''
              }
            </div>

            <div class="entries-list">
              ${yearGroups[year]
                .map(
                  (post, postIdx) => `
              <div class="log-item${yearIdx === 0 && postIdx === 0 ? ' is-open' : ''}" data-slug="${post.slug}">
                <div class="log-summary">
                  <div class="log-summary-left">
                    <span class="log-date">${post.dateMeta.monthDay} <span style="font-size: 0.72rem; opacity: 0.75;">${post.dateMeta.weekday}</span></span>
                    
                    <span class="log-title lang-ko">${post.ko.title}</span>
                    <span class="log-title lang-en">${post.en.title}</span>

                    <div class="log-tags">
                      <span class="log-tag lang-ko">${post.ko.category}</span>
                      <span class="log-tag lang-en">${post.en.category}</span>
                    </div>
                  </div>
                  <div class="log-summary-right">
                    <span class="log-readtime lang-ko">${post.ko.readTime}</span>
                    <span class="log-readtime lang-en">${post.en.readTime}</span>
                    <i class="fas fa-chevron-down log-chevron"></i>
                  </div>
                </div>

                <div class="log-content">
                  <div class="log-meta-strip">
                    <div>
                      <span>Date: <strong>${post.date}</strong></span>
                      <span style="margin: 0 0.5rem; opacity: 0.5;">•</span>
                      <span class="lang-ko">Tags: ${post.ko.tags.map((t) => `#${t}`).join(' ')}</span>
                      <span class="lang-en">Tags: ${post.en.tags.map((t) => `#${t}`).join(' ')}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <button type="button" class="log-permalink-btn" data-slug="${post.slug}" title="Copy shareable link">
                        <i class="fas fa-link"></i> Link
                      </button>
                    </div>
                  </div>

                  <div class="prose-content lang-ko">
                    ${post.ko.html}
                  </div>
                  <div class="prose-content lang-en">
                    ${formatEnContent(post.en.html)}
                  </div>
                </div>
              </div>`
                )
                .join('')}
            </div>
          </div>`
            )
            .join('')}
        </section>
      </div>
    </div>
  </main>

  ${getFooterHtml()}
  <script src="js/main.js?v=20261008c"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), timelineHtml, 'utf-8');
  fs.copyFileSync(path.join(__dirname, 'src', 'css', 'style.css'), path.join(DIST_DIR, 'css', 'style.css'));
  fs.copyFileSync(path.join(__dirname, 'src', 'js', 'main.js'), path.join(DIST_DIR, 'js', 'main.js'));
  fs.writeFileSync(path.join(__dirname, 'index.html'), timelineHtml, 'utf-8');

  // Copy public assets (favicons, manifests, etc.) to dist and root
  copyDirRecursive(PUBLIC_DIR, DIST_DIR);
  copyDirRecursive(PUBLIC_DIR, __dirname);

  console.log(`✅ Bilingual Worklog build complete! Processed ${pairedPosts.length} entries across ${sortedYears.length} years.`);
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
