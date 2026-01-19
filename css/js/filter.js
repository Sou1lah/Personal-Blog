// Filter modal functionality
const filterBtn = document.querySelector('.filter-btn');
const filterModal = document.getElementById('filterModal');
const closeFilterBtn = document.querySelector('.close-filter-btn');

if (filterBtn && filterModal) {
  filterBtn.addEventListener('click', () => {
    filterModal.classList.add('active');
  });
}

if (closeFilterBtn && filterModal) {
  closeFilterBtn.addEventListener('click', () => {
    filterModal.classList.remove('active');
  });
}

if (filterModal) {
  filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) {
      filterModal.classList.remove('active');
    }
  });
}

// Handle genre filter changes
const genreFilters = document.querySelectorAll('.genre-filter');
genreFilters.forEach(filter => {
  filter.addEventListener('change', (e) => {
    const selectedGenres = Array.from(genreFilters)
      .filter(f => f.checked)
      .map(f => f.value);
    console.log('Selected genres:', selectedGenres);
    // Add filtering logic here
  });
});
