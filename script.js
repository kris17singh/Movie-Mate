const API_KEY = 'thewdb';
const searchBtn = document.getElementById('searchBtn');
const movieInput = document.getElementById('movieInput');
const movieContainer = document.getElementById('movieContainer');
const modal = document.getElementById('movieModal');
const modalDetails = document.getElementById('modalDetails');
const modalPoster = document.getElementById('modalPoster');
const closeModal = document.getElementById('closeModal');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const pagination = document.querySelector('.pagination');
const scrollTopBtn = document.getElementById('scrollTopBtn');

let currentPage = 1;
let currentQuery = '';

pagination.style.display = 'none';

searchBtn.addEventListener('click', () => {
  currentPage = 1;
  fetchMovies();
});

movieInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    currentPage = 1;
    fetchMovies();
  }
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies();
    scrollToTop();
  }
});

nextPageBtn.addEventListener('click', () => {
  currentPage++;
  fetchMovies();
  scrollToTop();
});

window.addEventListener('scroll', () => {
  if (document.documentElement.scrollTop > 200) {
    scrollTopBtn.style.display = 'block';
  } else {
    scrollTopBtn.style.display = 'none';
  }
});

scrollTopBtn.addEventListener('click', () => {
  scrollToTop();
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function fetchMovies() {
  currentQuery = movieInput.value.trim();
  if (!currentQuery) {
    movieContainer.innerHTML = '<p>Please enter a movie name.</p>';
    pagination.style.display = 'none';
    return;
  }

  movieContainer.innerHTML = '<p>Loading ...</p>';

  try {
    const res = await fetch(
      `https://www.omdbapi.com/?s=${currentQuery}&page=${currentPage}&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (data.Response === 'False') {
      movieContainer.innerHTML = `<p>${data.Error}</p>`;
      pagination.style.display = 'none';
      return;
    }

    movieContainer.innerHTML = data.Search.map(
      (movie) => `
      <div class="movie-card" onclick="showDetails('${movie.imdbID}')">
        <img src="${
          movie.Poster !== 'N/A'
            ? movie.Poster
            : 'https://via.placeholder.com/220x330'
        }" alt="${movie.Title}">
        <h2>${movie.Title}</h2>
        <p>${movie.Year}</p>
      </div>
    `
    ).join('');

    pagination.style.display = 'flex';
    pageInfo.textContent = `Page ${currentPage}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = data.Search.length < 10;
  } catch (error) {
    movieContainer.innerHTML =
      '<p>Something went wrong. Please try again later.</p>';
    pagination.style.display = 'none';
  }
}

async function showDetails(id) {
  try {
    const res = await fetch(
      `https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`
    );
    const movie = await res.json();

    modalPoster.src =
      movie.Poster !== 'N/A'
        ? movie.Poster
        : 'https://via.placeholder.com/250x350';

    modalDetails.innerHTML = `
      <h2>${movie.Title} (${movie.Year})</h2>
      <p><strong>Genre:</strong> ${movie.Genre}</p>
      <p><strong>Director:</strong> ${movie.Director}</p>
      <p><strong>Actors:</strong> ${movie.Actors}</p>
      <p><strong>IMDB Rating:</strong> ⭐ ${movie.imdbRating}</p>
      <p><strong>Plot:</strong> ${movie.Plot}</p>
      <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title}', '${movie.Poster}', '${movie.Year}')">❤️ Add to Favorites</button>
    `;
    modal.style.display = 'flex';
  } catch (error) {
    console.error(error);
  }
}

function addToFavorites(id, title, poster, year) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.find((movie) => movie.imdbID === id)) {
    favorites.push({ imdbID: id, Title: title, Poster: poster, Year: year });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${title} add to favorites!`);
  } else {
    alert('Already in favorites!');
  }
}
