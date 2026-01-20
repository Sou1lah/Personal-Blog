// --- Todo List Modal Logic ---
    document.addEventListener('DOMContentLoaded', function() {
      const openTodoBtn = document.getElementById('openTodoBtn');
      const todoModal = document.getElementById('todoModal');
      const closeTodoBtn = document.getElementById('closeTodoBtn');
      const todoInput = document.getElementById('todoInput');
      const addTodoBtn = document.getElementById('addTodoBtn');
      const todoList = document.getElementById('todoList');
      const todoInputRow = document.getElementById('todoInputRow');
      if (!openTodoBtn || !todoModal || !closeTodoBtn || !todoInput || !addTodoBtn || !todoList || !todoInputRow) return;

      function getTodos() {
        try {
          return JSON.parse(localStorage.getItem('blogTodos') || '[]');
        } catch { return []; }
      }
      function saveTodos(todos) {
        localStorage.setItem('blogTodos', JSON.stringify(todos));
      }
      function renderTodos() {
        const todos = getTodos();
        todoList.innerHTML = '';
        todos.forEach((todo, idx) => {
          const li = document.createElement('li');
          li.className = 'todo-item' + (todo.done ? ' checked' : '');
          // Checkbox
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'todo-checkbox';
          cb.checked = !!todo.done;
          cb.addEventListener('change', () => {
            todos[idx].done = cb.checked;
            saveTodos(todos);
            renderTodos();
          });
          // Label
          const label = document.createElement('span');
          label.className = 'todo-label';
          label.textContent = todo.text;
          // Delete button
          const delBtn = document.createElement('button');
          delBtn.className = 'todo-delete-btn';
          delBtn.textContent = '✕';
          delBtn.title = 'Delete';
          delBtn.addEventListener('click', () => {
            todos.splice(idx, 1);
            saveTodos(todos);
            renderTodos();
          });
          li.appendChild(cb);
          li.appendChild(label);
          li.appendChild(delBtn);

          // Swipe-to-delete logic
          let startX = null;
          let swiped = false;
          li.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
              startX = e.touches[0].clientX;
              swiped = false;
            }
          });
          li.addEventListener('touchmove', (e) => {
            if (startX !== null && e.touches.length === 1) {
              const dx = e.touches[0].clientX - startX;
              if (dx < -50) { // swipe left
                li.classList.add('swipe-delete');
                swiped = true;
              } else {
                li.classList.remove('swipe-delete');
                swiped = false;
              }
            }
          });
          li.addEventListener('touchend', (e) => {
            if (swiped) {
              todos.splice(idx, 1);
              saveTodos(todos);
              renderTodos();
            }
            startX = null;
            swiped = false;
            li.classList.remove('swipe-delete');
          });
          todoList.appendChild(li);
        });
      }
      let inputVisible = false;
      addTodoBtn.addEventListener('click', () => {
        if (!inputVisible) {
          // Show input, move both right
          todoInput.style.maxWidth = '320px';
          todoInput.style.opacity = '1';
          todoInput.style.pointerEvents = 'auto';
          todoInputRow.style.justifyContent = 'flex-end';
          addTodoBtn.style.marginLeft = '8px';
          inputVisible = true;
          setTimeout(() => { todoInput.focus(); }, 350);
        } else {
          const val = todoInput.value.trim();
          if (!val) return;
          const todos = getTodos();
          todos.push({ text: val, done: false });
          saveTodos(todos);
          todoInput.value = '';
          // Hide input, move both back
          todoInput.style.maxWidth = '0';
          todoInput.style.opacity = '0';
          todoInput.style.pointerEvents = 'none';
          addTodoBtn.style.marginLeft = '0';
          inputVisible = false;
          todoInputRow.style.justifyContent = 'flex-end';
          renderTodos();
        }
      });
      todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTodoBtn.click();
      });
      // Hide input if modal closes
      closeTodoBtn.addEventListener('click', () => {
        todoInput.style.maxWidth = '0';
        todoInput.style.opacity = '0';
        todoInput.style.pointerEvents = 'none';
        addTodoBtn.style.marginLeft = '0';
        inputVisible = false;
        todoInputRow.style.justifyContent = 'flex-end';
      });
      openTodoBtn.addEventListener('click', () => {
        todoModal.style.display = 'flex';
        renderTodos();
        setTimeout(() => { todoInput.focus(); }, 100);
      });
      closeTodoBtn.addEventListener('click', () => {
        todoModal.style.display = 'none';
      });
      // Close modal on outside click
      todoModal.addEventListener('click', (e) => {
        if (e.target === todoModal) todoModal.style.display = 'none';
      });
      // Close modal on Escape key
      document.addEventListener('keydown', (e) => {
        if (todoModal.style.display === 'flex' && e.key === 'Escape') {
          todoModal.style.display = 'none';
        }
      });
    });
    const GITHUB_API = 'https://api.github.com/repos/Sou1lah/Personal-Blog/contents/wiki';
    const GITHUB_RAW = 'https://raw.githubusercontent.com/Sou1lah/Personal-Blog/main/wiki';

    const blogSection = document.getElementById('blogSection');
    const notesSection = document.getElementById('notesSection');
    const notesCardsContainer = document.getElementById('notesCardsContainer');

    let isNotesMode = true;

    // Load notes on page load
    loadNotesContent();

    async function loadNotesContent(forceFetch = false, preferGitHub = false) {
      notesCardsContainer.innerHTML = '<p style="text-align: center; padding: 40px; font-size: 1.1rem; color: rgba(36, 34, 27, 0.7);">Loading notes...</p>';

      try {
        // If Drive is configured, always refresh from Drive so new uploads appear immediately
        if (typeof window !== 'undefined' && window.__DRIVE_FOLDER_ID) forceFetch = true;

        // Always fetch all markdown files dynamically (ignore index.json)
        let categories = {};
        // Prefer GitHub API if preferGitHub is true, otherwise try local server
        if (preferGitHub) {
          try {
            const liveForced = await fetchAllMarkdownFiles(GITHUB_API);
            if (liveForced && Object.keys(liveForced).length) {
              categories = liveForced;
              try { localStorage.setItem('wikiNotesCache', JSON.stringify(categories)); } catch (e) {}
            } else {
              console.warn('Forced GitHub listing returned no files — falling back to local');
            }
          } catch (forcedErr) {
            console.warn('Forced GitHub listing failed:', forcedErr);
          }
        }
        if (!Object.keys(categories).length) {
          // Try local server
          try {
            categories = await fetchAllMarkdownFilesLocal('/wiki/');
            if (Object.keys(categories).length) {
              try { localStorage.setItem('wikiNotesCache', JSON.stringify(categories)); } catch (e) {}
            }
          } catch (localErr) {
            console.warn('Local fetch failed:', localErr);
          }
        }
        if (!Object.keys(categories).length) {
          // As a last resort, try GitHub API again
          try {
            categories = await fetchAllMarkdownFiles(GITHUB_API);
            if (Object.keys(categories).length) {
              try { localStorage.setItem('wikiNotesCache', JSON.stringify(categories)); } catch (e) {}
            }
          } catch (githubErr) {
            console.warn('GitHub API fetch failed:', githubErr);
          }
        }
        const totalFiles = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
        if (totalFiles === 0) {
          notesCardsContainer.innerHTML = `
            <div style="min-height: calc(50vh); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:20px; padding: 20px; width:100%; text-align:center;">
              <p style="font-size: 1.4rem; color: rgba(36, 34, 27, 0.9); margin: 0;">No notes found in wiki/ folder</p>
              <button onclick="location.reload()" style="padding: 10px 20px; background: var(--brown); color: var(--cream); border: 3px solid var(--brown); border-radius: 50px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'IBM Plex Mono', monospace; transition: all 0.2s ease;">Try Again</button>
            </div>
          `;
          return;
        }

        let html = '';
        const noteMappings = []; // { slug, download_url, id, title, category }
        function slugify(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
        // Import parseFrontMatter from post.js
        // (If using modules, use import. For now, copy the function inline for browser compatibility)
        function parseFrontMatter(md) {
          const match = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
          if (!match) return { data: {}, content: md };
          const yaml = match[1];
          const content = md.slice(match[0].length);
          const data = {};
          yaml.split(/\r?\n/).forEach(line => {
            if (!line.trim()) return;
            const idx = line.indexOf(':');
            if (idx === -1) return;
            const key = line.slice(0, idx).trim();
            let value = line.slice(idx + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            data[key] = value;
          });
          return { data, content };
        }

        for (const [category, items] of Object.entries(categories)) {

          if (items.length === 0) continue;

          // Collect card data with date for sorting
          const cardDataArr = await Promise.all(items.map(async (file) => {
            const title = file.name.replace('.md', '').replace(/_/g, ' ');
            let path = category === 'Root' ? `wiki/${file.name}` : `wiki/${category}/${file.name}`;
            if (path.startsWith('wiki/wiki/')) {
              path = path.replace('wiki/wiki/', 'wiki/');
            }
            let rawUrl;
            if (file.download_url) {
              rawUrl = file.download_url;
            } else if (path && path.startsWith('drive/')) {
              const id = path.split('/').slice(-1)[0];
              rawUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${window.__GOOGLE_DRIVE_API_KEY || ''}`;
            } else {
              rawUrl = `${GITHUB_RAW}/${path.split('/').map(encodeURIComponent).join('/')}`;
            }
            if (rawUrl && rawUrl.includes('wiki/wiki/')) {
              rawUrl = rawUrl.replace('wiki/wiki/', 'wiki/');
            }
            console.log('Raw note URL:', rawUrl);

            let slug = '';
            if (rawUrl && rawUrl.includes('drive/v3/files')) {
              const id = (path && path.startsWith('drive/')) ? path.split('/').slice(-1)[0] : (file.name ? file.name.replace(/[^a-z0-9]/gi,'').slice(0,12) : Math.random().toString(36).slice(2,8));
              slug = `${slugify(title)}-${Math.random().toString(36).slice(2,8)}`;
              noteMappings.push({ slug, download_url: rawUrl, id, title, category });
            }

            const cardId = `card-${category.replace(/[^a-zA-Z0-9]/g, '')}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}`;

            // Async fetch for note metadata
            let noteDate = '';
            try {
              const resp = await fetch(rawUrl);
              if (resp.ok) {
                const md = await resp.text();
                const { data } = parseFrontMatter(md);
                noteDate = data.date || data.published || data.created || '';
              }
            } catch (e) {
              console.warn('Failed to fetch or parse frontmatter for', rawUrl, e);
            }
            if (!noteDate && file.date) {
              noteDate = file.date;
            }

            return {
              cardId,
              slug,
              path,
              rawUrl,
              title,
              noteDate,
              category
            };
          }));

          // Sort cards by date (newest first)
          cardDataArr.sort((a, b) => {
            // Parse date strings to Date objects
            const dateA = a.noteDate ? new Date(a.noteDate) : new Date(0);
            const dateB = b.noteDate ? new Date(b.noteDate) : new Date(0);
            return dateB - dateA;
          });

          // Render sorted cards
          for (const cardData of cardDataArr) {
            html += `
              <article class="card" id="${cardData.cardId}" ${cardData.slug ? `data-slug="${cardData.slug}"` : `data-note="${encodeURIComponent(cardData.path)}"`} style="display: flex; flex-direction: column; min-height: 260px; position: relative; padding-bottom: 72px;">
                <div class="note-banner" data-raw-url="${cardData.rawUrl}" style="width: 100%; height: 140px; background-color: #d4c5b9; background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 16px 16px 0 0; position: relative;">
                  ${cardData.noteDate ? `<div class='note-date-top' style="position:absolute;top:8px;right:16px;font-size:0.98rem;font-family:'Playfair Display',Georgia,serif;font-weight:600;opacity:0.85;background:rgba(255,255,255,0.7);padding:2px 10px 2px 10px;border-radius:8px;z-index:2;">${cardData.noteDate}</div>` : ''}
                </div>
                <h3 class="card-title" style="margin-top: 12px;">${cardData.title}</h3>
                <div style="flex: 1;"></div>
                <div class="card-footer" style="position: absolute; left: 16px; right: 12px; bottom: 12px; z-index: 2; pointer-events: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <div class="note-tags-scroll-wrap" style="flex: 1 1 auto; min-width: 0; max-width: calc(100% - 110px); overflow: hidden; position: relative;">
                    <div class="note-tags" style="display: flex; flex-wrap: nowrap; gap: 6px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 2px; -webkit-overflow-scrolling: touch; max-width: 100%; position: relative;"></div>
                    <div class="tags-fade" style="position: absolute; right: 0; top: 0; width: 40px; height: 100%; pointer-events: none; background: linear-gradient(to right, transparent, rgba(245,240,230,0.6) 95%);"></div>
                  </div>
                  <button class="btn lock-btn" ${cardData.slug ? `data-slug="${cardData.slug}"` : `data-note="${encodeURIComponent(cardData.path)}"`} style="flex: 0 0 auto; padding: 6px 14px; border-radius:50px; min-width:64px;" title="Read" aria-label="Read"> <span class="read-label">Read</span> </button>
                </div>
                <style>
                  .note-tags::-webkit-scrollbar {
                    display: none;
                  }
                  .note-tags {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                  }
                  .tags-fade.hidden { display: none !important; }
                </style>
              </article>
            `;
          }
        }

        notesCardsContainer.innerHTML = html;

        // Insert lock button behavior and login handling
        // Register slug -> Drive file mappings in sessionStorage so post pages can fetch without exposing Drive in URLs
        try {
          if (typeof sessionStorage !== 'undefined' && Array.isArray(noteMappings) && noteMappings.length) {
            noteMappings.forEach(m => {
              try { sessionStorage.setItem(`note_map:${m.slug}`, JSON.stringify({ source: 'drive', id: m.id, download_url: m.download_url, title: m.title, category: m.category })); } catch (e) {}
            });
          }
        } catch (e) {}

        const UNLOCK_KEY = 'blog_unlocked';
        const CORRECT_PASSWORD = (typeof window !== 'undefined' && window.__BLOG_PASSWORD) ? window.__BLOG_PASSWORD : 'ishowspeed'; // prefer injected password (via config.js), fallback to local value
        if (!window || !window.__BLOG_PASSWORD) console.debug('Using fallback blog password from source. To inject via CI, create a config.js with window.__BLOG_PASSWORD = "..."');
        // Front-end UX change: remove visible lock by defaulting client to unlocked while preserving server-side/password logic.
        try { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(UNLOCK_KEY, 'true'); } catch (e) {}
        const loginBtnEl = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const loginPasswordInput = document.getElementById('loginPasswordInput');
        const cancelLoginBtn = document.getElementById('cancelLoginBtn');
        const submitLoginBtn = document.getElementById('submitLoginBtn');

        function isUnlocked() { return sessionStorage.getItem(UNLOCK_KEY) === 'true'; }
        function setUnlocked(v) { sessionStorage.setItem(UNLOCK_KEY, v ? 'true' : 'false'); updateLoginUI(); }
        function updateLoginUI() {
          const lockBtns = notesCardsContainer.querySelectorAll('.lock-btn');
          lockBtns.forEach(btn => {
            if (isUnlocked()) {
              // visual 'unlocked' state and show 'Read' label
              btn.classList.add('unlocked');
              btn.classList.add('read');
              btn.setAttribute('aria-label', 'Read');
              btn.innerHTML = '<span class="read-label">Read</span>';
            } else {
              // locked state: revert to padlock icon
              btn.classList.remove('unlocked');
              btn.classList.remove('read');
              btn.setAttribute('aria-label', 'Locked');
              btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>';
            }
          });
          if (loginBtnEl) {
            const span = loginBtnEl.querySelector('span');
            if (span) span.textContent = isUnlocked() ? 'Logged' : 'Login';
            if (isUnlocked()) loginBtnEl.classList.add('logged'); else loginBtnEl.classList.remove('logged');
          }
        }

        function openLoginModal(onSuccess) {
          if (!loginModal) {
            const pass = prompt('Enter password to unlock:');
            if (pass === CORRECT_PASSWORD) { setUnlocked(true); if (onSuccess) onSuccess(); }
            return;
          }
          loginModal.style.display = 'flex';
          loginPasswordInput.value = '';
          loginPasswordInput.focus();
          // Attach one-time handler for submit
          const doSubmit = () => {
            const val = loginPasswordInput.value || '';
            if (val === CORRECT_PASSWORD) {
              setUnlocked(true);
              loginModal.style.display = 'none';
              // remove overlay & key handlers
              loginModal.removeEventListener('click', overlayClose);
              window.removeEventListener('keydown', escHandler);
              if (onSuccess) onSuccess();
            } else {
              alert('Incorrect password');
            }
          };
          const overlayClose = (e) => { if (e.target === loginModal) { loginModal.style.display = 'none'; loginModal.removeEventListener('click', overlayClose); window.removeEventListener('keydown', escHandler); } };
          const escHandler = (e) => { if (e.key === 'Escape') { loginModal.style.display = 'none'; loginModal.removeEventListener('click', overlayClose); window.removeEventListener('keydown', escHandler); } };
          submitLoginBtn.onclick = doSubmit;
          cancelLoginBtn.onclick = () => { loginModal.style.display = 'none'; loginModal.removeEventListener('click', overlayClose); window.removeEventListener('keydown', escHandler); };
          loginPasswordInput.onkeydown = (e) => { if (e.key === 'Enter') doSubmit(); };
          loginModal.addEventListener('click', overlayClose);
          window.addEventListener('keydown', escHandler);
        }

        if (loginBtnEl) {
          // Toggle login / logout
          loginBtnEl.addEventListener('click', (e) => {
            if (isUnlocked()) { setUnlocked(false); alert('Logged out'); } else { openLoginModal(); }
          });
        }

        updateLoginUI();



        // Simple runtime sanity check: detect if core stylesheet failed to load and warn in console visibly
        document.addEventListener('DOMContentLoaded', () => {
          const link = document.querySelector('link[href="css/styles.css"]');
          function showStyleBanner(msg) {
            try {
              const b = document.createElement('div');
              b.textContent = msg;
              Object.assign(b.style, { position: 'fixed', top: '0', left: '0', right: '0', background: '#ffa', color: '#000', padding: '8px 12px', borderBottom: '2px solid #c00', zIndex: 99999, textAlign: 'center', fontWeight: '700' });
              document.body.appendChild(b);
            } catch (e) { /* ignore */ }
          }
          if (!link) {
            console.error('Missing stylesheet link: css/styles.css');
            showStyleBanner('Warning: stylesheet css/styles.css not found — check your file path');
            return;
          }
          setTimeout(() => {
            try {
              const rules = link.sheet && link.sheet.cssRules;
              if (!rules || rules.length === 0) {
                console.warn('styles.css appears empty or failed to load', link.href);
                showStyleBanner('Warning: styles may not be applied — check browser console/network for css/styles.css');
              }
            } catch (e) {
              console.warn('Cannot access stylesheet rules (cross-origin or not loaded):', e);
              showStyleBanner('Warning: styles may not be applied — check browser console/network');
            }
          }, 300);
        });

        // Attach behavior to card lock buttons
        function attachLockHandlers() {
          const lockBtns = notesCardsContainer.querySelectorAll('.lock-btn');
          lockBtns.forEach(btn => {
            const noteSlug = btn.getAttribute('data-slug');
            const notePath = btn.getAttribute('data-note');
            btn.addEventListener('click', (e) => {
              const targetUrl = noteSlug ? `post.html?slug=${encodeURIComponent(noteSlug)}` : `post.html?note=${notePath}`;
              // If unlocked, navigate to post
              if (isUnlocked()) {
                window.location = targetUrl;
              } else {
                openLoginModal(() => { window.location = targetUrl; });
              }
            });
          });

          // Also make entire card clickable (supports keyboard users and removes need for a separate lock button)
          const cards = notesCardsContainer.querySelectorAll('.card[data-slug], .card[data-note]');
          cards.forEach(card => {
            const noteSlug = card.getAttribute('data-slug');
            const notePath = card.getAttribute('data-note');
            card.addEventListener('click', (e) => {
              // Avoid clicks on tag scroll area or other interactive controls
              if (e.target.closest('.note-tags') || e.target.closest('.btn')) return;
              const targetUrl = noteSlug ? `post.html?slug=${encodeURIComponent(noteSlug)}` : `post.html?note=${notePath}`;
              if (isUnlocked()) {
                window.location = targetUrl;
              } else {
                openLoginModal(() => { window.location = targetUrl; });
              }
            });
          });
        }

        attachLockHandlers();

        // Refresh notes from GitHub button (forces GitHub-first refresh)
        const refreshBtn = document.getElementById('refreshNotesBtn');
        if (refreshBtn) {
          refreshBtn.addEventListener('click', () => {
            refreshBtn.disabled = true;
            const origText = refreshBtn.textContent;
            refreshBtn.textContent = 'Refreshing...';
            loadNotesContent(true, true).finally(() => {
              refreshBtn.disabled = false;
              refreshBtn.textContent = origText || 'Refresh (GitHub)';
            });
          });
        }

        // Position vertical gutters to align with centered .container (used on desktop)
        function positionVerticalGutters() {
          try {
            const left = document.querySelector('.vertical-line.left');
            const right = document.querySelector('.vertical-line.right');
            const container = document.querySelector('.container');
            if (!left || !right || !container) return;
            const rect = container.getBoundingClientRect();
            // Hide gutters on narrow viewports to avoid clutter
            if (rect.width < 520 || window.innerWidth < 700) { left.style.display = 'none'; right.style.display = 'none'; return; }
            left.style.display = 'block'; right.style.display = 'block';
            left.style.left = `${Math.max(0, Math.round(rect.left))}px`;
            const rightOffset = Math.max(0, Math.round(window.innerWidth - rect.right));
            right.style.right = `${rightOffset}px`;
            left.style.removeProperty('right'); right.style.removeProperty('left');
          } catch (e) { /* ignore */ }
        }
        // Make gutters follow layout changes
        positionVerticalGutters();
        window.addEventListener('resize', positionVerticalGutters);
        window.addEventListener('scroll', positionVerticalGutters);

        const bannerElements = notesCardsContainer.querySelectorAll('.note-banner');

        // For card thumbnails we only need to set banners; skip content previews
        for (let i = 0; i < bannerElements.length; i++) {
          const bannerElement = bannerElements[i];
          const rawUrl = bannerElement.getAttribute('data-raw-url');
          try {
            let r = await fetch(rawUrl);
            if (r.ok) {
              const ct = (r.headers.get('content-type') || '').toLowerCase();
              if (ct.includes('text/html') || ct.includes('application/json')) {
                console.warn('Raw host returned', ct, 'for', rawUrl, '— attempting GitHub API raw endpoint fallback');
                // Fallback to GitHub API raw endpoint (handles cases where raw host returns HTML or is blocked)
                try {
                  const relPath = rawUrl.replace(`${GITHUB_RAW}/`, '').replace(/^\/+/, '');
                  const apiUrlForFile = `https://api.github.com/repos/Sou1lah/Personal-Blog/contents/${relPath}`;
                  const ghHeaders = { 'Accept': 'application/vnd.github.v3.raw' };
                  if (typeof window !== 'undefined' && window.__GITHUB_TOKEN) ghHeaders['Authorization'] = `token ${window.__GITHUB_TOKEN}`;
                  const arf = await fetch(apiUrlForFile, { headers: ghHeaders });
                  if (arf.ok) {
                    console.info('GitHub API raw endpoint succeeded for', rawUrl);
                    r = arf;
                  } else {
                    console.warn('GitHub API raw endpoint returned', arf.status, 'for', rawUrl);
                  }
                } catch (e) { console.warn('GitHub API raw fallback failed for', rawUrl, e); }

                // If the raw host returned HTML (e.g., server rendered the markdown) or the download_url was a local path,
                // try the direct GitHub raw CDN URL as a fallback so we can parse frontmatter reliably.
                try {
                  // Compute a relative path suitable for raw.githubusercontent (handles variant inputs like '/wiki/..', 'wiki/...', or full origin URLs)
                  let rel = rawUrl.replace(/^https?:\/\/[^\/]+\//i, '').replace(/^\/?wiki\//i, '');
                  rel = rel.replace(/^\/+/, '');
                  if (rel) {
                    const encodedRel = rel.split('/').map(encodeURIComponent).join('/');
                    const rawCdn = `${GITHUB_RAW}/${encodedRel}`;
                    const rawResp = await fetch(rawCdn);
                    if (rawResp.ok) {
                      console.info('GitHub raw CDN fallback succeeded for', rawCdn);
                      r = rawResp;
                    } else {
                      console.warn('GitHub raw CDN fallback returned', rawResp.status, 'for', rawCdn);
                    }
                  }
                } catch (e) { console.warn('GitHub raw CDN fallback failed for', rawUrl, e); }
              }
            }
            if (!r.ok) throw new Error('Failed to fetch markdown: ' + rawUrl);
            const md = await r.text();
            const fm = md.match(/^---\n([\s\S]*?)\n---\n/);
            let bannerUrl = null;
            let tags = [];
            if (fm) {
              const bannerMatch = fm[1].match(/banner\s*:\s*(.+)/);
              if (bannerMatch) {
                // Raw value from frontmatter; may be a bare URL, a markdown image, a relative path, or a data URI
                let rawBanner = bannerMatch[1].trim().replace(/^['\"]|['\"]$/g, '');
                // Extract src if user used markdown image syntax: ![alt](src)
                const mdImg = rawBanner.match(/!\[[^\]]*\]\(([^)]+)\)/);
                if (mdImg) rawBanner = mdImg[1].trim();
                if (!rawBanner) rawBanner = null;
                bannerUrl = rawBanner;
              }
              // Parse YAML array tags
              const tagsMatch = fm[1].match(/tags\s*:\s*\n([\s\S]*?)(\n\w|\ncssclasses:|$)/);
              if (tagsMatch) {
                tags = tagsMatch[1].split('\n').map(t => t.replace(/^-\s*/, '').trim()).filter(Boolean);
              }
              // Parse inline tags (e.g. tags: #tag1 #tag2 or tags: tag1, tag2)
              const tagsInline = fm[1].match(/tags\s*:?\s*([^\n]+)/);
              if (tagsInline) {
                // Extract hashtags and/or comma/space separated tags
                const inline = tagsInline[1];
                // Find all #hashtags
                const hashTags = Array.from(inline.matchAll(/#(\w[\w-]*)/g)).map(m => m[1]);
                // Find comma-separated tags
                const commaTags = inline.split(',').map(t => t.trim()).filter(t => t && !t.startsWith('#'));
                // Find space-separated tags (if not comma-separated)
                let spaceTags = [];
                if (!inline.includes(',')) {
                  spaceTags = inline.split(/\s+/).map(t => t.replace(/^#/, '').trim()).filter(t => t && t !== '');
                }
                tags = tags.concat(hashTags, commaTags, spaceTags);
              }
              // Deduplicate tags
              tags = Array.from(new Set(tags.map(t => t.replace(/^#/, '').trim()).filter(Boolean)));

              // Parse optional color field from frontmatter (supports theme names or hex colors)
              let noteColor = null; // raw value
              const colorMatch = fm[1].match(/color\s*:\s*(.+)/i);
              if (colorMatch) {
                noteColor = colorMatch[1].trim().replace(/^['\"]|['\"]$/g, '').toLowerCase();
                if (noteColor === 'default') noteColor = 'brown';
              }
            }

            // Helper to resolve banner URLs to usable raw URLs (handles absolute, /paths, wiki/*, relative, data URIs)
            function resolveBanner(bannerVal, noteRawUrl) {
              if (!bannerVal) return null;
              let src = bannerVal.trim();
              if (/^data:/i.test(src)) return src;
              if (/^https?:\/\//i.test(src)) return src;
              if (src.startsWith('/')) return `${GITHUB_RAW}/${src.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/')}`;
              if (src.startsWith('wiki/')) return `${GITHUB_RAW}/${src.replace(/^wiki\/+/, '').split('/').map(encodeURIComponent).join('/')}`;
              let base = noteRawUrl || '';
              if (base && base.startsWith('/wiki/')) base = `${GITHUB_RAW}/${base.replace(/^\/wiki\//, '')}`;
              if (!/^https?:\/\//i.test(base)) base = `${GITHUB_RAW}/${base.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/')}`;
              base = base.split('/').slice(0, -1).join('/') + '/';
              try { return new URL(src, base).toString(); } catch (e) { return base + src.split('/').map(encodeURIComponent).join('/'); }
            }

            if (bannerUrl) {
              const resolvedBanner = resolveBanner(bannerUrl, rawUrl);
              console.info('Resolved banner for', rawUrl, '→', resolvedBanner);
              if (resolvedBanner) {
                // Use an <img> element inside the banner so it displays reliably on the homepage
                try {
                  // Save the date element if present
                  let dateDiv = bannerElement.querySelector('.note-date-top');
                  if (!dateDiv) {
                    // Try to get the date from the card's dataset (fallback)
                    const card = bannerElement.closest('.card');
                    let noteDate = '';
                    if (card) {
                      // Try to find the date in the card's HTML (fragile fallback)
                      const dateMatch = card.innerHTML.match(/<div class='note-date-top'[^>]*>(.*?)<\/div>/);
                      if (dateMatch) noteDate = dateMatch[1];
                    }
                    if (noteDate) {
                      dateDiv = document.createElement('div');
                      dateDiv.className = 'note-date-top';
                      dateDiv.style.position = 'absolute';
                      dateDiv.style.top = '8px';
                      dateDiv.style.right = '16px';
                      dateDiv.style.fontSize = '0.98rem';
                      dateDiv.style.fontFamily = "'Playfair Display',Georgia,serif";
                      dateDiv.style.fontWeight = '600';
                      dateDiv.style.opacity = '0.85';
                      dateDiv.style.background = 'rgba(255,255,255,0.7)';
                      dateDiv.style.padding = '2px 10px 2px 10px';
                      dateDiv.style.borderRadius = '8px';
                      dateDiv.style.zIndex = '2';
                      dateDiv.textContent = noteDate;
                    }
                  }
                  bannerElement.innerHTML = '';
                  const bimg = document.createElement('img');
                  bimg.src = resolvedBanner;
                  bimg.alt = '';
                  bimg.style.width = '100%';
                  bimg.style.height = '100%';
                  bimg.style.objectFit = 'cover';
                  bimg.style.display = 'block';
                  bimg.addEventListener('load', () => {
                    bannerElement.style.backgroundColor = 'transparent';
                    bannerElement.classList.add('banner-loaded');
                  });
                  bimg.addEventListener('error', async () => {
                    console.warn('Banner image failed to load for', resolvedBanner);
                    try {
                      // Try public image proxy (removes protocol for images.weserv.nl)
                      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(resolvedBanner.replace(/^https?:\/\//i,''))}`;
                      console.info('Attempting proxy fallback for banner:', proxyUrl);
                      bimg.onerror = null; // avoid loops
                      bimg.src = proxyUrl;
                    } catch (e) {
                      console.warn('Proxy fallback failed for banner', resolvedBanner, e);
                      // show placeholder background so layout remains intact
                      bannerElement.style.backgroundImage = 'url("https://raw.githubusercontent.com/Sou1lah/Personal-Blog/main/assets/ImagePlaceholder.jpg")';
                    }
                  });
                  bannerElement.appendChild(bimg);
                  if (dateDiv) bannerElement.appendChild(dateDiv);
                } catch (e) {
                  console.warn('Failed to append banner image element for', resolvedBanner, e);
                }
              }
            } else {
              // Try to fetch banner again with fallback rawUrl
              let fallbackRawUrl = rawUrl.replace('wiki/wiki/', 'wiki/');
              if (fallbackRawUrl !== rawUrl) {
                try {
                  const fallbackR = await fetch(fallbackRawUrl);
                  if (fallbackR.ok) {
                    const fallbackMd = await fallbackR.text();
                    const fallbackFm = fallbackMd.match(/^---\n([\s\S]*?)\n---\n/);
                    if (fallbackFm) {
                      const fallbackBannerMatch = fallbackFm[1].match(/banner\s*:\s*(.+)/);
                      if (fallbackBannerMatch) {
                        let rawBanner = fallbackBannerMatch[1].trim().replace(/^['\"]|['\"]$/g, '');
                        const mdImg = rawBanner.match(/!\[[^\]]*\]\(([^)]+)\)/);
                        if (mdImg) rawBanner = mdImg[1].trim();
                        const resolvedFallback = resolveBanner(rawBanner, fallbackRawUrl);
                        if (resolvedFallback) {
                          // Insert an <img> so banner displays reliably
                          try {
                            bannerElement.innerHTML = '';
                            const fb = document.createElement('img');
                            fb.src = resolvedFallback;
                            fb.alt = '';
                            fb.style.width = '100%';
                            fb.style.height = '100%';
                            fb.style.objectFit = 'cover';
                            fb.style.display = 'block';
                            fb.addEventListener('load', () => { bannerElement.style.backgroundColor = 'transparent'; bannerElement.classList.add('banner-loaded'); });
                            fb.addEventListener('error', (e) => {
                              console.warn('Fallback banner image failed to load for', resolvedFallback, e);
                              try {
                                const proxy = `https://images.weserv.nl/?url=${encodeURIComponent(resolvedFallback.replace(/^https?:\/\//i,''))}`;
                                console.info('Attempting proxy fallback for fallback banner:', proxy);
                                fb.onerror = null;
                                fb.src = proxy;
                              } catch (err) {
                                console.warn('Proxy fallback failed for fallback banner', resolvedFallback, err);
                                bannerElement.style.backgroundImage = 'url("https://raw.githubusercontent.com/Sou1lah/Personal-Blog/main/assets/ImagePlaceholder.jpg")';
                              }
                            });
                            bannerElement.appendChild(fb);
                            continue;
                          } catch (e) { console.warn('Failed to append fallback banner image for', resolvedFallback, e); }
                        }
                      }
                    }
                  }
                } catch (fallbackErr) {
                  console.error('Fallback fetch failed:', fallbackErr);
                }
              }
              bannerElement.style.backgroundImage = `url("https://raw.githubusercontent.com/Sou1lah/Personal-Blog/main/assets/ImagePlaceholder.jpg")`;
              bannerElement.style.backgroundColor = '#e8e8e8';
              bannerElement.style.backgroundSize = 'cover';
              bannerElement.style.backgroundPosition = 'center';
              bannerElement.style.backgroundRepeat = 'no-repeat';
            }
            // Render tags as badges
            const card = bannerElement.closest('.card');

            // If the note frontmatter included a color, compute & apply a usable accent and subtle bg tint
            if (card && typeof noteColor !== 'undefined' && noteColor) {
              const themeNames = ['brown','blue','red','green','sky','purple','pink','orange','yellow','teal'];
              if (themeNames.includes(noteColor)) {
                // Temporarily set theme to card so CSS variables resolve, then read --accent
                card.setAttribute('data-theme', noteColor);
                const computedAccent = getComputedStyle(card).getPropertyValue('--accent').trim() || null;
                if (computedAccent) {
                  card.style.setProperty('--note-accent', computedAccent);
                  card.style.setProperty('--note-bg', hexToRgba(computedAccent, 0.04));
                  card.style.borderColor = computedAccent;
                  // Force-apply inline colors as fallback so visuals always update
                  try {
                    // stronger visual fallbacks
                    card.style.backgroundColor = hexToRgba(computedAccent, 0.08);
                    card.style.borderWidth = '4px';
                    const titleEl = card.querySelector('.card-title');
                    if (titleEl) { titleEl.style.color = computedAccent; titleEl.style.fontWeight = '900'; titleEl.style.fontSize = '1.05rem'; }
                    const btnEl = card.querySelector('.btn');
                    if (btnEl) { btnEl.style.background = computedAccent; btnEl.style.borderColor = computedAccent; btnEl.style.color = getComputedStyle(document.body).getPropertyValue('--cream') || '#fff'; }
                    const fadeDiv = card.querySelector('.tags-fade');
                    if (fadeDiv) fadeDiv.style.background = `linear-gradient(to right, transparent, ${computedAccent} 90%)`;
                  } catch (e) {}
                  console.log('Applied card theme:', noteColor, 'accent:', computedAccent);
                  console.log('Computed on card: --note-accent=', getComputedStyle(card).getPropertyValue('--note-accent'), '--note-bg=', getComputedStyle(card).getPropertyValue('--note-bg'), 'border-color=', getComputedStyle(card).getPropertyValue('border-color'));
                } else {
                  console.log('Theme applied but computed accent not found for theme:', noteColor);
                }
              } else if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(noteColor)) {
                const accentHex = noteColor;
                card.style.setProperty('--note-accent', accentHex);
                card.style.setProperty('--note-bg', hexToRgba(accentHex, 0.08));
                card.style.borderColor = accentHex;
                // Force-apply stronger inline fallback colors
                try {
                  card.style.backgroundColor = hexToRgba(accentHex, 0.12);
                  card.style.borderWidth = '4px';
                  const titleEl = card.querySelector('.card-title');
                  if (titleEl) { titleEl.style.color = accentHex; titleEl.style.fontWeight = '900'; titleEl.style.fontSize = '1.05rem'; }
                  const btnEl = card.querySelector('.btn');
                  if (btnEl) { btnEl.style.background = accentHex; btnEl.style.borderColor = accentHex; btnEl.style.color = getComputedStyle(document.body).getPropertyValue('--cream') || '#fff'; }
                  const fadeDiv = card.querySelector('.tags-fade');
                  if (fadeDiv) fadeDiv.style.background = `linear-gradient(to right, transparent, ${accentHex} 90%)`;
                } catch (e) {}
                try {
                  bannerElement.style.position = bannerElement.style.position || 'relative';
                  let tint = bannerElement.querySelector('.banner-tint');
                  if (!tint) {
                    tint = document.createElement('div');
                    tint.className = 'banner-tint';
                    Object.assign(tint.style, {position:'absolute', inset:'0', borderRadius:'inherit', pointerEvents:'none'});
                    bannerElement.appendChild(tint);
                  }
                  tint.style.background = accentHex;
                  tint.style.opacity = '0.08';
                } catch (e) {}
              }
            }

            if (card && tags.length) {
              const tagsDiv = card.querySelector('.note-tags');
              const fadeDiv = card.querySelector('.tags-fade');
              // Social media icon map
              const socialIcons = {
                'youtube': {
                  svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style="vertical-align:middle;"><rect width="24" height="24" rx="5" fill="#FF0000"/><path d="M10 15.5V8.5L16 12L10 15.5Z" fill="#fff"/></svg>',
                  bg: '#FF0000', color: '#fff'
                },
                'twitter': {
                  color: '#24292f', // X.com black
                  bg: 'rgba(0,0,0,0.10)',   // black low opacity
                  svg: `<svg width="16" height="16" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><path d="M1199.61 0H944.93L599.8 439.66L254.67 0H0L462.13 613.09L0 1227H254.67L599.8 787.34L944.93 1227H1199.6L737.47 613.91L1199.61 0ZM320.13 111.36L599.8 471.13L879.47 111.36H1040.53L599.8 693.13L159.07 111.36H320.13ZM320.13 1115.64H159.07L599.8 533.87L1040.53 1115.64H879.47L599.8 755.87L320.13 1115.64Z" fill="#24292f"/></svg>`
                },
                x: {
                  color: '#24292f',
                  bg: 'rgba(0,0,0,0.10)',
                  svg: `<svg width=\"16\" height=\"16\" viewBox=\"0 0 1200 1227\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" style=\"vertical-align:middle;\"><path d=\"M1199.61 0H944.93L599.8 439.66L254.67 0H0L462.13 613.09L0 1227H254.67L599.8 787.34L944.93 1227H1199.6L737.47 613.91L1199.61 0ZM320.13 111.36L599.8 471.13L879.47 111.36H1040.53L599.8 693.13L159.07 111.36H320.13ZM320.13 1115.64H159.07L599.8 533.87L1040.53 1115.64H879.47L599.8 755.87L320.13 1115.64Z" fill="#24292f" /></svg>`
                },
                // Add more social icons here as needed
              };
              function hexToRgba(hex, alpha) {
                const h = hex.replace('#','');
                const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
                const intVal = parseInt(full, 16);
                const r = (intVal >> 16) & 255;
                const g = (intVal >> 8) & 255;
                const b = intVal & 255;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              }

              // If a note includes a tag named "No_upchar" (case-insensitive, '#' optional),
              // treat it as a flag: do NOT display the flag tag, and lowercase the first
              // character of all other displayed tags.
              const hasNoUpChar = tags.some(t => t.replace(/^#/, '').toLowerCase() === 'no_upchar');
              const displayTags = tags.filter(t => t.replace(/^#/, '').toLowerCase() !== 'no_upchar');

              function isArabicTag(text) {
                return /[\u0600-\u06FF]/.test(text);
              }
              function renderTag(tag, noUpChar) {
                // strip leading # for display and matching
                const tagStripped = tag.replace(/^#/, '');
                const lower = tagStripped.toLowerCase();
                // prepare display text (lowercase first letter if flag is present)
                const displayText = noUpChar && tagStripped.length ? (tagStripped.charAt(0).toLowerCase() + tagStripped.slice(1)) : tagStripped;
                const arabic = isArabicTag(displayText);
                const font = arabic ? "font-family:'Tajawal','Amiri','Noto Sans Arabic','Cairo',sans-serif;direction:rtl;text-align:right;" : "";
                if (socialIcons[lower]) {
                  const icon = socialIcons[lower];
                  // Use a slightly transparent background for social badges (only affects social tags)
                  const bg = hexToRgba(icon.bg, 0.12);
                  // Keep SVG icon colors intact so only the badge background is translucent
                  const svg = icon.svg;
                  return `<span style="display:inline-block;background:${bg};color:${icon.color};font-size:0.85em;padding:2px 10px 2px 8px;border-radius:50px;box-shadow:0 1px 4px #0001;white-space:nowrap;vertical-align:middle;gap:4px;${font}">${svg}<span style='margin-left:6px;vertical-align:middle;'>${displayText}</span></span>`;
                }
                return `<span style="display:inline-block;background:#f5f5f5;color:#444;font-size:0.85em;padding:2px 10px 2px 10px;border-radius:50px;box-shadow:0 1px 4px #0001;white-space:nowrap;${font}">${displayText}</span>`;
              }

              if (tagsDiv) {
                tagsDiv.innerHTML = displayTags.map(t => renderTag(t, hasNoUpChar)).join(' ');
                // If the No_upchar flag is present, lowercase the first letter of the card title as well
                if (hasNoUpChar) {
                  const titleEl = card.querySelector('.card-title');
                  if (titleEl && titleEl.textContent && titleEl.textContent.length) {
                    titleEl.textContent = titleEl.textContent.charAt(0).toLowerCase() + titleEl.textContent.slice(1);
                  }
                }
              }
              // Hide fade at end of scroll
              if (tagsDiv && fadeDiv) {
                const updateFade = () => {
                  if (tagsDiv.scrollWidth - tagsDiv.scrollLeft > tagsDiv.clientWidth + 2) {
                    fadeDiv.classList.remove('hidden');
                  } else {
                    fadeDiv.classList.add('hidden');
                  }
                };
                tagsDiv.addEventListener('scroll', updateFade);
                setTimeout(updateFade, 10);
              }
            }
          } catch (e) {
            console.error('Banner fetch error:', e);
            bannerElement.style.backgroundImage = `url("https://raw.githubusercontent.com/Sou1lah/Personal-Blog/main/assets/ImagePlaceholder.jpg")`;
            bannerElement.style.backgroundColor = '#e8e8e8';
            bannerElement.style.backgroundSize = 'cover';
            bannerElement.style.backgroundPosition = 'center';
            bannerElement.style.backgroundRepeat = 'no-repeat';
          }
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        notesCardsContainer.innerHTML = `
          <div style="min-height: calc(50vh); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:20px; padding: 20px; width:100%; text-align:center;">
            <p style="font-size: 1.4rem; color: red; margin: 0;">Error loading notes</p>
            <button onclick="location.reload()" style="padding: 10px 20px; background: var(--brown); color: var(--cream); border: 3px solid var(--brown); border-radius: 50px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'IBM Plex Mono', monospace; transition: all 0.2s ease;">Try Again</button>
          </div>
        `;
      }
    }
    // Move these helper functions to top-level scope so they are always defined
    async function fetchAllMarkdownFiles(apiUrl, category = null) {
      const result = {};
      const ghHeaders = { 'Accept': 'application/vnd.github.v3+json' };
      if (typeof window !== 'undefined' && window.__GITHUB_TOKEN) ghHeaders['Authorization'] = `token ${window.__GITHUB_TOKEN}`;
      const response = await fetch(apiUrl, { headers: ghHeaders });
      if (!response.ok) return result;
      const items = await response.json();
      for (const item of items) {
        if (item.type === 'dir') {
          const sub = await fetchAllMarkdownFiles(`${apiUrl}/${item.name}`, item.name);
          for (const [cat, files] of Object.entries(sub)) {
            if (!result[cat]) result[cat] = [];
            result[cat] = result[cat].concat(files);
          }
        } else if (item.name.endsWith('.md')) {
          const cat = category || 'Root';
          if (!result[cat]) result[cat] = [];
          result[cat].push(item);
        }
      }
      return result;
    }
    async function fetchAllMarkdownFilesLocal(basePath = '/wiki/', category = null) {
      const result = {};
      const resp = await fetch(basePath);
      if (!resp.ok) return result;
      const html = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const anchors = Array.from(doc.querySelectorAll('a'));
      for (const a of anchors) {
        const href = a.getAttribute('href');
        if (!href || href === '../') continue;
        if (href.endsWith('.md')) {
          let cleaned = decodeURIComponent(href).replace(/^\/?/, '');
          if (cleaned.toLowerCase().startsWith('wiki/')) cleaned = cleaned.replace(/^wiki\//i, '');
          const parts = cleaned.split('/');
          const cat = category || (parts.length > 1 ? parts[0] : 'Root');
          if (!result[cat]) result[cat] = [];
          result[cat].push({ name: parts.slice(-1)[0], path: cleaned, download_url: `/wiki/${cleaned}` });
        } else if (!href.endsWith('.md') && !href.includes('.')) {
          // Likely a subdirectory
          const sub = await fetchAllMarkdownFilesLocal(basePath + href, href.replace(/\/$/, ''));
          for (const [cat, files] of Object.entries(sub)) {
            if (!result[cat]) result[cat] = [];
            result[cat] = result[cat].concat(files);
          }
        }
      }
      return result;
    }
