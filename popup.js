const wrapper = document.querySelector(".wrapper");
const innerWrapper = document.querySelector(".innerWrapper");
const showLocation = document.querySelector(".showLocation");
const tempAndDetails = document.querySelector(".tempAndDetails");
const airDetails = document.querySelector(".airDetails");
const forecastDisplay = document.querySelector(".forecastDisplay");
const loader = document.querySelector(".loader");
const alertWrapper = document.querySelector(".alert");
const alertList = document.querySelector(".alertList");
const searchInp = document.querySelector("#searchInp");
const searchBtn = document.querySelector("#searchBtn");
const resetBtn = document.querySelector(".resetBtn");

const weatherApiKey = "22c23046ca024d3292a124714230111";

const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const nightBg = chrome.runtime.getURL("images/nightBg.jpg");
const dayBg = chrome.runtime.getURL("images/dayBg.jpg");
const alertIcon = chrome.runtime.getURL("images/alertIcon.png");
const pointerIcon = chrome.runtime.getURL("images/pointer.png");
const resetIcon = chrome.runtime.getURL("images/reset.png");

const getCurrentLocation = async () => {
  return new Promise((res, rej) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          res(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (error) => {
          reject(error.message);
        }
      );
    } else {
      reject("Geolocation not available");
    }
  });
};

const generateWeather = async (currentLocation) => {
  try {
    if (!currentLocation) currentLocation = await getCurrentLocation();
    const weatherApiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${currentLocation}&days=7&aqi=yes&alerts=yes`;
    if (!currentLocation) {
      innerWrapper.innerHTML = `
      <h1>Geolocation is not supported by this browser.</h1>
      `;
      return;
    }
    loader.classList.remove("active");
    const res = await fetch(weatherApiUrl);
    const data = await res.json();
    console.log(data);
    const {
      location: { name, country },
      current,
      forecast: { forecastday },
      alerts: { alert },
    } = data;
    const {
      temp_c,
      temp_f,
      is_day,
      condition,
      wind_mph,
      wind_kph,
      pressure_mb,
      pressure_in,
      humidity,
      cloud,
    } = current;
    wrapper.style.background = `${
      is_day ? `url(${dayBg})` : `url(${nightBg})`
    }`;
    wrapper.style.backgroundPosition = "center";
    wrapper.style.backgroundSize = "cover";
    wrapper.style.backgroundRepeat = "no-repeat";

    showLocation.innerText = `${name}, ${country}`;

    let temp = condition.icon.split("/");
    const weaterIcon = chrome.runtime.getURL(
      `images/${is_day ? "day" : "night"}/${temp[temp.length - 1]}`
    );

    tempAndDetails.innerHTML = `
      <div class="details">
        <div class="weaterIcon">
          <img
            src="${weaterIcon}"
            alt="${condition.text}"
          />
        </div>
        <div>
          <h3>${condition.text}</h3>
          <p>Cloud ${cloud}%</p>
        </div>
      </div>
      <div class="temp">
        <p class="is_day">${is_day ? "Day" : "Night"}</p>
        <p>Temp: ${temp_c}&degC | ${temp_f}&degF</p>
        <p>humidity: ${humidity}%</p>
      </div>
    `;
    airDetails.innerHTML = `
    <div>
      <h3>Wind</h3>
      <p>${wind_mph} m/h</p>
      <p>${wind_kph} km/h</p>
    </div>
    <div>
      <h3>Pressure</h3>
      <p>${pressure_mb} millibars</p>
      <p>${pressure_in} inches</p>
    </div>
    `;
    const currentDay = new Date().getDay();
    console.log(currentDay);
    forecastDisplay.innerHTML = "";
    forecastday.forEach((item, i) => {
      const { day } = item;
      const {
        maxtemp_c,
        mintemp_c,
        avgtemp_c,
        condition: { text, icon },
      } = day;

      const forecastDetailsDisplay = () => {
        return `
          <div class="forecastDet">
            <h5>Temperature</h5>
            <p>Avg: ${avgtemp_c} &degC </p>
            <p>Min: ${mintemp_c} &degC </p>
            <p>Max: ${maxtemp_c} &degC </p>
            </div>
            `;
          };

          temp = icon.split("/");
          const forecastWeaterIcon = chrome.runtime.getURL(
            `images/day/${temp[temp.length - 1]}`
            );

      forecastDisplay.innerHTML += `
      <div class="eachDay">
        <img src=${forecastWeaterIcon} alt=${text}/>
        <h4>${daysName[(currentDay + i) % daysName.length]}</h4>
        <p class="weatherType">${text}</p>
        <p class="eachDayTemp">${avgtemp_c} &degC </p>
          ${forecastDetailsDisplay()}

          <div class="pointerIcon">
            <img src=${pointerIcon} src="pointerIcon">
          </div>
        </div>
      `;

      alertList.innerHTML = "";

      const alertNumber = document.createElement("span");
      alertNumber.classList.add("numberOfAlert");
      alertNumber.innerText = alert.length;
      alertWrapper.appendChild(alertNumber);

      if (!alert.length) {
        alertList.innerHTML = `
        <li class="textCenter">
          <h4>No alert available</h4>
        </li>
      `;
      } else {
        alert.forEach((item) => {
          const { headline, event, effective, expires, desc } = item;
          alertList.innerHTML += `
            <li>
              <h3>${event}</h3>
              <p class="alertTime"><span>${
                effective.split("T")[0]
              }</span> - <span>${expires.split("T")[0]}</span></p>
              <p>${desc}</p>
            </li>
          `;
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const work = () => {
  generateWeather();
  searchBtn.setAttribute("disabled", "disabled");
  searchInp.addEventListener("change", (e) => {
    if (e.target.value === "") searchBtn.setAttribute("disabled", "disabled");
    else searchBtn.removeAttribute("disabled");
  });
  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    loader.classList.add("active");
    generateWeather(searchInp.value);
    searchInp.value = "";
  });
  resetBtn.addEventListener("click", (e) => {
    console.log('Hello');
    generateWeather();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  work();
});
