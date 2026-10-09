import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import frontMatter from 'front-matter';
import { marked } from 'marked';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';

// Safely load common languages
try {
  loadLanguages(['bash', 'json', 'javascript', 'typescript', 'python', 'php', 'css']);
} catch (e) {
  // Ignore fallback warnings
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom marked renderer for Prism code highlighting
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

// Helper: Common Header HTML
function getHeaderHtml(rootPrefix = '') {
  const homeLink = rootPrefix ? `${rootPrefix}index.html` : 'index.html';
  return `
  <!-- Ambient Lighting Layer -->
  <div class="bg-ambient-layer" aria-hidden="true">
    <div class="ambient-orb-1"></div>
    <div class="ambient-orb-2"></div>
  </div>

  <!-- Header -->
  <header class="site-header">
    <div class="container">
      <div class="nav-wrapper">
        <a href="${homeLink}" class="brand-link">
          <span class="brand-badge">🥦</span>
          <span class="brand-title">brokoli<span class="brand-accent">.blog</span></span>
          <span class="brand-tag">v1.0</span>
        </a>

        <div class="nav-actions">
          <a href="https://brokolidev.com" target="_blank" rel="noopener noreferrer" class="nav-link">
            <i class="fas fa-arrow-up-right-from-square text-xs"></i>
            <span>Portfolio</span>
          </a>
          <a href="https://github.com/brokolidev" target="_blank" rel="noopener noreferrer" class="btn-icon" aria-label="GitHub">
            <i class="fab fa-github"></i>
          </a>
          <button type="button" id="theme-toggle" class="btn-icon" aria-label="Toggle theme">
            <i class="fas fa-sun text-amber-400"></i>
          </button>
        </div>
      </div>
    </div>
  </header>`;
}

// Helper: Common Footer HTML
function getFooterHtml() {
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <div>
          <p>© 2026 <strong>brokolidev</strong>. Written by Ted Choi in Calgary, AB.</p>
          <p class="text-xs text-zinc-500 mt-1">Zero-cost static SSG hosted globally via Cloudflare Pages.</p>
        </div>
        <div class="footer-links">
          <a href="https://brokolidev.com" class="footer-link">About Ted</a>
          <a href="https://linkedin.com/in/brokolidev" target="_blank" class="footer-link">LinkedIn</a>
          <a href="https://github.com/brokolidev" target="_blank" class="footer-link">GitHub</a>
        </div>
      </div>
    </div>
  </footer>`;
}

// Build Function
async function build() {
  console.log('🚀 Starting brokolidev blog static build...');

  // Ensure directories exist
  fs.mkdirSync(DIST_POSTS_DIR, { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'css'), { recursive: true });
  fs.mkdirSync(path.join(DIST_DIR, 'js'), { recursive: true });

  // Read all markdown files
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const postFiles = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts = [];

  for (const file of postFiles) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const parsed = frontMatter(raw);
    const postData = {
      ...parsed.attributes,
      body: parsed.body,
      html: marked(parsed.body),
      slug: parsed.attributes.slug || file.replace(/\.md$/, ''),
      date: parsed.attributes.date || '2026-10-09',
      readTime: parsed.attributes.readTime || '3 min read',
      tags: parsed.attributes.tags || [],
      category: parsed.attributes.category || 'General',
      excerpt: parsed.attributes.excerpt || '',
      featured: !!parsed.attributes.featured,
    };
    posts.push(postData);
  }

  // Sort posts by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 1. Generate Individual Post Pages
  for (const post of posts) {
    const postHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${post.title} — brokoli.blog</title>
  <meta name="description" content="${post.excerpt}">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.excerpt}">
  <meta property="og:type" content="article">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <div id="reading-progress-bar" class="reading-progress-bar"></div>
  ${getHeaderHtml('../')}

  <main class="container-narrow">
    <article>
      <header class="article-header">
        <a href="../index.html" class="back-link">
          <i class="fas fa-arrow-left"></i>
          <span>Back to All Articles</span>
        </a>
        <div class="article-tags">
          <span class="post-card-tag">${post.category}</span>
          ${post.tags.map((t) => `<span class="post-card-tag" style="background: var(--bg-surface); color: var(--text-muted);">${t}</span>`).join(' ')}
        </div>
        <h1 class="article-title">${post.title}</h1>
        <div class="article-meta-bar">
          <div class="author-chip">
            <span style="font-size: 1.25rem;">🥦</span>
            <span>${post.author || 'Ted Choi'}</span>
          </div>
          <span>•</span>
          <span><i class="far fa-calendar-alt mr-1"></i> ${post.date}</span>
          <span>•</span>
          <span><i class="far fa-clock mr-1"></i> ${post.readTime}</span>
        </div>
      </header>

      <div class="article-body">
        ${post.html}
      </div>

      <!-- Author Bio Box -->
      <div class="author-box">
        <div style="font-size: 3rem;">🥦</div>
        <div class="author-box-content">
          <h4>Ted Choi (brokolidev)</h4>
          <p>Software Engineer in Calgary with 10+ years of full-stack engineering, cloud infrastructure, and AI-driven automation experience.</p>
          <div class="author-box-links">
            <a href="https://brokolidev.com" target="_blank" class="author-link"><i class="fas fa-globe"></i> Portfolio</a>
            <a href="https://github.com/brokolidev" target="_blank" class="author-link"><i class="fab fa-github"></i> GitHub</a>
            <a href="https://linkedin.com/in/brokolidev" target="_blank" class="author-link"><i class="fab fa-linkedin"></i> LinkedIn</a>
          </div>
        </div>
      </div>
    </article>
  </main>

  ${getFooterHtml()}
  <script src="../js/main.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(DIST_POSTS_DIR, `${post.slug}.html`), postHtml, 'utf-8');
  }

  // 2. Generate Index Home Page
  const featured = posts.find((p) => p.featured) || posts[0];
  const regularPosts = posts.filter((p) => p !== featured);

  const categories = ['All', ...new Set(posts.map((p) => p.category))];

  const indexHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>brokoli.blog — Notes on Code, Cloud & AI Engineering</title>
  <meta name="description" content="Technical blog of Ted Choi (brokolidev). Practical thoughts on full-stack architecture, Cloudflare Pages, autonomous AI agents, and developer velocity.">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  ${getHeaderHtml('home')}

  <main class="container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-pill">
        <span class="hero-pill-dot"></span>
        <span>ENGINEERING LOGS & RETROSPECTIVES</span>
      </div>
      <h1 class="hero-title">
        Exploring Modern Code,<br>
        <span class="hero-title-gradient">Architecture & Autonomous AI.</span>
      </h1>
      <p class="hero-description">
        Curated field notes, architectural deep dives, and zero-cost cloud automation experiments by Ted Choi.
      </p>
    </section>

    ${
      featured
        ? `<!-- Featured Article -->
    <a href="posts/${featured.slug}.html" id="featured-card" class="featured-card">
      <div class="featured-header">
        <span class="featured-badge">
          <i class="fas fa-bolt text-amber-400"></i>
          FEATURED POST
        </span>
        <div class="featured-meta">
          <span>${featured.date}</span>
          <span>•</span>
          <span>${featured.readTime}</span>
        </div>
      </div>
      <h2 class="featured-title">${featured.title}</h2>
      <p class="featured-excerpt">${featured.excerpt}</p>
      <div class="post-card-footer">
        <span class="post-card-tag">${featured.category}</span>
        <span class="inline-flex items-center gap-1 font-semibold">
          Read Article <i class="fas fa-arrow-right"></i>
        </span>
      </div>
    </a>`
        : ''
    }

    <!-- Filter & Search Toolbar -->
    <div class="filter-bar">
      <div class="category-chips">
        ${categories
          .map(
            (cat, idx) => `
          <button type="button" class="chip-btn ${idx === 0 ? 'active' : ''}" data-filter="${cat.toLowerCase()}">
            ${cat}
          </button>`
          )
          .join('')}
      </div>

      <div class="search-input-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input type="text" id="search-input" class="search-input" placeholder="Search articles...">
      </div>
    </div>

    <!-- Posts Grid -->
    <div class="posts-grid">
      ${posts
        .map(
          (post) => `
      <article class="post-card" data-category="${post.category.toLowerCase()}">
        <div class="post-card-meta">
          <span class="post-card-tag">${post.category}</span>
          <span>•</span>
          <span>${post.readTime}</span>
        </div>
        <h3 class="post-card-title">${post.title}</h3>
        <p class="post-card-excerpt">${post.excerpt}</p>
        <div class="post-card-footer">
          <span class="text-xs text-zinc-500 font-mono">${post.date}</span>
          <a href="posts/${post.slug}.html" class="inline-flex items-center gap-1 text-teal-500 font-semibold" style="text-decoration: none;">
            Read <i class="fas fa-chevron-right text-xs"></i>
          </a>
        </div>
      </article>`
        )
        .join('')}
    </div>
  </main>

  ${getFooterHtml()}
  <script src="js/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml, 'utf-8');

  // Copy CSS and JS into dist
  fs.copyFileSync(path.join(__dirname, 'src', 'css', 'style.css'), path.join(DIST_DIR, 'css', 'style.css'));
  fs.copyFileSync(path.join(__dirname, 'src', 'js', 'main.js'), path.join(DIST_DIR, 'js', 'main.js'));

  // Also synchronize root index.html for direct local preview
  fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml, 'utf-8');

  console.log(`✅ Build complete! Processed ${posts.length} posts into ${DIST_DIR}`);
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
