import './master.css';
import Sun from './img/sun.png';
import CloudIco from './img/cloud.png';
import Drop from './img/waterFrop.png';
import { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import moment from 'moment';
import "moment/min/locales";
import Container from '@mui/material/Container';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from '@fortawesome/free-solid-svg-icons';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';


const theme = createTheme({
  typography: {
    fontFamily: ["IBM"],
  },
});

let cancelAxios = null;
moment.locale("en");

function App() {
  const { t, i18n } = useTranslation();
  const [selectedValue, setSelectedValue] = useState('cairo');
  const [language, setLanguage] = useState("en")
	const direction = language == "ar" ? "rtl" : "ltr"

  const [temp, setTemp] = useState({
    number: null,
    description: "",
    min: null,
    max: null,
    icon: null,
  });

	useEffect(() => {
		const interval = setInterval(() => {
			moment().format('dddd, Do MMMM')
		}, 1000);
		return () => clearInterval(interval)
	}, []);

	useEffect(()=>{
		i18n.changeLanguage(language)
	}, [])

  const handleChange = async (event) => {
    setSelectedValue(event.target.value);
    try {
      if (cancelAxios) {
        cancelAxios(); // Cancel the previous request if it exists
      }

      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: event.target.value,
          key: 'cf07c0a198774c8da2d00f308cf79dfb' // Replace 'YOUR_API_KEY' with your actual API key
        },
        cancelToken: new axios.CancelToken((c) => {
          cancelAxios = c; // Store the cancel function for the current request
        })
      });

      const { results } = response.data;
      if (results.length > 0) {
        const lat = results[0].geometry.lat;
        const lon = results[0].geometry.lng;
        fetchWeatherData(lat, lon);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error fetching data:', error);
        alert('Error fetching data');
      }
    }
  };

  function handleLanguageClick(){
    if (language === "en"){
      setLanguage("ar")
      i18n.changeLanguage("ar")
      moment.locale("ar");
    }else{
      setLanguage("en")
      i18n.changeLanguage("en")
      moment.locale("en");
    }
    moment().format("MMMM Do YYYY, h:mm:ss a");
  }



  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=affeeb15585829dda0d9dc5ad82a7ce6`);
      const responseTemp = Math.round(response.data.main.temp - 272.15);
      const min = Math.round(response.data.main.temp_min - 272.15);
      const max = Math.round(response.data.main.temp_max - 272.15);
      const description = response.data.weather[0].description;
      const responseIcon = response.data.weather[0].icon;

      setTemp({
        number: responseTemp,
        description: description,
        min: min,
        max: max,
        icon: `https://openweathermap.org/img/wn/${responseIcon}@2x.png`,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data');
    }
  };

  useEffect(() => {
    // Fetch initial weather data for default location (Cairo)
    fetchWeatherData(30.033333, 31.233334);

    return () => {
      // Cleanup function to cancel the request when the component unmounts
      if (cancelAxios) {
        cancelAxios();
      }
    };
  }, []);

  const day = moment().format('dddd, Do MMMM')

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Container maxWidth="sm">

          <div className='content'>
            <div className='card'>
              <div className='top'>
                <div className='image'>
                  <img src={Sun} className='sun'/>
                  <img src={CloudIco} className='cloud'/>
                  <FontAwesomeIcon icon={faDroplet} className='drop drop1'/>
                  <FontAwesomeIcon icon={faDroplet} className='drop drop2'/>
                  <FontAwesomeIcon icon={faDroplet} className='drop drop3'/>
                </div>

                <div className='time'>
                  <h1>{temp.number} <img src={temp.icon} /></h1>
                  <h2 style={{ minWidth: language === "ar" ? '240px' : 'auto'}}>{t("min")}: {temp.min} | {t("max")}: {temp.max}</h2>
                </div>
              </div>

              <div className='bottom' dir={direction}>
                <div className='info'>
                  <h1>{t(temp.description)}</h1>
                  <h2>{day}</h2>
                </div>
                <FormControl className='select' style={{ width: selectedValue.length > 6  && language === "en" ? '290px' : 'fit-content' }}>
                  <InputLabel id="select-label" style={{ right: language === "en" ? 'auto' : 0, left: language === "en" ? 0 : 'auto' }}>{t("Select a Location")}</InputLabel>
                    <Select  
                    sx={{
                      color: "white",
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent !important',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {

                      },
                      '&.MuiSelect-outlined': {
                        borderTop: '0px !important'
                      },
                      '&.MuiInputBase-root': {
                        padding: '0 !important',
                      },
                      '&#demo-simple-select': {
                        padding: '5px 22px 10px 0 !important',
                      },
                      '.MuiSvgIcon-root ': {
                        color: '#fff1f1 !important',
                        height: '30px !important',
                        right:' -10px !important',
                        top: '30% !important',
                        width: '30px !important',
                      }
                    }}
    
                      style={{
                        color: 'white',
                        textAlign: 'left',
                        padding: '25px 22px',
                        fontSize: '50px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        minHeight: 'auto'
                      }}
                      labelId="select-label"
                      id="demo-simple-select"
                      value={selectedValue}
                      onChange={handleChange}
                    >
                    <MenuItem value="cairo">{t("Cairo")}</MenuItem>
                    <MenuItem value="riyadh">{t("Riyadh")}</MenuItem>
                    <MenuItem value="Kuwait">{t("Kuwait")}</MenuItem>
                    <MenuItem value="Tunis ">{t("Tunis")}</MenuItem>
                    <MenuItem value="Abu Dhabi">{t("Abu Dhabi")}</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            <button onClick={handleLanguageClick}>{language == "en" ? "Arabic" : "إنجليزي"}</button>
          </div>

        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;