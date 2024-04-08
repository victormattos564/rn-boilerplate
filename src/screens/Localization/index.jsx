import { View, Text, ActivityIndicator } from "react-native";

import styles from "./styles";
import Title from "../../components/Title";
import { user } from "../../data/Profile";
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, watchPositionAsync, LocationAccuracy } from "expo-location";
import { useState, useEffect, useRef } from "react";
import { AnimatedMapView } from "react-native-maps/lib/MapView";
import { MarkerAnimated } from "react-native-maps";
import { Axios } from "axios";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export default function Localization() {

  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);
  const [errorMsg , setErrorMsg] = useState(null);
  const [weatherData, setWeatherData] = useState(null);



  async function requestPermission() {
    const { granted, status } = await requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setErrorMsg("Permissão negada para acessar a localização");
      console.log("Permissão negada para acessar a localização");
      return;
    }

    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
      getWeather(location.coords.latitude, location.coords.longitude);
      console.log("Localização atual", currentPosition);
      return;
    }
  }


  const getWeather = async (latitude, longitude) => {
    try {
      console.log("Latitude: ", latitude, "Longitude: ", longitude);
      const apiKey = "d2b17491b2a840713b385d9b2fb02057";
      const response = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
      );
      console.log(response.data);
      setWeatherData(response.data);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);


  useEffect(() => {
    watchPositionAsync(
      {
        accuracy: LocationAccuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (response) => {
        setLocation(response);
        console.log("Nova localização", response);
        mapRef.current?.animateCamera({
          center: response.coords,
          pitch: 50,
        });
      }
    );
  }, []);




  return (
    <View style={styles.container}>
      <Title title="Localization" />
      {location && (
        <AnimatedMapView
        ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <MarkerAnimated
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Você está aqui"
            description="Sua localização atual"
          />
        </AnimatedMapView>
      )}

      {weatherData ? (
        <View>
          <Text>Temperatura: {weatherData.current.temp}°C</Text>
          <Text>Umidade: {weatherData.current.humidity}%</Text>
          <Text>Velocidade do vento: {weatherData.current.wind_speed}m/s</Text>
        </View>
      ) : (
        <ActivityIndicator size="large" color="#131313" />
      )}

      {errorMsg && <Text>{errorMsg}</Text>}

    </View>
  );
}