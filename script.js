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
      http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  };
})();

// Инициация селекта
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

// Начальняя загрузка новостей.
function loadNews () {
  newsService.topHeadlines('ua', onGetResponse);
}

// функция обработки ответа от сервера.
function onGetResponse (err, res) {
  console.log(res.articles);
  renderNews(res.articles);
}

// функция отрисовки новостей.
function renderNews (news) {
  const newsContainer = document.querySelector('.news-container .row');
  let fragment = '';

  news.forEach(newsIt => {
  const it = newsTemlate(newsIt);
  fragment += it;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// функция для разметки одной новости.
function newsTemlate (news) {
  console.log(news);
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
