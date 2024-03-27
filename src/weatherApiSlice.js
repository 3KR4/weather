import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchWeather = createAsyncThunk("status", async (coordinates) => {
  const { lat, lon } = coordinates;
  console.log(lat);
  console.log(lon);
  const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=affeeb15585829dda0d9dc5ad82a7ce6`)

    const responseTemp = Math.round(response.data.main.temp - 272.15);
    const min = Math.round(response.data.main.temp_min - 272.15);
    const max = Math.round(response.data.main.temp_max - 272.15);
    const description = response.data.weather[0].description;
    const responseIcon = response.data.weather[0].icon;

    return {number: responseTemp, min, max, description, icon:`https://openweathermap.org/img/wn/${responseIcon}@2x.png`}
})

export const weatherApiSlice = createSlice({
  name: "weatherApi",
  initialState: {
    result: "empty",
    weather: {},
    isLoading: false,
  },
  reducers: {
    changeResult: (state, action) => {
      state.result = "changed"
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchWeather.pending, (state, action) => {
      state.isLoading = true
    }).addCase(fetchWeather.fulfilled, (state, action) => {
      state.weather = action.payload
      state.isLoading = false
    })
  }
})

export const { changeResult } = weatherApiSlice.actions
export default weatherApiSlice.reducer