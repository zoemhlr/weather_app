<template>
  <div class="p-4">
    <div class="max-w-lg mx-auto">
      <h1 class="font-roboto text-gray-600 text-3xl text-center mb-4">My Weather Assistant</h1>

      <div class="text-2xl text-center mb-4">
        <input
          dir="ltr"
          type="text"
          v-model="city"
          placeholder="Enter your city"
          class="border border-gray-600 rounded-lg px-4 py-2 w-2/3 mb-2"
        />
        <button @click="citySearch" dir="rtl" class="bg-blue-500 text-white rounded-lg px-4 py-2">
          Search
        </button>
      </div>

      <div>
        <div v-if="weatherData" class="text-center text-white mb-3 p-4 bg-blue-300 border rounded-lg">
          <h2 class="text-xl font-semibold">{{ weatherData.name }}, {{ weatherData.sys.country }}</h2>
          <div class="flex justify-center items-center my-2 flex-col">
            <img :src="iconUrl" alt="Weather Icon" class="w-16 h-16 border bg-blue-300 rounded-full mr-4"/>
            <p class="text-lg">{{ temperature }} °C</p>
          </div>
          <span class="text-lg">{{ weatherData.weather[0].description }}</span>
        </div>
        <div v-else class="text-center text-gray-500">Loading...</div>

        <div class="font-roboto text-gray-600 text-2xl text-center mb-4">Clothing recommandations:</div>

        <div class="chat-container mt-4 p-4 border rounded-lg bg-white">
          <div class="chat-log h-64 overflow-y-scroll p-2 bg-gray-100 rounded-lg">
            <div v-for="(message, index) in chatLog" :key="index" class="mb-2">
              <div :class="{'text-right': message.user, 'text-left': !message.user}">
                <span :class="{'m-8 bg-blue-500 text-white p-2 rounded-lg': message.user, 'text-md rounded-lg': !message.user}">
                  {{ message.text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { generateOutfitSuggestion } from "./mistralService.js";

const apiKey = "feff206daa60b539abe8fae8f2ab7f29";

export default {
  name: "App",
  data() {
    return {
      city: "",
      weatherData: null,
      hourlyForecast: [],
      dailyForecast: [],
      chatLog: [],
      userInput: "",
    };
  },
  computed: {
    temperature() {
      return this.weatherData ? Math.floor(this.weatherData.main.temp - 273) : null;
    },
    iconUrl() {
      return this.weatherData ? `http://api.openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png` : null;
    },
  },
  mounted() {
    this.fetchCurrentLocationWeather();
  },
  methods: {
    async fetchCurrentLocationWeather() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
          await this.fetchWeatherData(url);
        });
      }
    },
    async fetchWeatherData(url) {
      try {
        const res = await axios.get(url);
        this.weatherData = res.data;
        await this.fetchForecast(this.weatherData.name);
        this.generateOutfitSuggestion();
      } catch (error) {
        console.error("Oops! Something went wrong when fetching weather data.", error);
      }
    },
    async fetchForecast(city) {
      const urlcast = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
      try {
        const res = await axios.get(urlcast);
        const forecast = res.data;
        this.hourForecast(forecast);
        this.dayForecast(forecast);
      } catch (error) {
        console.error("Oops! Something went wrong when fetching forecast data.", error);
      }
    },
    async citySearch() {
      if (!this.city) return;
      try {
        const urlsearch = `http://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${apiKey}`;
        const res = await axios.get(urlsearch);
        this.weatherData = res.data;
        await this.fetchForecast(this.weatherData.name);
        this.generateOutfitSuggestion();
      } catch (error) {
        console.error("Oops! Something went wrong when fetching weather data.", error);
      }
      this.city = "";
    },
    hourForecast(forecast) {
      this.hourlyForecast = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(forecast.list[i].dt * 1000);
        this.hourlyForecast.push({
          time: date.toLocaleTimeString(undefined, "Asia/Kolkata").replace(":00", ""),
          temp_max: Math.floor(forecast.list[i].main.temp_max - 273),
          temp_min: Math.floor(forecast.list[i].main.temp_min - 273),
          description: forecast.list[i].weather[0].description,
        });
      }
    },
    dayForecast(forecast) {
      this.dailyForecast = [];
      for (let i = 8; i < forecast.list.length; i += 8) {
        const date = new Date(forecast.list[i].dt * 1000);
        this.dailyForecast.push({
          date: date.toDateString(undefined, "Asia/Kolkata"),
          temp_max: Math.floor(forecast.list[i].main.temp_max - 273),
          temp_min: Math.floor(forecast.list[i].main.temp_min - 273),
          description: forecast.list[i].weather[0].description,
        });
      }
    },
    async generateOutfitSuggestion() {
      if (!this.weatherData) return;

      try {
        const aiMessage = await generateOutfitSuggestion(`Weather: ${this.weatherData.weather[0].description}. Recommend clothing.`);
        this.chatLog.push({ text: aiMessage, user: false });
      } catch (error) {
        console.error("Oops! Something went wrong when communicating with the AI.", error);
        this.chatLog.push({
          text: "Sorry, I couldn't generate a response at the moment.",
          user: false,
        });
      }
    },
  },
};
</script>

<style scoped>
</style>
