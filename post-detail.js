// Post detail modal functionality
const postModal = document.getElementById('postModal');
const closePostBtn = document.querySelector('.close-post-btn');
const readBtns = document.querySelectorAll('.read-btn');

readBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const card = btn.closest('.card');
    const title = card.dataset.title;
    const author = card.dataset.author;
    const date = card.dataset.date;
    const content = card.dataset.content;

    document.getElementById('postTitle').textContent = title;
    document.getElementById('postAuthor').textContent = author;
    document.getElementById('postDate').textContent = date;
    document.getElementById('postContent').textContent = content;

    postModal.classList.add('active');
  });
});

closePostBtn.addEventListener('click', () => {
  postModal.classList.remove('active');
});

postModal.addEventListener('click', (e) => {
  if (e.target === postModal) {
    postModal.classList.remove('active');
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && postModal.classList.contains('active')) {
    postModal.classList.remove('active');
  }
});
