const themes = ['brown', 'blue', 'red', 'green', 'sky', 'purple', 'pink', 'orange', 'yellow', 'teal'];
const themeToggle = document.querySelector('.theme-toggle');

// Public helper to safely enable/disable theme toggle from other scripts
function setThemeToggleEnabled(enabled) {
  if (!themeToggle) return;
  themeToggle.disabled = !enabled;
  themeToggle.setAttribute('aria-disabled', (!enabled).toString());
  themeToggle.style.opacity = enabled ? '' : '0.5';
  themeToggle.style.pointerEvents = enabled ? '' : 'none';
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
  document.body.setAttribute('data-theme', theme);
}
// Expose setTheme for debugging/testing
window.setTheme = setTheme;
