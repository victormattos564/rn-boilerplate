import { View } from "react-native";

import styles from "./styles";
import Title from "../../components/Title";
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { useEffect, useState } from "react";
import { AnimatedMapView } from "react-native-maps/lib/MapView";

export default function Localization() {
  const [location, setLocation] = useState(null);

  async function requestPermission() {
    const { granted } = await requestForegroundPermissionsAsync();

    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
      console.log("Localização atual", currentPosition);
      return;
    }
  }

  useEffect(() => {
    requestPermission();
  }, []);
  return (
    <View style={styles.container}>
      <Title title="Localization" />
      <AnimatedMapView style={styles.map} />
    </View>
  );
}
