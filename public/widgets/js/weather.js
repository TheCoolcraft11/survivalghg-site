(function () {
    const weatherElement = document.getElementById('weatherInfo');
    const apiKey = 'e5fc7a5689d97b1c13602b6b961f634a';
    const city = 'Leutkirch';

    function fetchWeather() {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=de`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netzwerkproblem: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const temperature = data.main.temp;
                const description = data.weather[0].description;
                weatherElement.innerText = `Temperatur: ${temperature}°C, Zustand: ${description}`;
            })
            .catch(error => {
                weatherElement.innerText = 'Fehler beim Laden der Wetterdaten';
                console.error('Fehler beim Abrufen der Wetterdaten:', error);
            });
    }

    fetchWeather();
})();
