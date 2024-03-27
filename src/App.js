import './master.css';
import { useState, useEffect } from 'react';
import axios from "axios";
import { useTranslation } from 'react-i18next';
//ICONS
import Sun from './img/sun.png';
import CloudIco from './img/cloud.png';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from '@fortawesome/free-solid-svg-icons';
//MUI
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
//TIME
import moment from 'moment';
import "moment/min/locales";
//REDUX
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeather } from './weatherApiSlice';


const theme = createTheme({
  typography: {
    fontFamily: ["IBM"],
  },
});

let cancelAxios = null;
moment.locale("en");

function App() {
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => {
    return state.weatherApi.isLoading
  })
  const temp = useSelector((state) => {
    return state.weatherApi.weather
  })

  const { t, i18n } = useTranslation();
  const [selectedValue, setSelectedValue] = useState(localStorage.getItem('lastSelectedCountry') || 'Egypt');
  const [language, setLanguage] = useState("en")
  const direction = language === "ar" ? "rtl" : "ltr"
  const [countries, setCountries] = useState([]);

  //! Countres Name
  useEffect(() => {
    axios.get('https://restcountries.com/v3.1/all')
      .then(response => {
        const countryNames = response.data.map(country => country.name.common);
        setCountries(countryNames);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
        alert('Error fetching countries');
      });
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("coordinates");
    let defaultLat = 30.033333;
    let defaultLon = 31.233334;
    let defaultCountry = "Egypt";

    if (storedData) {
      const { lat, lon, country } = JSON.parse(storedData);
      dispatch(fetchWeather({ lat, lon }));
    } else {
      axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${selectedValue}&key=cf07c0a198774c8da2d00f308cf79dfb`)
        .then(response => {
          const results = response.data.results;
          if (results.length > 0) {
            const lat = results[0].geometry.lat;
            const lon = results[0].geometry.lng;
            dispatch(fetchWeather({ lat, lon }));
            localStorage.setItem("coordinates", JSON.stringify({ lat, lon, country: selectedValue }));
          } else {
            alert('Location not found');
          }
        })
        .catch(error => {
          console.error('Error fetching coordinates:', error);
          alert('Error fetching coordinates');
        });
    }
  }, [selectedValue, dispatch]);

  useEffect(() => {
    localStorage.setItem('lastSelectedCountry', selectedValue);
  }, [selectedValue]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    if (cancelAxios) {
      cancelAxios();
    }

    axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: newValue,
        key: 'cf07c0a198774c8da2d00f308cf79dfb' // Replace 'YOUR_API_KEY' with your actual API key
      },
      cancelToken: new axios.CancelToken((c) => {
        cancelAxios = c; // Store the cancel function for the current request
      })
    })
    .then(response => {
      const results = response.data.results;
      if (results.length > 0) {
        const lat = results[0].geometry.lat;
        const lon = results[0].geometry.lng;
        dispatch(fetchWeather({ lat, lon }));
        localStorage.setItem("coordinates", JSON.stringify({ lat, lon, country: newValue }));
      } else {
        alert('Location not found');
      }
    })
    .catch(error => {
      console.error('Error fetching coordinates:', error);
      alert('Error fetching coordinates');
    });
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
  }

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
                  {isLoading ? 
                    <CircularProgress style={{color: "white", marginTop: "50px"}}/> 
                    :
                    <h1>{temp.number < 10 && temp.number > 0 ? `0${temp.number}`: temp.number} <img src={temp.icon} /></h1>
                  }
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
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {},
                      '&.MuiSelect-outlined': {
                        borderTop: '0px !important',
                      },
                      '&.MuiInputBase-root': {
                        padding: '0px 0px 0 0 !important',
                      },
                      '&.MuiInputBase-root div': {
                        padding: '4px 22px 0 22px !important',
                      },
                      '&#demo-simple-select': {
                        padding: '5px 22px 10px 0 !important',
                      },
                      '&.MuiButtonBase-root': {
                        maxHeight: 'calc(100% - 32px) !important',
                        background: 'red !important'
                      },
                      '.MuiSvgIcon-root ': {
                        color: '#fff1f1 !important',
                        height: '30px !important',
                        right:' -10px !important',
                        top: '38% !important',
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
                    {countries.map(country => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
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

