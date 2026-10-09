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

// Helper: Format Date String
function parseDateParts(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear() || 2026;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const weekday = weekdays[d.getDay()] || 'DAY';
  return {
    year: String(year),
    monthDay: `${month}.${day}`,
    weekday,
    full: `${year}.${month}.${day}`,
  };
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

// Build Pipeline
async function build() {
  console.log('⚡️ Compiling minimalist Worklog...');

  fs.mkdirSync(DIST_POSTS_DIR, { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'css'), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'js'), { recursive: true });

  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const postFiles = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts = [];

  for (const file of postFiles) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const parsed = frontMatter(raw);
    const dateMeta = parseDateParts(parsed.attributes.date || '2026-10-09');

    const postData = {
      ...parsed.attributes,
      body: parsed.body,
      html: marked(parsed.body),
      slug: parsed.attributes.slug || file.replace(/\.md$/, ''),
      date: parsed.attributes.date || '2026-10-09',
      dateMeta,
      readTime: parsed.attributes.readTime || '3 min',
      tags: parsed.attributes.tags || [],
      category: parsed.attributes.category || 'Engineering',
      excerpt: parsed.attributes.excerpt || '',
    };
    posts.push(postData);
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group by Year
  const yearGroups = {};
  for (const post of posts) {
    const yr = post.dateMeta.year;
    if (!yearGroups[yr]) yearGroups[yr] = [];
    yearGroups[yr].push(post);
  }
  const sortedYears = Object.keys(yearGroups).sort((a, b) => Number(b) - Number(a));

  // 1. Generate Individual Standalone Post Pages
  for (const post of posts) {
    const postHtml = `<!DOCTYPE html>
<html lang="en" class="h-full antialiased dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${post.title} — brokoli.dev</title>
  <meta name="description" content="${post.excerpt}">
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <script>
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  </script>
</head>
<body>
  ${getHeaderHtml('../')}

  <main class="main-wrapper">
    <div class="main-outer">
      <div class="main-inner">
        <a href="../index.html" class="nav-tab-active" style="margin-bottom: 2rem; display: inline-flex; gap: 0.4rem;">
          <i class="fas fa-arrow-left" style="font-size: 0.75rem;"></i>
          <span>Timeline</span>
        </a>

        <article class="log-item is-open" style="border: none; background: transparent; box-shadow: none;">
          <div class="log-meta-strip" style="border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
            <div>
              <span class="log-date" style="font-size: 0.9rem;">${post.date}</span>
              <span style="margin: 0 0.5rem; color: var(--text-faint);">•</span>
              <span class="log-tag">${post.category}</span>
              <span style="margin: 0 0.5rem; color: var(--text-faint);">•</span>
              <span>${post.readTime}</span>
            </div>
          </div>

          <h1 style="font-size: 1.85rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1.5rem; color: var(--text-main);">
            ${post.title}
          </h1>

          <div class="prose-content">
            ${post.html}
          </div>
        </article>
      </div>
    </div>
  </main>

  ${getFooterHtml()}
  <script src="../js/main.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(DIST_POSTS_DIR, `${post.slug}.html`), postHtml, 'utf-8');
  }

  // 2. Generate Worklog Timeline Index Page
  const timelineHtml = `<!DOCTYPE html>
<html lang="en" class="h-full antialiased dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>brokoli.dev</title>
  <meta name="description" content="Development logs and architectural notes by Ted Choi.">
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <script>
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  </script>
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
                  ? `<button type="button" id="toggle-all-btn" class="toggle-all-btn">Expand All</button>`
                  : ''
              }
            </div>

            <div class="entries-list">
              ${yearGroups[year]
                .map(
                  (post) => `
              <div class="log-item" data-slug="${post.slug}">
                <div class="log-summary">
                  <div class="log-summary-left">
                    <span class="log-date">${post.dateMeta.monthDay} <span style="font-size: 0.72rem; opacity: 0.75;">${post.dateMeta.weekday}</span></span>
                    <span class="log-title">${post.title}</span>
                    <div class="log-tags">
                      <span class="log-tag">${post.category}</span>
                    </div>
                  </div>
                  <div class="log-summary-right">
                    <span class="log-readtime">${post.readTime}</span>
                    <i class="fas fa-chevron-down log-chevron"></i>
                  </div>
                </div>

                <div class="log-content">
                  <div class="log-meta-strip">
                    <div>
                      <span>Full Date: <strong>${post.date}</strong></span>
                      <span style="margin: 0 0.5rem; opacity: 0.5;">•</span>
                      <span>Tags: ${post.tags.map((t) => `#${t}`).join(' ')}</span>
                    </div>
                    <button type="button" class="log-permalink-btn" data-slug="${post.slug}" title="Copy shareable link">
                      <i class="fas fa-link"></i> Link
                    </button>
                  </div>

                  <div class="prose-content">
                    ${post.html}
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
  <script src="js/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), timelineHtml, 'utf-8');
  fs.copyFileSync(path.join(__dirname, 'src', 'css', 'style.css'), path.join(DIST_DIR, 'css', 'style.css'));
  fs.copyFileSync(path.join(__dirname, 'src', 'js', 'main.js'), path.join(DIST_DIR, 'js', 'main.js'));
  fs.writeFileSync(path.join(__dirname, 'index.html'), timelineHtml, 'utf-8');

  console.log(`✅ Worklog build complete! Processed ${posts.length} entries across ${sortedYears.length} years.`);
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
