                // Image zoom logic
                const imgZoomOverlay = document.getElementById('imgZoomOverlay');
                function enableImageZoom() {
                  const imgs = document.querySelectorAll('.post-body img');
                  imgs.forEach(img => {
                    img.style.cursor = 'zoom-in';
                    img.addEventListener('click', function(e) {
                      imgZoomOverlay.innerHTML = `<img src="${img.src}" style="max-width:90vw;max-height:90vh;box-shadow:0 4px 32px #0008;border-radius:12px;display:block;margin:auto;" />`;
                      imgZoomOverlay.style.display = 'flex';
                    });
                  });
                }
                imgZoomOverlay.addEventListener('click', function() {
                  imgZoomOverlay.style.display = 'none';
                  imgZoomOverlay.innerHTML = '';
                });
            // Reading progress bar logic
            const progressBar = document.getElementById('progressBar');
            const progressContainer = document.getElementById('progressContainer');
            function updateProgressBar() {
              const postPage = document.querySelector('.post-page');
              if (!postPage || !progressBar || !progressContainer) return;
              const postTop = postPage.getBoundingClientRect().top + window.scrollY;
              const postHeight = Math.max(postPage.scrollHeight || 0, postPage.offsetHeight || 0);
              // Hide progress bar when entire content fits in the viewport
              if (postHeight <= window.innerHeight) {
                progressContainer.style.display = 'none';
                progressBar.style.width = '0%';
                progressBar.setAttribute('aria-valuenow', '0');
                return;
              } else {
                progressContainer.style.display = 'block';
              }
              const start = postTop;
              const end = postTop + postHeight - window.innerHeight;
              let percent = 0;
              if (end > start) {
                percent = ((window.scrollY - start) / (end - start)) * 100;
              } else {
                percent = window.scrollY > start ? 100 : 0;
              }
              percent = Math.min(100, Math.max(0, percent));
              progressBar.style.width = percent + '%';
              progressBar.setAttribute('aria-valuenow', Math.round(percent));
            }
            window.addEventListener('scroll', updateProgressBar);
            window.addEventListener('resize', updateProgressBar);
            document.addEventListener('DOMContentLoaded', updateProgressBar);
            // initialize once
            updateProgressBar();
        // Go to Top button logic
        const goTopBtn = document.getElementById('goTopBtn');
        window.addEventListener('scroll', () => {
          if (!goTopBtn) return;
          if (window.scrollY > 200) {
            goTopBtn.style.display = 'block';
          } else {
            goTopBtn.style.display = 'none';
          }
        });
        if (goTopBtn) {
          goTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }
        // Back button logic (history.back with fallback)
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
          backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try {
              if (document.referrer && document.referrer !== window.location.href) history.back();
              else window.location.href = 'index.html';
            } catch (err) {
              window.location.href = 'index.html';
            }
          });
        }
    const GITHUB_RAW = 'https://raw.githubusercontent.com/Sou1lah/Personal-Blog/main';
    
    // Small front-matter parser and theme helper
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

    const THEMES = {
      sea: "#0ea5e9",
      forest: "#16a34a",
      desert: "#d97706",
      myth: "#7c3aed",
      brown: "#8B4513",
      blue: "#3b82f6",
      red: "#ef4444",
      green: "#22c55e",
      sky: "#06b6d4",
      purple: "#a855f7",
      pink: "#ec4899",
      orange: "#f97316",
      yellow: "#eab308",
      teal: "#14b8a6"
    };

    function isValidCssColor(value) {
      const s = new Option().style;
      s.color = '';
      s.color = value;
      return s.color !== '';
    }

    function cssColorToRgb(color) {
      // Convert any valid CSS color (named, hex, rgb) into an "r, g, b" string
      const el = document.createElement('div');
      el.style.color = color;
      el.style.display = 'none';
      document.body.appendChild(el);
      const cs = getComputedStyle(el).color;
      document.body.removeChild(el);
      const m = cs.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      return m ? `${m[1]}, ${m[2]}, ${m[3]}` : null;
    }

    function applyNoteTheme(colorValue) {
      // Temporarily suppress transitions/animations so theme applies instantly
      document.body.classList.add('no-transitions');
      document.documentElement.classList.add('no-transitions');

      // Helper: lighten/darken by mixing with white or scaling
      function mixWithWhite(rgbArr, t) {
        return rgbArr.map((c) => Math.round(c + (255 - c) * t));
      }
      function darken(rgbArr, t) {
        return rgbArr.map((c) => Math.round(c * (1 - t)));
      }
      function rgbArrToString(arr) { return `${arr[0]}, ${arr[1]}, ${arr[2]}`; }
      function rgbArrToHex(arr) {
        return (
          '#' +
          arr
            .map((c) => c.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase()
        );
      }
      function luminance(rgbArr) {
        const [r, g, b] = rgbArr.map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }

      // If no colorValue, remove any existing note theme without animation
      if (!colorValue) {
        // clear any temporary request for white text
        window.__requestedNoteText = undefined;
        const page = document.querySelector('.post-page');
        document.documentElement.style.removeProperty('--theme-color');
        document.documentElement.style.removeProperty('--theme-rgb');
        document.documentElement.style.removeProperty('--theme-bg');
        document.documentElement.style.removeProperty('--theme-text');
        if (page) {
          page.style.removeProperty('--note-accent');
          page.style.borderLeftColor = '';
          page.style.borderRightColor = '';
          const header = page.querySelector('.post-header');
          if (header) header.style.borderBottomColor = '';
        }
        window.__noteTheme = null;
        document.body.classList.remove('note-theme');

        // Remove suppression on next paint so transitions return
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.body.classList.remove('no-transitions');
            document.documentElement.classList.remove('no-transitions');
          });
        });
        return;
      }

      const resolved = THEMES[colorValue] || (isValidCssColor(colorValue) ? colorValue : null);
      const page = document.querySelector('.post-page');
      if (resolved) {
        // Base RGB for computations
        const baseRgbStr = cssColorToRgb(resolved) || '36, 34, 27';
        const baseRgb = baseRgbStr.split(',').map((s) => parseInt(s.trim(), 10));

        // Create a soft background (lightened) and a stronger accent (slightly darkened)
        const bgRgbArr = mixWithWhite(baseRgb, 0.78); // very light background
        const accentRgbArr = darken(baseRgb, 0.08); // slightly richer accent

        // If the user explicitly requested white text and the base color is pure black,
        // interpret that as an intent for a dark background (honor user preference).
        const wantWhiteTextOnBlack = (window.__requestedNoteText && String(window.__requestedNoteText).trim().toLowerCase() === 'white');
        if (wantWhiteTextOnBlack && baseRgb[0] === 0 && baseRgb[1] === 0 && baseRgb[2] === 0) {
          // use pure black background and slightly lighten accent so borders remain visible
          bgRgbArr[0] = baseRgb[0]; bgRgbArr[1] = baseRgb[1]; bgRgbArr[2] = baseRgb[2];
          accentRgbArr[0] = Math.min(255, baseRgb[0] + 40);
          accentRgbArr[1] = Math.min(255, baseRgb[1] + 40);
          accentRgbArr[2] = Math.min(255, baseRgb[2] + 40);
        }

        const bgRgbStr = rgbArrToString(bgRgbArr);
        const accentRgbStr = rgbArrToString(accentRgbArr);
        const accentHex = rgbArrToHex(accentRgbArr);

        // Set CSS variables used by the stylesheet
        document.documentElement.style.setProperty('--theme-color', accentHex);
        document.documentElement.style.setProperty('--theme-rgb', accentRgbStr);
        document.documentElement.style.setProperty('--theme-bg', `rgb(${bgRgbStr})`);

        // Choose readable text color over the background
        const bgLum = luminance(bgRgbArr);
        const textColor = bgLum > 0.6 ? getComputedStyle(document.documentElement).getPropertyValue('--brown').trim() || '#24221b' : getComputedStyle(document.documentElement).getPropertyValue('--cream').trim() || '#e4dcc9';
        document.documentElement.style.setProperty('--theme-text', textColor);

        // Choose gutter/header contrast based on background luminance: use black on light backgrounds, white on dark backgrounds
        const gutterColor = (bgLum > 0.6) ? '#000' : '#fff';
        document.documentElement.style.setProperty('--gutter-line', gutterColor);
        document.documentElement.style.setProperty('--header-bar-color', gutterColor);

        if (page) {
          page.style.setProperty('--note-accent', accentHex);
          // accent the page borders and header divider for a full-page color theme
          page.style.borderLeftColor = accentHex;
          page.style.borderRightColor = accentHex;
          const header = page.querySelector('.post-header');
          if (header) {
            header.style.borderBottomColor = accentHex;
            header.style.background = `rgba(${accentRgbStr}, 0.06)`;
          }
        }

        // Persist theme info
        window.__noteTheme = { colorValue, resolved, rgb: accentRgbStr };
        document.body.classList.add('note-theme');
      } else {
        // Unknown color -> remove inline styles and fallback to defaults
        document.documentElement.style.removeProperty('--theme-color');
        document.documentElement.style.removeProperty('--theme-rgb');
        document.documentElement.style.removeProperty('--theme-bg');
        document.documentElement.style.removeProperty('--theme-text');
        // Remove contrast-aware vars as well
        document.documentElement.style.removeProperty('--gutter-line');
        document.documentElement.style.removeProperty('--header-bar-color');
        if (page) {
          page.style.removeProperty('--note-accent');
          page.style.borderLeftColor = '';
          page.style.borderRightColor = '';
          const header = page.querySelector('.post-header');
          if (header) header.style.borderBottomColor = '';
        }
        window.__noteTheme = null;
        document.body.classList.remove('note-theme');
      }

      // Remove suppression on next paint so transitions return
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.body.classList.remove('no-transitions');
          document.documentElement.classList.remove('no-transitions');
        });
      });
    }

    // Ensure theme persists during scrolling (re-apply if some other code removes variables)
    window.addEventListener('scroll', () => {
      try {
        if (window.__noteTheme) {
          const { resolved, rgb } = window.__noteTheme;
          const currentRgb = getComputedStyle(document.documentElement).getPropertyValue('--theme-rgb').trim();
          const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim();
          // Re-apply only if missing or changed
          if (!currentRgb || !currentColor || !currentColor.includes(resolved) || !currentRgb.includes(rgb)) {
            document.documentElement.style.setProperty('--theme-color', resolved);
            document.documentElement.style.setProperty('--theme-rgb', rgb);
            const page = document.querySelector('.post-page');
            if (page) {
              page.style.setProperty('--note-accent', resolved);
              page.style.borderLeftColor = resolved;
              page.style.borderRightColor = resolved;
              const header = page.querySelector('.post-header');
              if (header) {
                header.style.borderBottomColor = resolved;
                header.style.background = `rgba(${rgb}, 0.06)`;
              }
            }
          }
        }
      } catch (e) { /* be robust */ }
    });

    // Get post ID or note from URL (declared later before content load)

    // Post data
    const postsData = {};

    // Loading placeholder helpers
    function setLoadingState(loading) {
      const page = document.querySelector('.post-page');
      const header = document.querySelector('.post-header');
      const backBtn = document.querySelector('.back-btn');
      const titleSkeleton = document.getElementById('titleSkeleton');
      const contentSkeleton = document.getElementById('contentSkeleton');
      const titleEl = document.getElementById('postTitle');
      const contentEl = document.getElementById('postContent');
      const dateSkeleton = document.getElementById('dateSkeleton');
      const dateEl = document.getElementById('postDate');
      if (!page || !titleSkeleton || !contentSkeleton || !titleEl || !contentEl || !dateSkeleton || !dateEl) return;
      if (loading) {
        // visually neutralize note accents while loading
        if (header) header.style.borderBottomColor = 'transparent';
        if (backBtn) { backBtn.style.background = 'var(--brown)'; backBtn.style.color = 'var(--cream)'; backBtn.style.borderColor = 'var(--brown)'; }
        page.classList.add('loading');

        titleSkeleton.style.display = 'block';
        contentSkeleton.style.display = 'block';
        dateSkeleton.style.display = 'inline-block';
        titleEl.style.visibility = 'hidden';
        dateEl.style.visibility = 'hidden';
        contentEl.style.display = 'none';
      } else {
        // restore styling (allow theme to re-apply by clearing inline overrides)
        if (header) header.style.borderBottomColor = '';
        if (backBtn) { backBtn.style.background = ''; backBtn.style.color = ''; backBtn.style.borderColor = ''; }
        page.classList.remove('loading');

        titleSkeleton.style.display = 'none';
        contentSkeleton.style.display = 'none';
        dateSkeleton.style.display = 'none';
        titleEl.style.visibility = 'visible';
        dateEl.style.visibility = 'visible';
        contentEl.style.display = 'block';
      }
    }

    // Get post ID or note from URL
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    const notePath = params.get('note');
    const slug = params.get('slug');

    // Show placeholders while we decide / fetch content
    setLoadingState(true);

    // Load blog post or note
    if (slug) {
      // Resolve slug -> mapping in sessionStorage
      let mapping = null;
      try { mapping = JSON.parse(sessionStorage.getItem('note_map:' + slug)); } catch (e) { mapping = null; }
      if (mapping && mapping.source === 'drive') {
        loadNoteContent({ drive: true, download_url: mapping.download_url, id: mapping.id, title: mapping.title });
      } else {
        document.getElementById('postTitle').textContent = "Note Not Found";
        document.getElementById('postContent').textContent = "This note cannot be found (missing mapping).";
        setLoadingState(false);
      }
    } else if (notePath) {
      // Load note from wiki (legacy behavior)
      loadNoteContent(notePath);
    } else if (postId && postsData[postId]) {
      // Load blog post
      const post = postsData[postId];
      document.title = post.title + " - My Blog";
      document.getElementById('postTitle').textContent = post.title;
      document.getElementById('postDate').textContent = post.date;
      document.getElementById('postContent').textContent = post.content;
      setLoadingState(false);
    } else {
      document.getElementById('postTitle').textContent = "Post Not Found";
      document.getElementById('postContent').textContent = "The post you're looking for doesn't exist.";
      setLoadingState(false);
    }

    async function loadNoteContent(pathOrObj) {
      try {
        // Accept either a slug-mapping object {drive:true,download_url,id,...} or a legacy path string
        let path = null;
        let rawUrl = null;
        if (typeof pathOrObj === 'object' && pathOrObj && pathOrObj.drive) {
          // If mapping was provided directly, use its download_url
          rawUrl = pathOrObj.download_url;
        } else {
          path = String(pathOrObj || '');
        }

        // Require unlock before fetching note content
        const UNLOCK_KEY = 'blog_unlocked';
        const CORRECT_PASSWORD = (typeof window !== 'undefined' && window.__BLOG_PASSWORD) ? window.__BLOG_PASSWORD : 'ishowspeed';
        if (!window || !window.__BLOG_PASSWORD) console.debug('Using fallback blog password from source. To inject via CI, create a config.js with window.__BLOG_PASSWORD = "..."');
        try { sessionStorage.setItem(UNLOCK_KEY, 'true'); } catch (e) {}
        if (sessionStorage.getItem(UNLOCK_KEY) !== 'true') {
          // Use modal-based prompt on post page so users always see the popout
          const loginModal = document.getElementById('loginModal');
          const loginPasswordInput = document.getElementById('loginPasswordInput');
          const submitLoginBtn = document.getElementById('submitLoginBtn');
          const cancelLoginBtn = document.getElementById('cancelLoginBtn');

          // Fallback to simple prompt if modal is missing
          if (!loginModal) {
            const pass = prompt('This content is locked. Enter password to unlock:');
            if (pass === CORRECT_PASSWORD) sessionStorage.setItem(UNLOCK_KEY, 'true');
            else { alert('Content locked'); window.location.href = 'index.html'; return; }
          } else {
            // Promise-based modal flow
            await new Promise((resolve, reject) => {
              function cleanup() {
                loginModal.style.display = 'none';
                loginModal.removeEventListener('click', overlayClose);
                window.removeEventListener('keydown', escHandler);
                submitLoginBtn.onclick = null;
                cancelLoginBtn.onclick = null;
                loginPasswordInput.onkeydown = null;
              }
              const doSubmit = () => {
                const val = loginPasswordInput.value || '';
                if (val === CORRECT_PASSWORD) { sessionStorage.setItem(UNLOCK_KEY, 'true'); cleanup(); resolve(); }
                else { alert('Incorrect password'); }
              };
              const overlayClose = (e) => { /* prevent closing by clicking overlay to ensure users see prompt on-entry */ };
              const escHandler = (e) => { if (e.key === 'Escape') { /* ignore Escape during required prompt */ } };

              loginModal.style.display = 'flex';
              loginPasswordInput.value = '';
              loginPasswordInput.focus();

              submitLoginBtn.onclick = doSubmit;
              cancelLoginBtn.onclick = () => { cleanup(); reject(new Error('cancelled')); };
              loginPasswordInput.onkeydown = (e) => { if (e.key === 'Enter') doSubmit(); };
              loginModal.addEventListener('click', overlayClose);
              window.addEventListener('keydown', escHandler);
            }).catch(() => { alert('Content locked'); window.location.href = 'index.html'; return; });
          }
        }
        // show loading placeholders while fetching remote note
        setLoadingState(true);
        const isLocal = window.location.hostname === '127.0.0.1';

        // If rawUrl not already set (i.e., not a mapping object), build it from path
        if (!rawUrl) {
          if (path && path.startsWith('drive/')) {
            const id = path.split('/').slice(-1)[0];
            const key = (typeof window !== 'undefined' && window.__GOOGLE_DRIVE_API_KEY) ? window.__GOOGLE_DRIVE_API_KEY : '';
            rawUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media${key ? '&key=' + encodeURIComponent(key) : ''}`;
          } else {
            const base = isLocal ? '' : GITHUB_RAW;
            rawUrl = `${base}/${path.split('/').map(encodeURIComponent).join('/')}`;
          }
        }

        // Cache-bust note fetch so edits to frontmatter (e.g., `text:` or `color:`) appear immediately
        const sep = rawUrl.includes('?') ? '&' : '?';
        let response = await fetch(`${rawUrl}${sep}t=${Date.now()}`, { cache: 'no-store' });
        // If server returned HTML (MIME mismatch) or JSON (error page), try GitHub API raw endpoint with token if available
        if (response.ok) {
          const ct = (response.headers.get('content-type') || '').toLowerCase();
          if (ct.includes('text/html') || ct.includes('application/json')) {
            console.warn('Raw host returned', ct, 'for', rawUrl, '— attempting GitHub API raw endpoint fallback');
            try {
              const relPath = rawUrl.replace(`${GITHUB_RAW}/`, '').replace(/^\/+/, '');
              const apiUrlForFile = `https://api.github.com/repos/Sou1lah/Personal-Blog/contents/${relPath}`;
              const ghHeaders = { 'Accept': 'application/vnd.github.v3.raw' };
              if (typeof window !== 'undefined' && window.__GITHUB_TOKEN) ghHeaders['Authorization'] = `token ${window.__GITHUB_TOKEN}`;
              const arf = await fetch(apiUrlForFile, { headers: ghHeaders });
              if (arf.ok) {
                console.info('GitHub API raw endpoint succeeded for', rawUrl);
                response = arf;
              } else {
                console.warn('GitHub API raw endpoint returned', arf.status, 'for', rawUrl);
              }
            } catch (e) { console.warn('GitHub API raw fallback failed for', rawUrl, e); }
          }
        }
        if (!response.ok) {
          // Attempt direct API raw fetch as a last resort
          try {
            const relPath = rawUrl.replace(`${GITHUB_RAW}/`, '').replace(/^\/+/, '');
            const apiUrlForFile = `https://api.github.com/repos/Sou1lah/Personal-Blog/contents/${relPath}`;
            const ghHeaders = { 'Accept': 'application/vnd.github.v3.raw' };
            if (typeof window !== 'undefined' && window.__GITHUB_TOKEN) ghHeaders['Authorization'] = `token ${window.__GITHUB_TOKEN}`;
            const arf2 = await fetch(apiUrlForFile, { headers: ghHeaders });
            if (arf2.ok) {
              console.info('GitHub API raw last-resort fetch succeeded for', rawUrl);
              response = arf2;
            } else {
              console.warn('GitHub API raw last-resort fetch returned', arf2.status, 'for', rawUrl);
            }
          } catch (e) { console.warn('GitHub API raw last-resort fetch failed for', rawUrl, e); }
        }

        // Runtime diagnostics: warn if stylesheet missing on post page (helps debugging broken style issues)
        try {
          document.addEventListener('DOMContentLoaded', () => {
            const link = document.querySelector('link[href="css/styles.css"]');
            if (!link) {
              console.error('Missing stylesheet link on post page: css/styles.css');
            }
          });
        } catch (e) { /* ignore */ }
        
        if (!response.ok) {
          throw new Error('Failed to load note');
        }
        
        const markdown = await response.text();
        
        // Use parseFrontMatter to extract frontmatter and content (banner, color, flags)
        let bannerUrl = null;
        let content = markdown;
        let hasNoUpChar = false;
        const parsed = parseFrontMatter(markdown);
        const data = parsed.data || {};
        content = parsed.content || markdown;

        // banner handling (frontmatter key: banner)
        if (data.banner) {
          let rawBanner = data.banner.trim().replace(/^['\"]|['\"]$/g, '');
          const mdImg = rawBanner.match(/!\[[^\]]*\]\(([^)]+)\)/);
          if (mdImg) rawBanner = mdImg[1].trim();
          if (rawBanner) bannerUrl = rawBanner;
        }

        // color handling
        let noteColor = null;
        if (data.color) {
          noteColor = String(data.color).trim().replace(/^['\"]|['\"]$/g, '')
            .toLowerCase();
          if (noteColor === 'default') noteColor = 'brown';
        }

        // No_upchar flag detection (check both keys and values - e.g., tags: "#No_upchar")
        if (
          data.no_upchar ||
          /(?:^|\s)#?no_upchar\b/i.test(Object.keys(data).join('\n')) ||
          /(?:^|\s)#?no_upchar\b/i.test(Object.values(data).join(' '))
        ) {
          hasNoUpChar = true;
        }

        // Helper to resolve banner paths for posts (handles absolute, /paths, wiki/*, relative, data URIs)
        function resolveBannerForNote(bannerVal, notePath) {
          if (!bannerVal) return null;
          let src = bannerVal.trim();
          if (/^data:/i.test(src)) return src;
          if (/^https?:\/\//i.test(src)) return src;
          if (src.startsWith('/')) return `${GITHUB_RAW}/${src.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/')}`;
          if (src.startsWith('wiki/')) return `${GITHUB_RAW}/${src.replace(/^wiki\/+/, '').split('/').map(encodeURIComponent).join('/')}`;
          // Resolve relative to the note's directory
          const base = `${GITHUB_RAW}/${notePath.split('/').slice(0, -1).map(encodeURIComponent).join('/')}/`;
          try { return new URL(src, base).toString(); } catch (e) { return base + src.split('/').map(encodeURIComponent).join('/'); }
        }

        // Set banner image if found
        if (bannerUrl) {
          const banner = document.querySelector('.post-banner');
          const resolved = resolveBannerForNote(bannerUrl, path);
          if (resolved) {
            // Create an img element and fade it in when loaded to avoid sudden flashes
            banner.innerHTML = '';
            const img = document.createElement('img');
            img.src = resolved;
            img.alt = 'Cover image';
            img.style.opacity = '0';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
            img.addEventListener('load', () => {
              // Use class + requestAnimationFrame to ensure paint and smooth transition
              img.classList.add('loaded');
              // show overlay/fade and any header reveal
              banner.classList.add('banner-visible');
              const header = document.querySelector('.post-header');
              if (header) header.classList.remove('hidden');
            });
            banner.appendChild(img);
          }
        }

        // Record requested text color (so theme apply can honor explicit white-on-black requests)
        window.__requestedNoteText = (data.text ? String(data.text).trim() : undefined);
        // Apply note color/theme using helper
        if (typeof noteColor !== 'undefined' && noteColor) {
          applyNoteTheme(noteColor);
        }
        
        // Parse and render markdown
        // Convert wiki image syntax ![[img.jpg]] to standard markdown image syntax so marked generates <img>
        content = content.replace(/\!\[\[([^\]]+)\]\]/g, '![]($1)');

        const html = marked.parse(content);

        // Resolve relative image paths to GitHub raw URLs so images load when viewing notes
        const container = document.createElement('div');
        container.innerHTML = html;

        // If the original markdown included raw HTML (e.g., <div> blocks), marked may escape it in the output.
        // Restore escaped tags so author-provided HTML blocks render correctly.
        if (/<\s*\/?\w+[^>]*>/m.test(content)) {
          container.innerHTML = container.innerHTML.replace(/&lt;([a-zA-Z\/][^&]*)&gt;/g, '<$1>');
        }

        const imgs = container.querySelectorAll('img');
        const baseDirUrl = `${GITHUB_RAW}/${path.split('/').slice(0, -1).map(encodeURIComponent).join('/')}/`;
        imgs.forEach(img => {
          try {
            let src = img.getAttribute('src') || '';
            if (!src) return;
            // If already absolute, skip unless it's a /wiki/ path
            if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) return;
            let resolved = src;
            if (src.startsWith('/wiki/')) {
              const rel = src.replace(/^\/wiki\//, '');
              resolved = `${GITHUB_RAW}/${rel.split('/').map(encodeURIComponent).join('/')}`;
            } else {
              // encode each path segment before resolving to support spaces
              const encodedSrc = src.split('/').map(encodeURIComponent).join('/');
              resolved = new URL(encodedSrc, baseDirUrl).toString();
            }
            console.log('Rewriting image src:', src, '→', resolved);
            img.setAttribute('src', resolved);
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
          } catch (e) {
            console.warn('Failed to rewrite image src for', img, e);
          }
        });

        // Extract title from filename
        const filename = path.split('/').pop().replace('.md', '').replace(/_/g, ' ');

        document.title = filename + " - My Notes";
        const displayTitle = hasNoUpChar && filename.length ? (filename.charAt(0).toLowerCase() + filename.slice(1)) : filename;
        document.getElementById('postTitle').textContent = displayTitle;
        // Prefer frontmatter 'date' then 'publish_date', 'note_modified', 'note_created' for the post date
        let displayDate = null;
        ['date', 'publish_date', 'note_modified', 'note_created'].some(k => {
          if (data[k]) { displayDate = data[k]; return true; }
          return false;
        });
        // Display the raw frontmatter value (no reformatting)
        if (displayDate) {
          document.getElementById('postDate').textContent = String(displayDate);
        } else {
          document.getElementById('postDate').textContent = "Note";
        }

        // Display as formatted markdown HTML
        const postBody = document.getElementById('postContent');
        postBody.innerHTML = container.innerHTML;
        // Ensure the post content uses the same styling as other posts and is visible
        postBody.classList.add('post-body');
        postBody.style.display = 'block';
        postBody.style.visibility = 'visible';
        postBody.style.whiteSpace = 'normal';
        // Use zero padding on phones so content can be full-bleed; keep a comfortable padding on wider screens
        function applyPostBodyPadding() {
          if (!postBody) return;
          const small = window.innerWidth <= 420;
          postBody.style.padding = small ? '0' : '8px 40px 40px 40px';
        }
        applyPostBodyPadding();
        // Keep padding responsive when orientation/size changes
        window.addEventListener('resize', applyPostBodyPadding);
        // show content, hide skeletons
        setLoadingState(false);

        // Position vertical gutters to align with the centered .container edges (helps lines appear adjacent to content)
        function positionVerticalGutters() {
          try {
            const left = document.querySelector('.vertical-line.left');
            const right = document.querySelector('.vertical-line.right');
            const container = document.querySelector('.container');
            if (!left || !right || !container) return;
            const rect = container.getBoundingClientRect();
            // Hide gutters on narrow viewports to avoid clutter
            if (rect.width < 520 || window.innerWidth < 700) {
              left.style.display = 'none'; right.style.display = 'none'; return;
            }
            // Position gutters at container edges (left = container.left, right = container.right - gutter width)
            const gutterWidth = 3;
            left.style.display = 'block';
            right.style.display = 'block';
            left.style.left = `${Math.max(0, Math.round(rect.left))}px`;
            right.style.left = `${Math.max(0, Math.round(rect.right - gutterWidth))}px`;
          } catch (e) { /* be robust */ }
        }
        // Run once and on resize/scroll so gutters follow responsive layout
        positionVerticalGutters();
        window.addEventListener('resize', positionVerticalGutters);
        window.addEventListener('scroll', positionVerticalGutters);
        // Apply note color to content area (if provided)
        try {
          const themeMap = { brown: '#8B4513', blue: '#3b82f6', red: '#ef4444', green: '#22c55e', sky: '#06b6d4', purple: '#a855f7', pink: '#ec4899', orange: '#f97316', yellow: '#eab308', teal: '#14b8a6' };
          let accent = null;
          if (typeof noteColor !== 'undefined' && noteColor) {
            if (themeMap[noteColor]) accent = themeMap[noteColor];
            else if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(noteColor)) accent = noteColor;
          }
          if (accent) {
            postBody.style.setProperty('--note-accent', accent);
            const page = document.querySelector('.post-page');
            if (page) {
              page.style.borderLeftColor = accent;
              page.style.borderRightColor = accent;
              const header = page.querySelector('.post-header');
              if (header) header.style.borderBottomColor = accent;
            }
          }
          // Text color handling: use frontmatter `text` field if present, otherwise default to black
          const textExplicit = Object.prototype.hasOwnProperty.call(data, 'text');
          let textColor = (data.text || 'black').trim();
          if (!isValidCssColor(textColor)) {
            if (THEMES[textColor]) textColor = THEMES[textColor];
            else textColor = 'black';
          }
          // Normalize and smartly respect user `text` preference relative to the page background
          try {
            if (String(textColor).trim().toLowerCase() === 'black') textColor = '#000000';
            if (String(textColor).trim().toLowerCase() === 'white') textColor = '#FFFFFF';
            const rgbStr = cssColorToRgb(textColor);
            if (rgbStr) {
              // compute luminance helper
              const parts = rgbStr.split(',').map(n => parseInt(n.trim(),10));
              const toLin = (v) => { v = v/255; return (v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4)); };
              const textLum = 0.2126*toLin(parts[0]) + 0.7152*toLin(parts[1]) + 0.0722*toLin(parts[2]);

              // Determine background luminance (prefer note/theme background if set)
              let bgColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-bg') || getComputedStyle(document.body).backgroundColor;
              bgColor = bgColor.trim() || 'rgb(228, 220, 201)';
              const bgRgbStr = cssColorToRgb(bgColor) || '228, 220, 201';
              const bgParts = bgRgbStr.split(',').map(n => parseInt(n.trim(),10));
              const bgLum = 0.2126*toLin(bgParts[0]) + 0.7152*toLin(bgParts[1]) + 0.0722*toLin(bgParts[2]);

              if (!textExplicit) {
                // If both text and background are very light, force black text for readability
                if (textLum > 0.86 && bgLum > 0.6) {
                  textColor = '#000000';
                }
                // If both are very dark and user requested dark text, prefer white so text remains readable on dark background
                else if (textLum < 0.14 && bgLum < 0.35) {
                  textColor = '#FFFFFF';
                }
              }
            }
          } catch(e) {}
          // Make the computed text color available to CSS variables (so headers using var(--theme-text) match)
          try { document.documentElement.style.setProperty('--theme-text', textColor); } catch(e){}
          // Apply color directly to post body with !important so it overrides body-level theme text color
          postBody.style.setProperty('color', textColor, 'important');
          // Apply the same note `text` color to the title and date as well
          const titleEl = document.getElementById('postTitle');
          if (titleEl) titleEl.style.setProperty('color', textColor, 'important');
          const dateEl = document.getElementById('postDate');
          if (dateEl) dateEl.style.setProperty('color', textColor, 'important');
        } catch(e) {}
        // Add dropcap class to first paragraph only if the No_upchar flag is NOT present
        const firstP = postBody.querySelector('p');
        if (firstP) {
          if (hasNoUpChar) {
            // Lowercase the first alphabetical character in the first paragraph while preserving HTML structure
            const walker = document.createTreeWalker(firstP, NodeFilter.SHOW_TEXT, {
              acceptNode: node => (node.nodeValue && node.nodeValue.trim()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
            });
            const textNode = walker.nextNode();
            if (textNode) {
              textNode.nodeValue = textNode.nodeValue.replace(/^\s*([A-Za-z])/, (m, c) => m.replace(c, c.toLowerCase()));
            }
            // Mark the body so CSS dropcap rules opt-out
            postBody.classList.add('no-upchar');
          } else {
            firstP.classList.add('dropcap');
          }
        }
        // Enable image zoom for all images
        enableImageZoom();
      } catch (error) {
        console.error('Error loading note:', error);
        document.getElementById('postTitle').textContent = "Error Loading Note";
        document.getElementById('postContent').textContent = "Failed to load the note. Please try again.";
        setLoadingState(false);
      }
    }