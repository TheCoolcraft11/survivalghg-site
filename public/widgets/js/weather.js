(function () {
    const weatherElement = document.getElementById('weatherInfo');
    const weatherIconElement = document.getElementById('weatherIcon');
    const city = 'Leutkirch'

    function fetchWeather() {
        fetch(`/weather?city=${city}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fehler beim Laden der Wetterdaten');
                }
                return response.json();
            })
            .then(data => {
                const temperature = data.temperature;
                const description = data.description;
                const iconUrl = data.iconUrl;

                weatherElement.innerText = `Temperatur: ${temperature}°C, Zustand: ${description}`;
                weatherIconElement.src = iconUrl;
                weatherIconElement.style.display = 'inline';
            })
            .catch(error => {
                weatherElement.innerText = 'Fehler beim Laden der Wetterdaten';
                console.error('Fehler beim Abrufen der Wetterdaten:', error);
            });
    }

    fetchWeather();
})();
