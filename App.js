import React, {useState, useEffect} from 'react';
import * as Location from "expo-location";
import {OPEN_WEATHER_MAP_API_KEY} from '@env';
import { StatusBar } from 'expo-status-bar';
import {StyleSheet, ActivityIndicator, ScrollView, Dimensions, Text, TextInput, View, Button} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function CalendarViewWeather({dayData}){
  const [timezone, setTimezone] = useState('0000-00-00 00:00:00');
  const [days, setDays] = useState([]);
  const [weather, setWeather] = useState('');
  const [subWeather, setSubWeather] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    setDays(dayData.dt_txt.substring(8,10));
    setTimezone(dayData.dt_txt);
    setWeather(dayData.weather[0].main);
    setSubWeather(dayData.weather[0].description);
  }, [])

  return (
      <View style={styles.day}>
        <Text style={styles.temp}>{days}</Text>
        <Text style={styles.description}>{weather}</Text>
        <Text>{subWeather}</Text>
        <Text style={styles.timezone}>{timezone}</Text>
      </View>
  );
}

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [country, setCountry] = useState("");
  const [weatherData, setWeatherData] = useState([]);

  const [ok, setOk] = useState(true);

  const getWeatherAPI = async() => {
    const {granted} = await Location.requestForegroundPermissionsAsync()

    if(!granted){
      // 유저가 위치 정보 제공을 허용하지 않은 경우
      setOk(false);
    }

    const {coords:{latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy: 5});
    const location = await Location.reverseGeocodeAsync({latitude, longitude}, {useGoogleMaps: false});
    // console.log(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_MAP_API_KEY}`);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_MAP_API_KEY}`)
    const json = await response.json();

    //it's api key or api error
    if(json.cod === 401){
      alert(json.message)
    }

    setCity(json.city.name)
    setCountry(json.city.country);
    setWeatherData(json.list);
  }

  useEffect(() => {
    getWeatherAPI();
  }, [])

  return (
    <View style={styles.mainContainer}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
        <Text style={styles.countryName}>{country}</Text>
      </View>
      <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weather}
      >
        { weatherData ?
            weatherData.map(
                (day, index) => {return <CalendarViewWeather key={index} dayData={day} />}
            ) : <View style={styles.day}>
              <ActivityIndicator size="large"/>
            </View>
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "orange",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 60,
    fontWeight: "600",
  },
  countryName: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "600",
  },
  weather: {

  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  temp : {
    marginTop: 50,
    fontSize: 178,
  },
  description : {
    marginTop: -30,
    fontSize: 60,
  },
  timezone : {
    fontSize : 16,
    fontWeight: "300",
  },
});