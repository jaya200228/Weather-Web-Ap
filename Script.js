// API Key for Visual Crossing Weather
const API_KEY = 'TCTS69Q5P4J39PSA7KWT6WHV8';
const API_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

// DOM Elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const refreshBtn = document.getElementById('refresh-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const loadingElement = document.getElementById('loading');
const currentWeatherElement = document.getElementById('current-weather');
const locationElement = document.getElementById('location');
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temp');
const weatherIconElement = document.getElementById('weather-icon');
const conditionsElement = document.getElementById('conditions');
const windElement = document.getElementById('wind');
const humidityElement = document.getElementById('humidity');
const precipElement = document.getElementById('precip');
const hourlyContainer = document.getElementById('hourly-container');

// Current location
let currentLocation = 'Tirupati'; // Default location

// Initialize the app
function init() {
    // Event listeners
    searchBtn.addEventListener('click', searchWeather);
    refreshBtn.addEventListener('click', refreshWeather);
    currentLocationBtn.addEventListener('click', getCurrentLocationWeather);
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWeather();
        }
    });

    // Load default weather data
    loadWeatherData(currentLocation);
}

// Get weather data from API
async function getWeatherData(location) {
    try {
        showLoading();

        const response = await fetch(`${API_URL}${encodeURIComponent(location)}?unitGroup=metric&key=${API_KEY}&contentType=json`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hideLoading();
        return data;
    } catch (error) {
        hideLoading();
        console.error('Error fetching weather data:', error);
        alert('Gagal mengambil data cuaca. Pastikan lokasi valid atau coba lagi nanti.');
        return null;
    }
}

// Load and display weather data
async function loadWeatherData(location) {
    const weatherData = await getWeatherData(location);
    if (weatherData) {
        displayWeatherData(weatherData);
    }
}

// Display weather data
function displayWeatherData(data) {
    if (!data || !data.currentConditions) {
        alert('Data cuaca tidak tersedia atau format tidak sesuai');
        return;
    }

    currentLocation = data.resolvedAddress;

    // Current weather
    const currentConditions = data.currentConditions;
    const date = new Date(currentConditions.datetimeEpoch * 1000);

    locationElement.textContent = data.resolvedAddress;
    dateElement.textContent = date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    tempElement.textContent = Math.round(currentConditions.temp);
    conditionsElement.textContent = currentConditions.conditions.toLowerCase();
    windElement.textContent = `${Math.round(currentConditions.windspeed)} km/jam`;
    humidityElement.textContent = `${Math.round(currentConditions.humidity)}`;
    precipElement.textContent = `${Math.round(currentConditions.precipprob)}`;

    // Set weather icon
    setWeatherIcon(weatherIconElement, currentConditions.icon);

    // Hourly forecast (24 hours)
    hourlyContainer.innerHTML = '';

    // Get today's hours and next day's hours
    const hours = [...data.days[0].hours];
    if (data.days[1]) {
        hours.push(...data.days[1].hours);
    }

    // Find current hour index
    const now = new Date();
    const currentHour = now.getHours();

    // Display next 24 hours
    for (let i = 0; i < 24; i++) {
        const hourIndex = (currentHour + i) % hours.length;
        const hourData = hours[hourIndex];

        const hourItem = document.createElement('div');
        hourItem.className = 'hour-item';

        const time = document.createElement('div');
        time.className = 'time';
        time.textContent = `${hourData.datetime.split(':')[0]}:00`;

        const icon = document.createElement('div');
        icon.className = 'icon';
        setWeatherIcon(icon, hourData.icon);

        const temp = document.createElement('div');
        temp.className = 'temp';
        temp.textContent = `${Math.round(hourData.temp)}°`;

        hourItem.appendChild(time);
        hourItem.appendChild(icon);
        hourItem.appendChild(temp);

        hourlyContainer.appendChild(hourItem);
    }

    // Show the weather container
    currentWeatherElement.style.display = 'block';
}

// Set weather icon based on condition
function setWeatherIcon(element, condition) {
    const iconMap = {
        'clear-day': 'fas fa-sun',
        'clear-night': 'fas fa-moon',
        'rain': 'fas fa-cloud-rain',
        'snow': 'fas fa-snowflake',
        'sleet': 'fas fa-cloud-meatball',
        'wind': 'fas fa-wind',
        'fog': 'fas fa-smog',
        'cloudy': 'fas fa-cloud',
        'partly-cloudy-day': 'fas fa-cloud-sun',
        'partly-cloudy-night': 'fas fa-cloud-moon',
        'thunder-rain': 'fas fa-bolt',
        'thunder-showers-day': 'fas fa-bolt',
        'thunder-showers-night': 'fas fa-bolt',
        'showers-day': 'fas fa-cloud-sun-rain',
        'showers-night': 'fas fa-cloud-moon-rain'
    };

    const defaultIcon = 'fas fa-question';
    const iconClass = iconMap[condition] || defaultIcon;

    element.innerHTML = `<i class="${iconClass}"></i>`;
}

// Search weather by location
async function searchWeather() {
    const location = locationInput.value.trim();
    if (!location) {
        alert('Silakan masukkan lokasi');
        return;
    }

    await loadWeatherData(location);
}

// Refresh current weather
async function refreshWeather() {
    if (!currentLocation) {
        alert('Tidak ada lokasi yang sedang ditampilkan');
        return;
    }

    await loadWeatherData(currentLocation);
}

// Get weather for current location
async function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        alert('Geolokasi tidak didukung oleh browser Anda');
        loadWeatherData(currentLocation); // Fallback to default
        return;
    }

    showLoading();

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const location = `${latitude},${longitude}`;
        await loadWeatherData(location);
        locationInput.value = location;
    } catch (error) {
        console.error('Error getting location:', error);
        alert('Gagal mendapatkan lokasi saat ini. Menggunakan lokasi default.');
        await loadWeatherData(currentLocation);
    } finally {
        hideLoading();
    }
}

// Show loading animation
function showLoading() {
    currentWeatherElement.style.display = 'none';
    loadingElement.style.display = 'block';
}

// Hide loading animation
function hideLoading() {
    loadingElement.style.display = 'none';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);