var APIKey = "a6a105a0dc5075c714f6c7d603336df5";
var rootUrl = "https://openweathermap.org";

var searchHistoryArray = [];

var searchForm = document.querySelector("#search-form");
var inputElement = document.querySelector("#form-input");
var todaysSection = document.querySelector("#today");
var fiveDay = document.querySelector("#forecast");
var searchHistory = document.querySelector("#history");

function fetchCoords(search) {
  var url = `${rootUrl}/data/2.5/weather?q=${search}&appid=${APIKey}`;
  fetch(url, {
    mode: "no-cors",
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}
fetchCoords("Atlanta");
