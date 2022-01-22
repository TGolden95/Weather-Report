var rootUrl = "https://api.openweathermap.org";
var APIKey = "a6a105a0dc5075c714f6c7d603336df5";

var searchHistory = [];

var searchForm = document.querySelector("#search-form");
var inputElement = document.querySelector("#form-input");
var todaysSection = document.querySelector("#today");
var fiveDay = document.querySelector("#forecast");
var searchHistoryContainer = document.querySelector("#history");

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function renderSearchHistory() {
  searchHistoryContainer.innerHTML = "";

  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-controls", "today forecast");
    btn.classList.add("history-btn", "btn-history");

    btn.setAttribute("data-search", searchHistory[i]);
    btn.textContent = searchHistory[i];
    searchHistoryContainer.append(btn);
  }
}

function appendToHistory(search) {
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);

  localStorage.setItem("search-history", JSON.stringify(searchHistory));
  renderSearchHistory();
}

function initSearchHistory() {
  var storedHistory = localStorage.getItem("search-history");
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
}

function renderCurrentWeather(city, weather, timezone) {
  var date = dayjs().tz(timezone).format("M/D/YYYY");

  var tempF = weather.temp;
  var windMph = weather.wind_speed;
  var humidity = weather.humidity;
  var uvi = weather.uvi;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;

  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var heading = document.createElement("h2");
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");
  var uvEl = document.createElement("p");
  var uviBadge = document.createElement("button");

  card.setAttribute("class", "card");
  cardBody.setAttribute("class", "card-body");
  card.append(cardBody);

  heading.setAttribute("class", "h3 card-title");
  tempEl.setAttribute("class", "card-text");
  windEl.setAttribute("class", "card-text");
  humidityEl.setAttribute("class", "card-text");

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  weatherIcon.setAttribute("class", "weather-img");
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  uvEl.textContent = "UV Index: ";
  uviBadge.classList.add("btn", "btn-sm");

  if (uvi < 3) {
    uviBadge.classList.add("btn-success");
  } else if (uvi < 7) {
    uviBadge.classList.add("btn-warning");
  } else {
    uviBadge.classList.add("btn-danger");
  }

  uviBadge.textContent = uvi;
  uvEl.append(uviBadge);
  cardBody.append(uvEl);

  todaysSection.innerHTML = "";
  todaysSection.append(card);
}

function renderForecastCard(forecast, timezone) {
  var unixTs = forecast.dt;
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var tempF = forecast.temp.day;
  var { humidity } = forecast;
  var windMph = forecast.wind_speed;

  var col = document.createElement("div");
  var card = document.createElement("div");
  var cardBody = document.createElement("div");
  var cardTitle = document.createElement("h5");
  var weatherIcon = document.createElement("img");
  var tempEl = document.createElement("p");
  var windEl = document.createElement("p");
  var humidityEl = document.createElement("p");

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.setAttribute("class", "col-md");
  col.classList.add("five-day-card");
  card.setAttribute("class", "card bg-primary h-100 text-white");
  cardBody.setAttribute("class", "card-body p-2");
  cardTitle.setAttribute("class", "card-title");
  tempEl.setAttribute("class", "card-text");
  windEl.setAttribute("class", "card-text");
  humidityEl.setAttribute("class", "card-text");

  cardTitle.textContent = dayjs.unix(unixTs).tz(timezone).format("M/D/YYYY");
  weatherIcon.setAttribute("src", iconUrl);
  weatherIcon.setAttribute("alt", iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  fiveDay.append(col);
}

// Shows Five Day forecsat
function renderForecast(dailyForecast, timezone) {
  var startDt = dayjs().tz(timezone).add(1, "day").startOf("day").unix();
  var endDt = dayjs().tz(timezone).add(6, "day").startOf("day").unix();

  var headingCol = document.createElement("div");
  var heading = document.createElement("h4");

  headingCol.setAttribute("class", "col-12");
  heading.textContent = "5-Day Forecast:";
  headingCol.append(heading);

  fiveDay.innerHTML = "";
  fiveDay.append(headingCol);
  for (var i = 0; i < dailyForecast.length; i++) {
    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
      renderForecastCard(dailyForecast[i], timezone);
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.current, data.timezone);
  renderForecast(data.daily, data.timezone);
}

function fetchCoords(search) {
  var url = `${rootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${APIKey}`;

  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert("Location not found");
      } else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;
  var url = `${rootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${APIKey}`;

  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchHistoryClick(e) {
  if (!e.target.matches(".btn-history")) {
    return;
  }

  var btn = e.target;
  var search = btn.getAttribute("data-search");
  fetchCoords(search);
}

function handleSearchFormSubmit(e) {
  if (!inputElement.value) {
    return;
  }

  e.preventDefault();
  var search = inputElement.value.trim();
  fetchCoords(search);
  inputElement.value = "";
}

initSearchHistory();
searchForm.addEventListener("submit", handleSearchFormSubmit);
searchHistoryContainer.addEventListener("click", handleSearchHistoryClick);
