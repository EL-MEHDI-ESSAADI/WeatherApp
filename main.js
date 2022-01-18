// global variabls
const reminderEl = document.getElementById("reminder");
const mainEl = document.querySelector("main");
const closeReminderBtn = reminderEl.querySelector(".close");
const currentLocationBtn = document.querySelector(".currentLocation");
const searchBtnEl = document.querySelector(".searchBtn");
const modalSearchEl = document.querySelector(".searchModal");
const searchInputEl = modalSearchEl.querySelector("input");
const closeModelBtn = modalSearchEl.querySelector(".closeModal");
const monthNames = [
   "January",
   "February",
   "March",
   "April",
   "May",
   "June",
   "July",
   "August",
   "September",
   "October",
   "November",
   "December",
];
const futureDays = mainEl.querySelectorAll(".futureDay");
const days = {
   Sun: "Sunday",
   Mon: "Monday",
   Tue: "Tuesday",
   Wed: "Wednesday",
   Thu: "Thursday",
   Fri: "Friday",
   Sat: "Saturday",
};
let addressApi =
   "https://api.openweathermap.org/geo/1.0/reverse?{HERELATLON}&limit=1&appid=68c78165246ce7daf4615739a4bba4e5";
let weatherApi =
   "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{location}/next3days?unitGroup=metric&key=D4G7SD9A22XR3NZV9X6U4U9GT";

// after 1s of DOMContentLoaded
window.addEventListener("DOMContentLoaded", (_) => {
   setTimeout((_) => {
      reminderEl.classList.add("displayInfo");
      closeReminderBtn.tabIndex = "0";
      currentLocationBtn.classList.add("attract");
   }, 1000);
});

// add event lister to close info button
closeReminderBtn.addEventListener("click", (_) => {
   reminderEl.classList.remove("displayInfo")
   closeReminderBtn.tabIndex = "-1";
}
   
);

// add event listner for current location button
currentLocationBtn.addEventListener("click", display);

// add event listner for search btn
searchBtnEl.addEventListener("click", (_) => {
   document.documentElement.style.overflow = "hidden";
   reminderEl.classList.remove("displayInfo");
   closeReminderBtn.tabIndex = "-1";
   modalSearchEl.classList.add("showSearch");
   searchInputEl.focus();
   modalSearchEl.ariaHidden = "false";
   searchInputEl.tabIndex = "0";
   closeModelBtn.tabIndex = "0";
});

// add event listner to close modal button
closeModelBtn.addEventListener("click", (_) => {
   document.documentElement.style.overflow = "initial";
   modalSearchEl.classList.remove("showSearch");
   modalSearchEl.ariaHidden = "true";
   searchInputEl.tabIndex = "-1";
   closeModelBtn.tabIndex = "-1";
});

// add event listner to inputshearch
searchInputEl.addEventListener("keydown", function (e) {
   let inputValue = this.value.trim();
   if (e.key != "Enter" || !inputValue) return;
   this.value = "";

   let url = weatherApi.replace("{location}", inputValue);
   makeRequest(url, (weatherData) => {
      document.documentElement.style.overflow = "initial";
      modalSearchEl.classList.remove("showSearch");
      currentLocationBtn.classList.remove("active");
      searchBtnEl.classList.add("active");
      searchInputEl.tabIndex = "-1";
      closeModelBtn.tabIndex = "-1";
      updateWeather(weatherData);
   });
});

// functions
function display() {
   if(currentLocationBtn.classList.contains("active")) return;
   // get geolocation ou the user
   navigator.geolocation.getCurrentPosition(successToGetLoca, failToGetLoca);
}

function successToGetLoca(location) {
   // set adressapi url
   let url = addressApi.replace(
      "{HERELATLON}",
      `lat=${location.coords.latitude}&lon=${location.coords.longitude}`
   );
   makeRequest(url, ([address]) => {
      // set weather api url
      let url = weatherApi.replace(
         "{location}",
         `${address.lat},${address.lon}`
      );
      makeRequest(url, (weatherData) => {
         updateWeather(weatherData, address.name + ", " + address.country);
      });
   });

   // make location button active
   currentLocationBtn.classList.add("active");
   searchBtnEl.classList.remove("active");
}

function failToGetLoca() {
   reminderEl.classList.add("displayInfo");
   closeReminderBtn.tabIndex = "0";
   updateState("fail");
}

function updateState(newState) {
   reminderEl.querySelector(".states > div:not(.hide)").classList.add("hide");
   reminderEl.querySelector(`.${newState}`).classList.remove("hide");
}

function makeRequest(url = "", fun = (_) => "") {
   let httpRequest = new XMLHttpRequest();

   httpRequest.responseType = "json";
   httpRequest.open("GET", url);
   httpRequest.addEventListener("readystatechange", (_) => {
      if (httpRequest.readyState != XMLHttpRequest.DONE) return;
      if (httpRequest.status != 200) {
         if ((httpRequest.status = 400)) {
            // allert invalid location if the location was wrong
            window.alert(`Invalid location`);
            return;
         }
         // allert Request error we if didn't receive data
         window.alert("Request error");
         return;
      }
      fun(httpRequest.response);
   });
   httpRequest.send();
}

function updateWeather(weatherData, placeName) {
   // display location find Info
   reminderEl.classList.add("displayInfo");
   closeReminderBtn.tabIndex = "0";
   updateState("success");
   // update place Name
   mainEl.querySelector(".placeName").innerText =
      placeName || weatherData.resolvedAddress;

   // update todayDate
   let targetTodayDate = new Date(weatherData.days[0].datetime);
   mainEl.querySelector(".todayDate").innerText = `${
      days[targetTodayDate.toDateString().slice(0, 3)]
   }, ${
      monthNames[targetTodayDate.getMonth()]
   } ${targetTodayDate.getDate()}, ${targetTodayDate.getFullYear()}`;

   // update todayIcon
   mainEl.querySelector(
      ".todayIcon img"
   ).src = `./assets/weatherIcons/${weatherData.currentConditions.icon}.svg`;

   // update todaytempe
   mainEl.querySelector(".todaytempe span").innerText = Math.round(
      weatherData.currentConditions.temp
   );

   // update today state
   mainEl.querySelector(".todayState").innerText =
      weatherData.currentConditions.conditions;

   // update futureDays info
   weatherData.days
      .filter((el, index) => index != 0)
      .forEach((dayData, dayIndex) => {
         let dayEl = futureDays[dayIndex];

         dayEl.querySelector(".futureDayName").innerText = new Date(
            dayData.datetime
         )
            .toDateString()
            .slice(0, 3);
         dayEl.querySelector(
            ".futureDayIcon img"
         ).src = `./assets/weatherIcons/${dayData.icon}.svg`;
         dayEl.querySelector(".futureDayState").innerText = dayData.conditions;
         dayEl.querySelector(".futureDayTemp").innerText = `${Math.round(
            dayData.tempmax
         )}° | ${Math.round(dayData.tempmin)}°`;
      });
}
