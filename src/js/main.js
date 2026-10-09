/* ==========================================================================
   brokoli.blog - Client Scripts
   Interactive UI: Theme Switcher, Search & Filter, Code Copy, Progress Bar
   ========================================================================== */

(function () {
  'use strict';

  // --- 1. Theme Management ---
  function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    function applyTheme(isDark) {
      if (isDark) {
        htmlEl.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        htmlEl.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }

    // Determine initial theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      applyTheme(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
    }

    // Toggle button click listener
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isCurrentDark = htmlEl.classList.contains('dark');
        applyTheme(!isCurrentDark);
      });
    }

    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches);
      }
    });
  }

  // --- 2. Live Search & Category Filter ---
  function initFilterAndSearch() {
    const searchInput = document.getElementById('search-input');
    const chipBtns = document.querySelectorAll('.chip-btn');
    const postCards = document.querySelectorAll('.post-card');
    const featuredCard = document.getElementById('featured-card');

    let currentCategory = 'all';
    let searchQuery = '';

    function filterPosts() {
      let visibleCount = 0;

      postCards.forEach((card) => {
        const title = (card.querySelector('.post-card-title')?.textContent || '').toLowerCase();
        const excerpt = (card.querySelector('.post-card-excerpt')?.textContent || '').toLowerCase();
        const tag = (card.getAttribute('data-category') || '').toLowerCase();

        const matchesCategory = currentCategory === 'all' || tag === currentCategory.toLowerCase();
        const matchesSearch = !searchQuery || title.includes(searchQuery) || excerpt.includes(searchQuery) || tag.includes(searchQuery);

        if (matchesCategory && matchesSearch) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Handle empty state message
      let emptyMsg = document.getElementById('empty-search-msg');
      if (visibleCount === 0) {
        if (!emptyMsg) {
          emptyMsg = document.createElement('div');
          emptyMsg.id = 'empty-search-msg';
          emptyMsg.className = 'text-center py-12 text-zinc-500';
          emptyMsg.innerHTML = '<p class="text-lg">No matching posts found 🍃</p><p class="text-sm mt-1">Try another keyword or category filter.</p>';
          const grid = document.querySelector('.posts-grid');
          if (grid) grid.parentNode.insertBefore(emptyMsg, grid.nextSibling);
        }
        emptyMsg.style.display = 'block';
      } else if (emptyMsg) {
        emptyMsg.style.display = 'none';
      }

      // Hide featured card if filtering
      if (featuredCard) {
        if (currentCategory !== 'all' || searchQuery.length > 0) {
          featuredCard.style.display = 'none';
        } else {
          featuredCard.style.display = 'block';
        }
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        filterPosts();
      });
    }

    chipBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        chipBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-filter') || 'all';
        filterPosts();
      });
    });
  }

  // --- 3. Reading Progress Bar (Article View) ---
  function initReadingProgress() {
    const progressBar = document.getElementById('reading-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) return;
      const scrolled = (window.scrollY / docHeight) * 100;
      progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
    }, { passive: true });
  }

  // --- 4. Code Block Copy Button ---
  function initCodeCopy() {
    const preBlocks = document.querySelectorAll('pre');
    preBlocks.forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code) return;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn';
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      copyBtn.setAttribute('aria-label', 'Copy code snippet');
      copyBtn.style.cssText = `
        position: absolute;
        top: 0.65rem;
        right: 0.75rem;
        padding: 0.35rem 0.55rem;
        font-size: 0.75rem;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      `;

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          copyBtn.innerHTML = '<i class="fas fa-check" style="color: #2dd4bf;"></i>';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code snippet', err);
        }
      });

      pre.appendChild(copyBtn);
    });
  }

  // Execute on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFilterAndSearch();
    initReadingProgress();
    initCodeCopy();
  });
})();
