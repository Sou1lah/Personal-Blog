    const GITHUB_API = 'https://api.github.com/repos/Sou1lah/Personal-Blog/contents/wiki';
    const GITHUB_RAW = 'https://raw.githubusercontent.com/Sou1lah/Personal-Blog/main/wiki';

    const reloadBtn = document.getElementById('reloadBtn');
    const blogSection = document.getElementById('blogSection');
    const notesSection = document.getElementById('notesSection');
    const notesCardsContainer = document.getElementById('notesCardsContainer');

    let isNotesMode = true;

    // Load notes on page load
    loadNotesContent();

    reloadBtn.addEventListener('click', async () => {
      // Reload notes from wiki (force fetch and update cache)
      try {
        reloadBtn.disabled = true;
        reloadBtn.style.transform = 'rotate(360deg)';
        if (window.setThemeToggleEnabled) window.setThemeToggleEnabled(false);
        await loadNotesContent(true); // force fetch
      } finally {
        reloadBtn.style.transform = '';
        reloadBtn.disabled = false;
        if (window.setThemeToggleEnabled) window.setThemeToggleEnabled(true);
      }
    });

    async function loadNotesContent(forceFetch = false) {
      notesCardsContainer.innerHTML = '<p style="text-align: center; padding: 40px; font-size: 1.1rem; color: rgba(36, 34, 27, 0.7);">Loading notes...</p>';

      try {
        // Use localStorage cache unless forceFetch is true
      let categories = {};
      if (!forceFetch) {
        const cached = localStorage.getItem('wikiNotesCache');
        if (cached) {
          try {
            categories = JSON.parse(cached);
          } catch (e) {
            categories = {};
          }
        }
      }
      if (Object.keys(categories).length === 0 || forceFetch) {
        // Helper: recursively fetch all .md files from GitHub API
        async function fetchAllMarkdownFiles(apiUrl, category = null) {
          const result = {};
          const response = await fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
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
        // Helper: recursively fetch all .md files from local server
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
              let cleaned = decodeURIComponent(href).replace(/^\/?/, '').trim().replace(/\s+\.md$/, '.md');
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
        try {
          // Try index.json manifest first (local dev or GitHub raw)
          let indexList = null;
          try {
            const idxResp = await fetch('/wiki/index.json');
            if (idxResp.ok) indexList = await idxResp.json();
          } catch (e) {}
          if (!indexList) {
            try {
              const ghIdxResp = await fetch(`${GITHUB_RAW}/index.json`);
              if (ghIdxResp.ok) indexList = await ghIdxResp.json();
            } catch (e) {}
          }

          if (indexList && Array.isArray(indexList.files) && indexList.files.length) {
            const built = {};
            for (const p of indexList.files) {
              const cleaned = decodeURIComponent(p).replace(/^\/?/, '').trim();
              const parts = cleaned.split('/');
              if (parts.length === 1) {
                if (!built['Root']) built['Root'] = [];
                built['Root'].push({ name: parts[0], path: cleaned, download_url: `/wiki/${cleaned}` });
              } else {
                const dir = parts[0];
                const filename = parts.slice(1).join('/');
                if (!built[dir]) built[dir] = [];
                built[dir].push({ name: filename, path: cleaned, download_url: `/wiki/${cleaned}` });
              }
            }
            categories = built;
            try { localStorage.setItem('wikiNotesCache', JSON.stringify(categories)); } catch (e) {}
          } else {
            try {
              categories = await fetchAllMarkdownFiles(GITHUB_API);
            } catch (githubErr) {
              console.warn('GitHub API failed, attempting local /wiki fallback:', githubErr);
              try {
                categories = await fetchAllMarkdownFilesLocal();
              } catch (localErr) {
                console.error('Local /wiki fallback failed:', localErr);
                throw githubErr;
              }
            }
            try { localStorage.setItem('wikiNotesCache', JSON.stringify(categories)); } catch (e) {}
          }
        } catch (e) {
          // If all fetching fails, categories remains empty and error will be handled below
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
        for (const [category, items] of Object.entries(categories)) {
          if (items.length === 0) continue;

          for (const file of items) {
            const title = file.name.replace('.md', '').replace(/_/g, ' ');
            // Remove duplicated wiki/ if present
            let path = category === 'Root' ? `wiki/${file.name}` : `wiki/${category}/${file.name}`;
            if (path.startsWith('wiki/wiki/')) {
              path = path.replace('wiki/wiki/', 'wiki/');
            }
            // Use file.download_url if present and starts with / (local), else build GitHub raw URL
            let rawUrl;
            if (file.download_url && file.download_url.startsWith('/wiki/')) {
              rawUrl = file.download_url;
            } else {
              rawUrl = `${GITHUB_RAW}/${path.split('/').map(encodeURIComponent).join('/')}`;
            }
            if (rawUrl.includes('wiki/wiki/')) {
              rawUrl = rawUrl.replace('wiki/wiki/', 'wiki/');
            }
            console.log('Raw note URL:', rawUrl);

            // Synchronously add a placeholder for tags, to be filled after fetch
            const cardId = `card-${category.replace(/[^a-zA-Z0-9]/g, '')}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}`;
            html += `
              <article class="card" id="${cardId}" style="display: flex; flex-direction: column; min-height: 260px; position: relative; padding-bottom: 72px;">
                <div class="note-banner" data-raw-url="${rawUrl}" style="width: 100%; height: 140px; background-color: #d4c5b9; background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 16px 16px 0 0;"></div>
                <h3 class="card-title" style="margin-top: 12px;">${title}</h3>
                <div style="flex: 1;"></div>
                <div class="card-footer" style="position: absolute; left: 16px; right: 16px; bottom: 16px; z-index: 2; pointer-events: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                  <div class="note-tags-scroll-wrap" style="flex: 1 1 auto; min-width: 0; max-width: calc(100% - 110px); overflow: hidden; position: relative;">
                    <div class="note-tags" style="display: flex; flex-wrap: nowrap; gap: 6px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 2px; -webkit-overflow-scrolling: touch; max-width: 100%; position: relative;"></div>
                    <div class="tags-fade" style="position: absolute; right: 0; top: 0; width: 40px; height: 100%; pointer-events: none; background: linear-gradient(to right, transparent, rgba(245,240,230,0.6) 95%);"></div>
                  </div>
                  <a href="post.html?note=${encodeURIComponent(path)}" class="btn" style="flex: 0 0 auto; padding: 8px 12px; margin: 0;">Read</a>
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

        const bannerElements = notesCardsContainer.querySelectorAll('.note-banner');

        // For card thumbnails we only need to set banners; skip content previews
        for (let i = 0; i < bannerElements.length; i++) {
          const bannerElement = bannerElements[i];
          const rawUrl = bannerElement.getAttribute('data-raw-url');
          try {
            const r = await fetch(rawUrl);
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
              if (resolvedBanner) {
                bannerElement.style.backgroundImage = `url(\"${resolvedBanner}\")`;
                bannerElement.style.backgroundColor = 'transparent';
                bannerElement.style.backgroundSize = 'cover';
                bannerElement.style.backgroundPosition = 'center';
                bannerElement.style.backgroundRepeat = 'no-repeat';
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
                          bannerElement.style.backgroundImage = `url("${resolvedFallback}")`;
                          bannerElement.style.backgroundColor = 'transparent';
                          bannerElement.style.backgroundSize = 'cover';
                          bannerElement.style.backgroundPosition = 'center';
                          bannerElement.style.backgroundRepeat = 'no-repeat';
                          continue;
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
                  svg: '<svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2" style="vertical-align:middle;"><rect width="24" height="24" rx="5" fill="#1DA1F2"/><path d="M19.633 7.997c.013.176.013.353.013.53 0 5.39-4.104 11.61-11.61 11.61-2.307 0-4.453-.676-6.26-1.84.32.037.637.05.97.05 1.92 0 3.687-.65 5.096-1.747-1.8-.037-3.32-1.22-3.843-2.85.25.037.5.062.763.062.37 0 .74-.05 1.085-.144-1.87-.375-3.28-2.03-3.28-4.02v-.05c.55.306 1.18.49 1.85.513a4.07 4.07 0 01-1.81-3.39c0-.75.2-1.45.55-2.05a11.62 11.62 0 008.42 4.27c-.062-.3-.1-.6-.1-.92 0-2.22 1.8-4.02 4.02-4.02 1.16 0 2.21.49 2.95 1.28a7.94 7.94 0 002.56-.98c-.28.87-.87 1.6-1.65 2.06a8.07 8.07 0 002.31-.62c-.52.81-1.17 1.52-1.92 2.09z" fill="#fff"/></svg>',
                  bg: '#1DA1F2', color: '#fff'
                }
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

              function renderTag(tag, noUpChar) {
                // strip leading # for display and matching
                const tagStripped = tag.replace(/^#/, '');
                const lower = tagStripped.toLowerCase();
                // prepare display text (lowercase first letter if flag is present)
                const displayText = noUpChar && tagStripped.length ? (tagStripped.charAt(0).toLowerCase() + tagStripped.slice(1)) : tagStripped;

                if (socialIcons[lower]) {
                  const icon = socialIcons[lower];
                  // Use a slightly transparent background for social badges (only affects social tags)
                  const bg = hexToRgba(icon.bg, 0.12);
                  // Keep SVG icon colors intact so only the badge background is translucent
                  const svg = icon.svg;
                  return `<span style="display:inline-block;background:${bg};color:${icon.color};font-size:0.85em;padding:2px 10px 2px 8px;border-radius:50px;box-shadow:0 1px 4px #0001;white-space:nowrap;vertical-align:middle;gap:4px;">${svg}<span style='margin-left:6px;vertical-align:middle;'>${displayText}</span></span>`;
                }
                return `<span style="display:inline-block;background:#f5f5f5;color:#444;font-size:0.85em;padding:2px 10px 2px 10px;border-radius:50px;box-shadow:0 1px 4px #0001;white-space:nowrap;">${displayText}</span>`;
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
