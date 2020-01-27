// модуль HTTP
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

// Инициация http запроса
const http = customHttp();

const newsService = (function () {
  const apiKey = '622d66d9dd7a4934b5cd17bb3ae1d14b';
  const apiUrl = 'https://newsapi.org/v2';
  
  return {
    topHeadlines(country = 'ua', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=science&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
})();

// Элементы DOM.
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

// Обработка отправки формы.
form.addEventListener('submit', evt => {
  evt.preventDefault();
  loadNews();  
});

// Инициация селекта
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

// Начальняя загрузка новостей.
function loadNews () {
  showLoader();
  const countrySelectValue = countrySelect.value;
  const searchInputValue = searchInput.value;

  if (!searchInputValue) {
    newsService.topHeadlines(countrySelectValue, onGetResponse);
  } else {
    newsService.everything(searchInputValue, onGetResponse);
  }  
}

// функция обработки ответа от сервера.
function onGetResponse (err, res) { 
  removeLoader();
  if (err) {
    showAlert(err, 'error-msg');
    return;
  } 
  if (!res.articles.length) {    
    document.querySelector('.news-container .row').innerHTML = '';
    showAlert('По вашему запросу ничего не найдено.');
    form.reset();        
    return;
  }
  renderNews(res.articles);
}

// функция отрисовки новостей.
function renderNews (news) {
  const newsContainer = document.querySelector('.news-container .row');
  if (newsContainer.children.length) {
    clearConteiner(newsContainer);
  }
  let fragment = '';

  news.forEach(newsIt => {
  const it = newsTemlate(newsIt);
  fragment += it;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// функция отчистки от новстей.
function clearConteiner (conteiner) {
  let lastChild = conteiner.lastElementChild;
  while (lastChild) {
    conteiner.removeChild(lastChild);
    lastChild = conteiner.lastElementChild;
  }
}

// функция для разметки одной новости.
function newsTemlate (news) {  
  return `
  <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${news.urlToImage}">
        <span class="card-title">${news.title || ''}</span>        
      </div>
      <div class="card-content">
        <p>${news.description || ''}</p> 
      </div>
      <div class="card-action">
        <a href="${news.url}">Read more</a>
      </div>
    </div>
  </div>
  `;
}

// Функция для вывола всплывающих окон с сообщением.
function showAlert (msg, type = 'success') {
  M.toast({html: msg, classes: type});
}

// Функция для отображени прилоадера
function showLoader () {
  document.body.insertAdjacentHTML('afterbegin',
  `
  <div class="progress">
    <div class="indeterminate"></div>
  </div>
  `
  );
}

// Функция скрывающая прилоадер
function removeLoader () {
  const loader = document.querySelector('.progress');
  if(loader){
    loader.remove();
  }
}
