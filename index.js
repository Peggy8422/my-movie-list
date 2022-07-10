'use strict'
//設計要抓取的API用變數管理
const BASE_URL = 'https://movie-list.alphacamp.io'
const Index_URL = BASE_URL + '/api/v1/movies/'
const Poster_URL = BASE_URL + '/posters/'
//抓出要顯示電影清單的面板
const dataPanel = document.querySelector('#data-panel')
//找出搜尋表單和搜尋輸入框 
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
//製作分頁(有些API參數中本身有分頁功能可設定，但在此沒有因此自己實作)
const MOVIES_PER_PAGE = 12  //設定每頁要顯示的電影數量
const paginator = document.querySelector('#paginator') //找出分頁器ul

//函式：分頁器-分頁顯示電影清單
function getMoviesByPage(page) {
  const data = filterdMovies.length ? filterdMovies : movies
  //page 1 -> movies 0-11
  //page 2 -> movies 12-23
  //page 3 -> movies 24-35 ...

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const endIndex = startIndex + MOVIES_PER_PAGE
  return data.slice(startIndex, endIndex)
}
//函式：分頁器內有幾頁-渲染分頁器頁碼按鈕(依據資料數量決定)
function renderPaginatorPages(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let p = 1; p <= numberOfPages; p++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${p}">${p}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

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
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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
//函式：新增收藏的電影
function addFavoriteMovie(id) {
  //設定收藏清單為一個從localStorage拿出來的陣列(經過JSON.parse()解析)或初始值為空陣列
  //get不到'favoriteMovies'會回傳null
  const favoriteList = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //從movies中找出id值符合的movie
  const movie = movies.find(movie => movie.id === id)
  //防止已收藏的電影重複加入清單
  if (favoriteList.some(movie => movie.id === id)) {
    return alert(`${movie.title} 已存在於收藏清單中!`)
  }
  alert(`${movie.title} 加入收藏清單中!`)
  favoriteList.push(movie)
  // console.log(favoriteList)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteList))
}


//用新的空movies陣列裝取抓到的所有電影資料
const movies = [] //初始-渲染電影清單畫面(沒操作任何功能時)
let filterdMovies = [] //搜尋-渲染經過搜尋關鍵字篩選後的電影清單畫面
axios
  .get(Index_URL)
  .then(response => {
    // console.log(response.data.results)
    movies.push(... response.data.results)
    renderPaginatorPages(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch(error => console.log(error))


//監聽事件--------------------------------------------------------------  
//點擊More按鈕，展開個別電影的詳細資料互動視窗
dataPanel.addEventListener('click', function onPanelCicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieDetail(Number(event.target.dataset.id)) 
  } else if (event.target.matches('.btn-add-favorite')) {
    addFavoriteMovie(Number(event.target.dataset.id))
  }
})

//點擊Search按鈕，提交要搜尋的關鍵字
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //防止瀏覽器對事件動作做出的預設行為(提交表單後會重整頁面)
  event.preventDefault()
  const keyword = searchInput.value.toLowerCase().trim()
  if (!keyword.length) {
    alert('Please type in valid words!')
    searchInput.value = ''
  }
  
  // for (const movie of movies) { //一般用迴圈遍歷篩選作法
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filterdMovies.push(movie)
  //   }
  // }

  //篩選條件：篩選出符合條件的電影資料回傳新陣列 //用filter()的作法
  filterdMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filterdMovies.length === 0) {
    alert(`Cannot find movies with keyword: ${keyword}`)
  }
  renderPaginatorPages(filterdMovies.length)
  renderMovieList(getMoviesByPage(1))

})
//點擊頁碼切換顯示的電影清單範圍
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.innerHTML)
  //OR:透過 dataset 取得被點擊的頁數
  //const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})
