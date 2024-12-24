const { default: axios } = require("axios");

exports.getWeatherData = async (req, res) => {
    const city = req.query.city;
    const units = req.query.units;
    const lang = req.query.lang;
    if (!city) {
        return res.status(400).send({ error: 'City is required' });
    }

    const apiKey = process.env.WEATHER_API;
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&lang=${lang}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}&lang=${lang}`;

    try {

        const currentWeatherResponse = await axios.get(currentWeatherUrl);
        const currentWeather = currentWeatherResponse.data;

        const temperature = currentWeather.main.temp;
        const description = currentWeather.weather[0].description;
        const iconCode = currentWeather.weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@4x.png`;

        const forecastResponse = await axios.get(forecastUrl);
        const forecastData = forecastResponse.data.list.slice(0, 5);

        const forecast = forecastData.map(item => {
            const time = item.dt_txt;
            const temp = item.main.temp;
            const description = item.weather[0].description;
            const iconCode = item.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

            return {
                time,
                temperature: temp,
                description,
                iconUrl
            };
        });

        res.json({
            currentWeather: {
                temperature,
                description,
                iconUrl
            },
            forecast
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send({ error: 'Error fetching weather data' });
    }
}