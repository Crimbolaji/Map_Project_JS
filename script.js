// Selectors
const countriesContainer = document.querySelector('.country-info');
const countryList = document.querySelector('.country-list');
const continentDropdown = document.querySelector('.continent-select');
const countryInput = document.querySelector('.country-input');
const resetButton = document.querySelector('.btn_reset');

// Map Variables
let map;
let marker;

// Initialize the map
const initializeMap = () => {
    map = L.map('map').setView([0, 0], 2);
    addTileLayer();
};

const addTileLayer = () => {
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
};

// Display error message
const renderError = (msg) => {
    countriesContainer.insertAdjacentText('beforeend', msg);
    countriesContainer.style.opacity = 1;
  };

// Enable/Disable input fields
const toggleInputs = (isDisabled) => {
    countryInput.disabled = isDisabled;
    continentDropdown.disabled = isDisabled;
};

// Render Country Information
const renderCountry = (country) => {
    countriesContainer.innerHTML = '';
    const html = `
        <img id="country-flag" src="${country.flags.svg}">

        <p><strong>Name:</strong><span id="country-name"></span>${country.name.common}</p>

        <p><strong>Currency 💰:</strong> <span id="country-currency"></span>${Object.values(country.currencies)[0].name}</p>
        
        <p><strong>Population 👫:</strong> <span id="country-population"></span>${(+country.population / 1000000).toFixed(1)} People</p>

        <p><strong>Language(s) 🗣️:</strong> <span id="country-language"></span>${Object.values(country.languages).join(", ")}</p>

        <p><strong>Region:</strong> <span id="country-region"></span>${country.region}</p>          
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
  showResetButton();
  toggleInputs(true);
};

// Display country on map
const displayOnMap = (regionCoords, country) => {
    map.setView(regionCoords, 5);
    addTileLayer();

    if(marker) map.removeLayer(marker);
    marker = L.marker(regionCoords).addTo(map).bindPopup(`${country.name.common}, ${country.capital}`).openPopup();
};

// Show reset button
const showResetButton = () => {
    resetButton.style.display = 'block';
};

// Render country list item
const countryNamesAndflag = (country) => {
    const regionCoords = country.latlng;
    const listItemHtml = `
        <div class="mark-up">
            <li>${country.name.common}</li>
            <li><img src="${country.flags.png}" data-lat="${regionCoords}"></li>
        </div>
    `;
    countryList.insertAdjacentHTML('beforeend', listItemHtml);
    countryList.style.opacity = 1;
    showResetButton();
    toggleInputs(true);

    const imgElement = countryList.querySelector(`img[src="${country.flags.png}"]`);

    imgElement.addEventListener('click', () => {
        displayOnMap(regionCoords, country);
        renderCountry(country); 
        countryList.innerHTML = ''; 
    })
};

// Fetch country data
const fetchCountryData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Country not found ${response.status}`);
        const data = await response.json();
        return data;
    } catch (err) {
        renderError(`Something went wrong 💥💥 ${err.message}. Try again!`);
    }
    showResetButton();
    toggleInputs(true);
};

// Get country by name
const getCountry = async (countryName) => {
    const data = await fetchCountryData(`https://restcountries.com/v3.1/name/${countryName}`);
    
    if (data) {
        const country = data[0];
        displayOnMap(country.latlng, country);
        renderCountry(country);
    }
    countryInput.value = '';
};

// Get countries by region
const getRegion = async (region) => {
    const data = await fetchCountryData(`https://restcountries.com/v3.1/region/${region}`);

    if (data)
        data.forEach(country => countryNamesAndflag(country));
};

// Event Listeners
continentDropdown.addEventListener('change', function () {
    countryList.innerHTML = '';
    const item = this.value;
    if (item) getRegion(item.toLowerCase()), countriesContainer.innerHTML = ''; 
});

countryInput.addEventListener('keydown', (event) => {
    const enteredCountry = countryInput.value.toLowerCase().trim();
    if (event.key === 'Enter') getCountry(enteredCountry);
    countryList.innerHTML = '';
});

resetButton.addEventListener('click', () => {
    location.reload();
});

// Initialize map on window load
window.onload = initializeMap;