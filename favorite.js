'use strict'
//設計要抓取的API用變數管理
const BASE_URL = 'https://movie-list.alphacamp.io'
const Index_URL = BASE_URL + '/api/v1/movies/'
const Poster_URL = BASE_URL + '/posters/'
//抓出要顯示電影清單的面板
const dataPanel = document.querySelector('#data-panel')

//--加碼功能新增變數--
//顯示模式的切換
const displayModeController = document.querySelector('#display-mode-toggle')
let displayMode = Number(localStorage.getItem('displayMode_f')) || 0 //紀錄顯示模式(card是0，list是1)，同時把狀態計錄存取到localStorage，使用者下次開啟瀏覽器時會存取到前一次的顯示模式


//函式：渲染電影清單(卡片式)
function renderMovieListByCard(data) {
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
//--加碼功能新增函式--
//函式：渲染電影清單(清單式)
function renderMovieListByList(data) {
  let rawHTML = '<ul class="list-group list-group-flush">'
  data.forEach(item => {
    rawHTML += `
      <li class="list-group-item">
        <div class="row">
          <div class="col-sm-10">
            <h5 class="list-title d-inline-block">${item.title}</h5>
          </div>
          <div class="col-sm-2">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </li>
    `
  })
  rawHTML += '</ul>'
  dataPanel.innerHTML = rawHTML
}
//--加碼功能新增函式--
//函式：檢查現在切換到何種顯示狀態再決定用哪個模式的樣板渲染
function checkDisplayMode(data) {
  if (displayMode === 0) {
    renderMovieListByCard(data)
  } else if (displayMode === 1) {
    renderMovieListByList(data)
  }
}



//函式：顯示個別電影的詳細內容
function showMovieDetail(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImage = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')
  // 先清空內容以防殘影
  movieTitle.innerText = ''
  movieImage.children[0].src = ''
  movieDate.innerText = ''
  movieDescription.innerText = ''

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
  checkDisplayMode(movies) //--加碼功能修改部分--
}


//從localStorage取得收藏的電影資料
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
checkDisplayMode(movies) //--加碼功能修改部分--

//監聽事件--
//點擊More按鈕，展開個別電影的詳細資料互動視窗；點擊X按鈕，移除收藏的電影
dataPanel.addEventListener('click', function onPanelCicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieDetail(Number(event.target.dataset.id)) 
  } else if (event.target.matches('.btn-delete-favorite')) {
    deleteFavoriteMovie(Number(event.target.dataset.id))
  }
})

//--加碼功能新增監聽事件--
//點擊list, card icon切換顯示模式
displayModeController.addEventListener('click', function onModeBtnClicked(event) {
  if (event.target.matches('#list-style')) {
    displayMode = 1
  } else {
    displayMode = 0
  }
  localStorage.setItem('displayMode_f', JSON.stringify(displayMode))
  checkDisplayMode(movies) //--加碼功能修改部分-- 
})
