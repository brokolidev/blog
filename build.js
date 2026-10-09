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

// Helper: Format Date String to Year, MonthDay, and Weekday
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

// Helper: Common Header
function getHeaderHtml(rootPrefix = '') {
  const homeLink = rootPrefix ? `${rootPrefix}index.html` : 'index.html';
  return `
  <header class="worklog-header">
    <div class="worklog-container">
      <div class="header-inner">
        <a href="${homeLink}" class="header-brand">
          <span>brokoli.dev</span>
          <span style="color: var(--text-faint);">/</span>
          <span class="badge-log">worklog</span>
        </a>

        <div class="header-actions">
          <a href="https://brokolidev.com" target="_blank" rel="noopener noreferrer" class="btn-ghost">
            <span>Portfolio</span>
            <i class="fas fa-arrow-up-right-from-square text-xs" style="opacity: 0.7;"></i>
          </a>
          <a href="https://github.com/brokolidev" target="_blank" rel="noopener noreferrer" class="btn-ghost" aria-label="GitHub">
            <i class="fab fa-github"></i>
          </a>
          <button type="button" id="theme-toggle" class="theme-btn" aria-label="Toggle theme">
            <i class="fas fa-sun text-xs text-amber-400"></i>
          </button>
        </div>
      </div>
    </div>
  </header>`;
}

// Helper: Common Footer
function getFooterHtml() {
  return `
  <footer class="worklog-footer">
    <div class="worklog-container">
      <div class="footer-inner">
        <p>© 2026 <strong>brokolidev</strong>. Minimalist engineering worklog.</p>
        <div class="footer-links">
          <a href="https://brokolidev.com">Portfolio</a>
          <a href="https://github.com/brokolidev/blog" target="_blank">Repository</a>
          <a href="https://linkedin.com/in/brokolidev" target="_blank">LinkedIn</a>
        </div>
      </div>
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

  // 1. Generate Individual Standalone Post Pages (for direct deep-linking)
  for (const post of posts) {
    const postHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${post.title} — brokoli.dev/worklog</title>
  <meta name="description" content="${post.excerpt}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  ${getHeaderHtml('../')}

  <main class="worklog-container" style="padding-top: 3rem; padding-bottom: 5rem;">
    <a href="../index.html" class="btn-ghost" style="margin-bottom: 2rem; display: inline-flex;">
      <i class="fas fa-arrow-left text-xs"></i>
      <span>Back to Timeline</span>
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

      <h1 style="font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1.5rem; color: var(--text-main);">
        ${post.title}
      </h1>

      <div class="prose-content">
        ${post.html}
      </div>
    </article>
  </main>

  ${getFooterHtml()}
  <script src="../js/main.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(DIST_POSTS_DIR, `${post.slug}.html`), postHtml, 'utf-8');
  }

  // 2. Generate Worklog Timeline Index Page
  const latestDate = posts.length > 0 ? posts[0].date : 'Today';

  const timelineHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Worklog — brokoli.dev</title>
  <meta name="description" content="Engineering worklog and architectural retrospective by Ted Choi. Chronological development notes with expandable timeline entries.">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  ${getHeaderHtml('')}

  <main class="worklog-container">
    <!-- Intro / Stats Bar -->
    <section class="worklog-intro">
      <h1 class="intro-title">Worklog</h1>
      <p class="intro-desc">
        Chronological records of architectural decisions, systems development, and engineering retrospect. Click any entry to expand details.
      </p>

      <div class="intro-stats-bar">
        <div class="stat-item">
          <span>Entries:</span>
          <span class="stat-highlight">${posts.length}</span>
          <span style="color: var(--border-default); margin: 0 0.4rem;">|</span>
          <span>Latest update:</span>
          <span class="stat-highlight">${latestDate}</span>
        </div>

        <div class="controls-bar">
          <button type="button" id="toggle-all-btn" class="toggle-all-btn">
            Expand All
          </button>
        </div>
      </div>
    </section>

    <!-- Timeline Sections by Year -->
    <section class="worklog-timeline">
      ${sortedYears
        .map(
          (year) => `
      <div class="year-block" id="year-${year}">
        <div class="year-heading">
          <span class="year-title">${year}</span>
          <span class="year-count-badge">${yearGroups[year].length} logs</span>
          <div class="year-divider"></div>
        </div>

        <div class="entries-list">
          ${yearGroups[year]
            .map(
              (post, idx) => `
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
