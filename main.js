import "./style.css";

const searchInput = document.getElementById("searchInput");
const movieList = document.getElementById("movieList");
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("clearBtn");

let cartItems = document.getElementById("movieCart");

// pagination
const pagination = document.getElementById("pagination");
const prevPageBtn = document.querySelector("#previousButton");
const nextPageBtn = document.querySelector("#nextButton");
const currentPageNumber = document.querySelector("#pageNumber");

const moviesPerPage = 10;
let currentPage = 1;
let totalPages = 0;

let cart = [];

const headerElement = document.querySelector("header");
const headerHeight = headerElement.offsetHeight;
movieList.style.marginTop = `${headerHeight}px`;
cartItems.style.top = `${headerHeight + 15}px`;

pagination.style.display = "none";

const searchMovies = async (page = 1, searchTerm = "") => {
  try {
    let response = await fetch(
      `https://www.omdbapi.com/?apikey=da09a28f&s=${searchTerm}&type=movie&page=${page}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();
    console.log(`API total results:`, data.totalResults);

    // for pagination
    totalPages = Math.ceil(Number(data.totalResults) / moviesPerPage);

    if (data.Search) {
      displayMovies(data.Search);
      pagination.style.display = "flex";
    } else {
      clearResults();
      movieList.innerHTML = "Movie not found";
    }
  } catch (error) {
    console.error(`Error fetching data:, ${error.message}`);
    movieList.innerHTML = "An error occurred.";
  }

  updatePagination();
};

function displayMovies(movies) {
  movieList.innerHTML = "";

  movies.forEach((movie, index) => {
    movieList.innerHTML += `
        <div id="movieId" class="flex justify-center p-4 cursor-pointer opacity-90 hover:opacity-100">   
          <div class="flex flex-col justify-center lg:justify-start bg-white rounded-lg overflow-hidden shadow-lg">
            <img
              src="${movie.Poster}"
              alt="${movie.Title}"
              class="w-auto h-auto object-cover"
            />
            <div class="p-4">
              <h2 class="text-lg font-bold">${index + 1} - ${movie.Title}</h2>
              <p class="text-gray-600">${movie.Year}</p>
            </div>
          </div>
        </div>
        `;
  });

  // Add event listeners to movie elements for adding to cart
  movieList.querySelectorAll("#movieId").forEach((movieItem, index) => {
    movieItem.addEventListener("click", () => {
      const movieId = index;

      const movieToAdd = movies.find(
        (movie) => movie.imdbID === movies[Number(movieId)].imdbID
      );

      if (movieToAdd) {
        addToCart(movieToAdd);
      } else {
        console.error("Movie not found in search results");
      }
    });
  });
}

function addToCart(movie) {
  // Check if movie already exists in cart
  const existingMovie = cart.find((item) => item.imdbID === movie.imdbID);
  if (existingMovie) {
    console.log(`${movie.Title} is already in the cart.`);
    return;
  }

  cart.push(movie);

  displayCart();
}

function displayCart() {
  // Display cart items
  cartItems.innerHTML = "";
  cart.forEach((item, index) => {
    cartItems.innerHTML += `
    <div class="flex flex-col items-center justify-center lg:justify-between p-2 mb-2 ml-2 last:mb-0 bg-neutral-200 rounded-lg">
      <div class="flex items-start w-full">
        <img
          src="${item.Poster}"
          alt="${item.Title}"
          class="w-16 h-16 object-cover rounded-lg"
        /> 
        <div class="px-2 pb-2 pt-0">
          <h2>${index + 1} - ${item.Title}</h2>
          <p>${item.Year}</p>
        </div>
      
      </div>
      <button class="remove-btn ml-auto bg-red-500 hover:bg-red-600 text-white rounded-lg px-2 py-2">remove</button>
    <div>
        `;
  });

  // Add event listeners to remove buttons after re-rendering
  const removeBtns = document.querySelectorAll(".remove-btn");
  removeBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      console.log("movieIndex", index);
      cart.splice(index, 1);
      displayCart();
    });
  });
}

function updatePagination() {
  nextPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  currentPageNumber.textContent = `${currentPage} / ${totalPages}`;
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    searchMovies(currentPage, searchInput.value);
    console.log("previous", currentPage);
  }
  updatePagination();
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages - 1) {
    currentPage++;
    searchMovies(currentPage, searchInput.value);
    console.log("next", currentPage);
  }
  updatePagination();
});

function clearResults() {
  movieList.innerHTML = "";
  cartItems.innerHTML = "";
  currentPageNumber.textContent = `1 / 0`;
  searchInput.value = "";
  pagination.style.display = "none";
  cart = [];
}

searchBtn.addEventListener("click", () => {
  let searchTerm = searchInput.value;
  currentPage = 1;

  if (searchTerm.trim() === "" || searchTerm.trim().length < 2) {
    searchInput.value = "";
    movieList.innerHTML = `<h2 class="absolute top-20 left-0 right-0 bg-neutral-200 flex justify-center p-2 text-lg font-bold">You mast enter some movie name 😎</h2>`;
    return;
  }
  searchMovies(currentPage, searchTerm);
});

resetBtn.addEventListener("click", clearResults);
