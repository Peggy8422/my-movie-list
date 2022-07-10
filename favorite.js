'use strict'
//設計要抓取的API用變數管理
const BASE_URL = 'https://movie-list.alphacamp.io'
const Index_URL = BASE_URL + '/api/v1/movies/'
const Poster_URL = BASE_URL + '/posters/'
//抓出要顯示電影清單的面板
const dataPanel = document.querySelector('#data-panel')

//函式：渲染電影清單
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
      <div class="col-sm-3 mb-2">
        <div class="card">
          <img
            src="${Poster_URL + item.image}"
            class="card-img-top" 
            alt="Movie Poster" 
          />
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-danger btn-delete-favorite" data-id="${item.id}">x</button>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML 
}
//函式：顯示個別電影的詳細內容
function showMovieDetail(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImage = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')

  axios
    .get(Index_URL + id)
    .then(response => {
      const data = response.data.results
      movieTitle.innerText = data.title
      movieImage.children[0].src = Poster_URL + data.image
      movieDate.innerText = 'Release date' + data.release_date
      movieDescription.innerText = data.description
    })
}
//函式：將收藏的電影移除收藏清單
function deleteFavoriteMovie(id) {
  if (!movies || !movies.length) return false //加上錯誤處理：如果movies不存在(不成立)直接return掉

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return false //加上錯誤處理：如果movies中找不到傳入的id對應的項目直接return掉

  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}


//從localStorage取得收藏的電影資料
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
renderMovieList(movies)


//點擊More按鈕，展開個別電影的詳細資料互動視窗；點擊X按鈕，移除收藏的電影
dataPanel.addEventListener('click', function onPanelCicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieDetail(Number(event.target.dataset.id)) 
  } else if (event.target.matches('.btn-delete-favorite')) {
    deleteFavoriteMovie(Number(event.target.dataset.id))
  }
})


