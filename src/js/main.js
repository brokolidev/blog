/* ==========================================================================
   brokoli.log - Worklog Client Scripts
   Interactive Year & Date Accordion, Hash Auto-Open, Copy Code, Theme Switcher
   ========================================================================== */

(function () {
  'use strict';

  // --- 1. Theme Management ---
  function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    function setTheme(dark) {
      if (dark) {
        htmlEl.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        htmlEl.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }

    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved === 'dark');
    } else {
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        setTheme(!htmlEl.classList.contains('dark'));
      });
    }
  }

  // --- 2. Worklog Accordion Engine ---
  function initAccordion() {
    const logItems = document.querySelectorAll('.log-item');
    const toggleAllBtn = document.getElementById('toggle-all-btn');

    // Individual item toggle
    logItems.forEach((item) => {
      const summary = item.querySelector('.log-summary');
      if (!summary) return;

      summary.addEventListener('click', (e) => {
        // Prevent toggle if clicking on permalink copy button
        if (e.target.closest('.log-permalink-btn')) return;

        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);

        if (!isOpen) {
          const slug = item.getAttribute('data-slug');
          if (slug) {
            history.replaceState(null, null, `#${slug}`);
          }
        }
      });
    });

    // Toggle All Button
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        const anyClosed = Array.from(logItems).some((i) => !i.classList.contains('is-open'));
        logItems.forEach((i) => i.classList.toggle('is-open', anyClosed));
        toggleAllBtn.textContent = anyClosed ? 'Collapse All' : 'Expand All';
      });
    }

    // Auto-open from URL Hash on load
    function checkHash() {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) {
        // By default, open ONLY the first/latest entry and close the rest
        logItems.forEach((item, idx) => {
          item.classList.toggle('is-open', idx === 0);
        });
        return;
      }

      const target = document.querySelector(`.log-item[data-slug="${hash}"]`);
      if (target) {
        logItems.forEach((item) => item.classList.remove('is-open'));
        target.classList.add('is-open');
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }

    checkHash();
    window.addEventListener('hashchange', checkHash);
  }

  // --- 3. Permalink Copy ---
  function initPermalinks() {
    const permalinkBtns = document.querySelectorAll('.log-permalink-btn');
    permalinkBtns.forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const slug = btn.getAttribute('data-slug');
        const url = `${window.location.origin}${window.location.pathname}#${slug}`;

        try {
          await navigator.clipboard.writeText(url);
          const originalText = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check" style="color: #2dd4bf;"></i> Copied!';
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy permalink', err);
        }
      });
    });
  }

  // --- 4. Code Block Copy Button ---
  function initCodeCopy() {
    const preBlocks = document.querySelectorAll('.prose-content pre');
    preBlocks.forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code) return;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn';
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      copyBtn.setAttribute('aria-label', 'Copy code snippet');
      copyBtn.style.cssText = `
        position: absolute;
        top: 0.5rem;
        right: 0.6rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.72rem;
        color: var(--text-faint);
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid var(--border-subtle);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
      `;

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          copyBtn.innerHTML = '<i class="fas fa-check" style="color: #2dd4bf;"></i>';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy snippet', err);
        }
      });

      pre.appendChild(copyBtn);
    });
  }

  // --- Language Management (Toggle) ---
  function initLanguage() {
    // If inline onclick exists, let it handle directly to avoid double toggle
    document.addEventListener('click', (e) => {
      // 1. Language Toggle Button fallback (only if onclick is missing)
      const toggleBtn = e.target.closest('.lang-toggle-btn, #lang-toggle-btn');
      if (toggleBtn && !toggleBtn.hasAttribute('onclick')) {
        e.preventDefault();
        if (typeof window.toggleAppLanguage === 'function') {
          window.toggleAppLanguage(e);
        }
        return;
      }

      // 2. Explicit direct language button (if any)
      const explicitBtn = e.target.closest('[data-set-lang]');
      if (explicitBtn) {
        e.preventDefault();
        const lang = explicitBtn.getAttribute('data-set-lang');
        if (lang === 'ko' || lang === 'en') {
          document.documentElement.setAttribute('data-lang', lang);
          try { localStorage.setItem('lang', lang); } catch (err) {}
        }
      }
    });
  }

  // DOM Init with immediate execution if readyState is already ready
  function bootstrap() {
    initTheme();
    initLanguage();
    initAccordion();
    initPermalinks();
    initCodeCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
