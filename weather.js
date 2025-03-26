document.getElementById("weather-btn").addEventListener("click", fetchWeather);

async function getCoordinates(city) {
    const geoAPI = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
    const response = await fetch(geoAPI);
    const data = await response.json();

    if (!data.results) {
        alert("City not found!");
        return null;
    }

    return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
        timezone: data.results[0].timezone,
        country: data.results[0].country
    };
}

async function fetchWeather() {
    const city = document.getElementById("search").value;
    if (!city) {
        alert("Please enter a city name!");
        return;
    }

    const coords = await getCoordinates(city);
    if (!coords) return;

    const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=${coords.timezone}`;
    
    const response = await fetch(weatherAPI);
    const data = await response.json();

    document.getElementById("city-country").innerText = `${city}, ${coords.country}`;
    document.getElementById("temperature").innerText = `${data.current_weather.temperature}°C`;
    document.getElementById("description").innerText = getWeatherDescription(data.current_weather.weathercode);
    document.getElementById("weather-icon").src = getWeatherIcon(data.current_weather.weathercode);

    document.getElementById("day").innerText = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    updateForecast(data.daily);
    handleWeatherEffect(data.current_weather.weathercode);
}

function updateForecast(daily) {
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let today = new Date().getDay();

    for (let i = 1; i <= 3; i++) { 
        let dayIndex = (today + i) % 7;

        const forecastDiv = document.createElement("div");
        forecastDiv.classList.add("forecast-item");

        forecastDiv.innerHTML = `
            <p>${days[dayIndex]}</p>
            <img src="${getWeatherIcon(daily.weathercode[i])}" alt="Weather Icon">
            <p>${daily.temperature_2m_max[i]}°C / ${daily.temperature_2m_min[i]}°C</p>
        `;

        forecastContainer.appendChild(forecastDiv);
    }
}

function getWeatherDescription(code) {
    const weatherDescriptions = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Freezing Fog",
        51: "Drizzle",
        61: "Rain",
        80: "Rain Showers",
        85: "Snow Showers",
        95: "Thunderstorms"
    };
    return weatherDescriptions[code] || "Unknown Weather";
}

function getWeatherIcon(code) {
    const iconMap = {
        0: "https://openweathermap.org/img/wn/01d.png",
        1: "https://openweathermap.org/img/wn/01n.png",
        2: "https://openweathermap.org/img/wn/02d.png",
        3: "https://openweathermap.org/img/wn/03d.png",
        45: "https://openweathermap.org/img/wn/50d.png",
        48: "https://openweathermap.org/img/wn/50d.png",
        51: "https://openweathermap.org/img/wn/09d.png",
        61: "https://openweathermap.org/img/wn/10d.png",
        80: "https://openweathermap.org/img/wn/11d.png",
        85: "https://openweathermap.org/img/wn/13d.png",
        95: "https://openweathermap.org/img/wn/11d.png"
    };
    return iconMap[code] || "https://openweathermap.org/img/wn/01d.png";
}

/* ✅ Weather Effects: Snow & Rain */
function handleWeatherEffect(code) {
    removePreviousEffects();

    if (code === 61 || code === 80) { 
        createEffect("rain", generateRain);
    } else if (code === 85) { 
        createEffect("snow", generateSnow);
    }
}

function createEffect(className, generator) {
    const effectContainer = document.createElement("div");
    effectContainer.classList.add(className);
    document.body.appendChild(effectContainer);
    generator(effectContainer);
}

function generateRain(container) {
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement("div");
        drop.classList.add("drop");
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
        container.appendChild(drop);
    }
}

function generateSnow(container) {
    for (let i = 0; i < 100; i++) {
        const flake = document.createElement("div");
        flake.classList.add("flake");
        flake.style.left = `${Math.random() * 100}vw`;
        flake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        container.appendChild(flake);
    }
}

function removePreviousEffects() {
    document.querySelectorAll(".rain, .snow").forEach(effect => effect.remove());
}

/* ✅ City Suggestions (Autocomplete) */
const searchInput = document.getElementById("search");
const suggestionsBox = document.getElementById("suggestions");

searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    const geoAPI = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`;
    const response = await fetch(geoAPI);
    const data = await response.json();

    if (!data.results) {
        suggestionsBox.innerHTML = "<p>No results found</p>";
        return;
    }

    suggestionsBox.innerHTML = "";

    data.results.forEach(city => {
        const cityOption = document.createElement("div");
        cityOption.classList.add("suggestion-item");
        cityOption.textContent = `${city.name}, ${city.country}`;
        cityOption.onclick = () => {
            searchInput.value = city.name;
            suggestionsBox.innerHTML = "";
        };
        suggestionsBox.appendChild(cityOption);
    });
});

/* Hide suggestions when clicking outside */
document.addEventListener("click", (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
        suggestionsBox.innerHTML = "";
    }
});
