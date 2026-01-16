const themes = ['brown', 'blue', 'red', 'green', 'sky', 'purple', 'pink', 'orange', 'yellow', 'teal', 'black-white', 'sepia'];
const themeToggle = document.querySelector('.theme-toggle');

// Public helper to safely enable/disable theme toggle from other scripts
function setThemeToggleEnabled(enabled) {
  if (!themeToggle) return;
  themeToggle.disabled = !enabled;
  themeToggle.setAttribute('aria-disabled', (!enabled).toString());
  themeToggle.style.opacity = enabled ? '' : '0.5';
  themeToggle.style.pointerEvents = enabled ? '' : 'none';
  // Temporarily suppress transitions/animations site-wide while theme toggle is disabled
  document.body.classList.toggle('no-transitions', !enabled);
  document.documentElement.classList.toggle('no-transitions', !enabled);
} 
// Expose helper globally so other scripts (like the reload handler) can call it
window.setThemeToggleEnabled = setThemeToggleEnabled;

// Load saved theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'brown';
setTheme(savedTheme);

// Attach click handler only if the toggle exists
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'brown';
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

function setTheme(theme) {
  // Temporarily suppress transitions/animations so the theme applies instantly
  document.body.classList.add('no-transitions');
  document.documentElement.classList.add('no-transitions');

  // Apply the theme (updates CSS variables / colors)
  document.body.setAttribute('data-theme', theme);

  // Remove the suppression on the next paint so normal transitions return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('no-transitions');
      document.documentElement.classList.remove('no-transitions');
    });
  });
} 
// Expose setTheme for debugging/testing
window.setTheme = setTheme;
