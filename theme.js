const themes = ['brown', 'blue', 'red', 'green', 'sky', 'purple', 'pink', 'orange', 'yellow', 'teal'];
const themeToggle = document.querySelector('.theme-toggle');

// Load saved theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'brown';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = document.body.getAttribute('data-theme') || 'brown';
  const currentIndex = themes.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themes.length;
  const nextTheme = themes[nextIndex];
  
  setTheme(nextTheme);
  localStorage.setItem('theme', nextTheme);
});

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
}
