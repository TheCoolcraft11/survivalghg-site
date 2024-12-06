(function () {
    const weatherElement = document.getElementById('weatherInfo');
    const weatherIconElement = document.getElementById('weatherIcon');
    const forecastContainer = document.getElementById('forecastContainer');
    const city = 'Leutkirch';
    const units = 'metric';
    const lang = 'en';

    function getDayString(index) {
        const today = new Date();
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        let day = new Date(today);
        day.setDate(today.getDate() + index);

        const dayOfWeek = daysOfWeek[day.getDay()];

        if (index === 0) {
            return "Today";
        } else if (index === 1) {
            return "Tomorrow";
        } else {
            return dayOfWeek;
        }
    }

    function getDayNumber(index) {
        const today = new Date();
        let day = new Date(today);
        day.setDate(today.getDate() + index);

        const dayNumber = day.getDate();
        return dayNumber < 10 ? '0' + dayNumber : dayNumber;
    }

    function fetchWeather() {
        fetch(`/weather?city=${city}&units=${units}&lang=${lang}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load weather');
                }
                return response.json();
            })
            .then(data => {
                const currentTemperature = data.currentWeather.temperature;
                const currentDescription = data.currentWeather.description;
                const currentIconUrl = data.currentWeather.iconUrl;

                weatherElement.innerText = `${currentTemperature}°C, ${currentDescription}`;
                weatherIconElement.src = currentIconUrl;
                weatherIconElement.style.display = 'inline';

                forecastContainer.innerHTML = '<h3>5-Day-Forecast:</h3>';

                data.forecast.forEach((forecast, index) => {
                    const forecastItem = document.createElement('div');
                    forecastItem.classList.add('forecast-item');

                    const dayString = getDayString(index);
                    const dayNumber = getDayNumber(index);

                    forecastItem.innerHTML = `
                        <div class="timeline-point">${dayNumber}</div>
                        <div class="forecast-details">
                             <p>${dayString}</p>
                            <img src="${forecast.iconUrl}" alt="Weather Icon" />
                            <span>${forecast.temperature}°C, ${forecast.description}</span>
                        </div>
                    `;

                    forecastContainer.appendChild(forecastItem);
                });
            })
            .catch(error => {
                weatherElement.innerText = 'Failed to load weather';
                console.error('Failed to load weather: ', error);
            });
    }

    fetchWeather();
})();
