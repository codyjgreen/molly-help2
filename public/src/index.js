document.addEventListener('DOMContentLoaded', () => {
  addLogInListener()
});
const APIKEY = 'AIzaSyDsCVsxHCAgjfN7jFg5raF5JbnrUth2GkI'
var USERID = ""

function addLogInListener(){
  let button = document.getElementById('login-button')
  button.addEventListener('click', (ev) => {
    ev.preventDefault()
    let doc = document.getElementById('form-signin')
    let username = document.getElementById('username').value
    while(doc.firstChild){ //clear log in form
      doc.removeChild(doc.firstChild)
    }
    logInUser(username)
  })
}

  function searchAndRender(url, searchTerm){ //searches google api and prints to page
    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        clearSearchField()

        let parentDiv = document.getElementById('search-results')
        let header = document.createElement('h4')
        header.id ='results-for'
        header.classList.add('text-center')
        header.textContent = `search results for: '${searchTerm}'`
        parentDiv.appendChild(header)

        let array = data.items

        array.forEach(function(book){

          let div = document.createElement('div')
          div.classList.add('card')
          div.classList.add('h-100')
          div.classList.add('mb-4')
          div.textContent = `${book.volumeInfo.title}`


          if(book.volumeInfo.imageLinks){ //not all books have images available
            let img = document.createElement('img')
            img.src = book.volumeInfo.imageLinks.thumbnail
            img.classList.add('card-img-top')
            img.classList.add('top-spacing')
            img.classList.add('bottom-spacing')
            div.appendChild(img)
          }

          let author = document.createElement('div')
          author.textContent = `Author:  ${book.volumeInfo.authors}`
          author.classList.add('bottom-spacing')
          div.appendChild(author)

          let summary = document.createElement('div')
          summary.textContent = `${book.volumeInfo.description}`
          summary.classList.add('bottom-spacing')
          summary.classList.add('description')
          div.appendChild(summary)

          let saveButton = document.createElement('button')
          saveButton.textContent = 'save to reading list'
          saveButton.classList.add('btn-primary')
          saveButton.classList.add('cntr-button')
          saveButton.addEventListener('click', (ev) => {
            ev.preventDefault()
            saveButton.textContent = 'added to reading list'
            saveBook(book)
          })
          div.appendChild(saveButton)
          parentDiv.appendChild(div)
        })
      })
  }

  function saveBook(book){ //save to books db
    let bookTitle = book.volumeInfo.title
    let bookAuthor = book.volumeInfo.authors[0]
    let bookPhoto = book.volumeInfo.imageLinks.thumbnail
    let bookDesc = book.volumeInfo.description
    let config = {
      method: 'POST',
      headers: {'Accept': 'application/json',
            'Content-Type': 'application/json'},
      body: JSON.stringify({title: bookTitle, author: bookAuthor, photo_url: bookPhoto, description:bookDesc})
    }
    let url = 'http://localhost:3000/api/v1/books'
    fetch(url, config) // saves to book db
      .then(resp => resp.json())
      .then(data => {
        let bookId = data.id
        createUsersBooksInstance(bookId)
      })
  }

  function createUsersBooksInstance(bookId){
    let url = 'http://localhost:3000/api/v1/usersbooks'
    let config = {
      method: 'POST',
      headers: {'Accept': 'application/json',
            'Content-Type': 'application/json'},
       body: JSON.stringify({user_id: USERID, book_id: bookId, read_status: false})
    }
    fetch(url, config)
  }

  function clearSearchField(){ //clears search field
    let field = document.getElementById('search-input')
    field.value = ""
  }

  function clearPageContents(){ //clears search results
    let content = document.getElementById('search-results')
    while(content.firstChild){
      content.removeChild(content.firstChild)
    }
  }


  function logInUser(username){
    let config = {
      method: 'POST',
      headers: {'Accept': 'application/json',
            'Content-Type': 'application/json'},
      body: JSON.stringify({username: username})
    }
    let url = 'http://localhost:3000/api/v1/users'
    fetch(url, config)
      .then(resp => resp.json())
      .then(data => {
        USERID = data.id
        let username = data.username
        renderHomePage(username)
        })
  }


  function renderHomePage(username){
    let welcome = document.getElementById('welcome-bar')
    welcome.textContent = `${username}`
    getReadingList()   //functionality to render user's books
    renderSearchForButton()
  }

  function renderSearchForButton(){ //render search for books button
    let searchBar = document.getElementById('search-bar')
    let searchForButton = document.createElement('button')
    searchForButton.id = 'search-for-btn'
    searchForButton.textContent = 'search for books'
    searchForButton.classList.add('btn-primary')
    searchForButton.classList.add('cntr-button')
    searchForButton.classList.add('bottom-spacing')
    searchForButton.addEventListener('click', (ev) => {
      ev.preventDefault()
      clearSearchForButton()
      clearPageContents()
      clearWelcomeMessage()
      renderSearchBar()
      renderReturnButton()
    })
    searchBar.appendChild(searchForButton)
  }

  function clearSearchForButton(){
    let searchForButton = document.getElementById('search-for-btn')
    searchForButton.remove()
  }

  function getReadingList(){
    let url = `http://localhost:3000/api/v1/usersbooks/${USERID}`
    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        console.log(data)
        renderWelcomeMessage(data.length)
        getReadingListBookData(data)
      })
  }

  function renderWelcomeMessage(count){
    if(count > 1){
      let blurb = document.getElementById('fill-in')
      blurb.textContent = `there are currently ${count} books in your reading list`
    } else {
      let blurb = document.getElementById('fill-in')
      blurb.textContent = `there are no books in your reading list! get searchin'!`
    }

  }

  function clearWelcomeMessage(){
    let blurb = document.getElementById('fill-in')
    blurb.textContent = `'so many books, so little time.'   frank zappa`
  }

  function getReadingListBookData(data){
    data.forEach(function(book){
      console.log(data)
      let bookId = book.book_id
      let readStatus = book.read_status
      let usersbooksId = book.id
      let url = `http://localhost:3000/api/v1/books/${bookId}`
      fetch(url)
        .then(resp => resp.json())
        .then(data => {
          //console.log(data)
          let title = data.title
          let author = data.author
          let image = data.photo_url
          let bookId = data.id
          let bookDesc = data.description
          renderReadingList(title, author, image, bookId, bookDesc, readStatus, usersbooksId)
        })
    })
  }

  function renderReadingList(title, author, image, bookId, bookDesc, readStatus, usersbooksId){
    let parentDiv = document.getElementById('search-results')
    let div = document.createElement('div')
    div.classList.add('card')
    div.classList.add('h-100')
    div.classList.add('mb-4')
    div.textContent = `${title}`
    parentDiv.appendChild(div)

    let img = document.createElement('img')
    img.src = image
    img.classList.add('card-img-top')
    img.classList.add('top-spacing')
    img.classList.add('bottom-spacing')
    div.appendChild(img)

    let writer = document.createElement('div')
    writer.textContent = `Author:  ${author}`
    writer.classList.add('bottom-spacing')
    div.appendChild(writer)

    let summary = document.createElement('div')
    summary.textContent = `${bookDesc}`
    summary.classList.add('bottom-spacing')
    summary.classList.add('description')
    div.appendChild(summary)

    let readButton = document.createElement('button')
    if(readStatus === true){
      readButton.textContent = 'read'
    } else {
      readButton.textContent = 'unread'
    }
    readButton.classList.add('btn-primary')
    readButton.addEventListener('click', (ev) => { // front end
        ev.preventDefault()
        if (readButton.textContent === 'unread'){
          readButton.textContent = 'read'
          let status = true
          updateReadStatus(usersbooksId, status) //backend update
        } else {
          readButton.textContent = 'unread'
          let status = false
          updateReadStatus(usersbooksId, status) //backend update
        }
        //updateReadStatus(bookId, status) //backend update
    })
    div.appendChild(readButton)

    let deleteButton = document.createElement('button')
    deleteButton.textContent = 'remove from reading list'
    deleteButton.classList.add('btn-primary')
    deleteButton.classList.add('lft-button')
    deleteButton.addEventListener('click', (ev) => {
      ev.preventDefault()
      console.log('delete button clicked')
      removeBook(bookId)
    })
    div.appendChild(deleteButton)
  }

  function updateReadStatus(usersbooksId, status){
    let config = {
      method: 'PATCH',
      headers: {'Accept': 'application/json',
            'Content-Type': 'application/json'},
      body: JSON.stringify({id: usersbooksId, read_status: status})
    }
    let url = `http://localhost:3000/api/v1/usersbooks/${usersbooksId}`
    fetch(url, config)
  }

  function removeBook(bookId){
    let url = `http://localhost:3000/api/v1/usersbooks/${bookId}`
    let config = {
      method: 'DELETE',
      headers: {'Accept': 'application/json',
            'Content-Type': 'application/json'},
      body: JSON.stringify({user_id: USERID, book_id: bookId})
    }
    fetch(url, config)
    .then(()=> {
      clearPageContents()
      getReadingList()
    })
  }

  function renderReturnButton(){ //button to return to reading list from search
    let div = document.getElementById('return')
    let returnButton = document.createElement('button')
    returnButton.textContent = 'return to reading list'
    returnButton.classList.add('btn-primary')
    returnButton.id = 'return-button'
    returnButton.addEventListener('click', (ev) => {
      ev.preventDefault()
      clearPageContents()
      clearReturnAndSearchButtons()
      renderSearchForButton()
      getReadingList()
    })
    div.appendChild(returnButton)
  }

  function clearReturnAndSearchButtons(){
    let button = document.getElementById('return-button')
    button.remove()
    let searchInput = document.getElementById('search-input')
    searchInput.remove()
    let searchButton = document.getElementById('search-button')
    searchButton.remove()
    let clearButton = document.getElementById('clear-button')
    clearButton.remove()
  }

  function renderSearchBar(){ //render field, srch button, clr button
    let searchBar = document.getElementById('search-bar')
    let searchField = document.createElement('input')
    searchField.type = 'text'
    searchField.id = 'search-input'
    searchField.placeholder = 'book title or author'
    searchBar.appendChild(searchField)

    let searchButton = document.createElement('button')
    searchButton.type = 'button'
    searchButton.textContent = 'search'
    searchButton.id = 'search-button'
    searchButton.classList.add('btn-primary')
    searchButton.classList.add('lft-button')
    searchBar.appendChild(searchButton)

    let clearButton = document.createElement('button')
    clearButton.type = 'button'
    clearButton.textContent = 'clear search results'
    clearButton.id = 'clear-button'
    clearButton.classList.add('btn-primary')
    clearButton.classList.add('lft-button')
    searchBar.appendChild(clearButton)

    addSearchButtonListener()
    addClearButtonListener()
  }

  function addClearButtonListener(){
   let button = document.getElementById('clear-button')
   button.addEventListener('click', (ev) => {
     ev.preventDefault()
     console.log('clicked clear')
     clearSearchForButton()
     clearPageContents()
   })
  }

  function addSearchButtonListener(){
    let button = document.getElementById('search-button')
    button.addEventListener('click', (ev) => {
      ev.preventDefault()
      let searchTerm = document.getElementById('search-input').value
      console.log(searchTerm)
      let searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${APIKEY}`
      console.log(searchUrl)
      searchAndRender(searchUrl, searchTerm)
    })
  }
