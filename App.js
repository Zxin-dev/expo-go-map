import React, { useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { useChannel, configureAbly } from "@ably-labs/react-hooks";
configureAbly({
  key: "xmO0bg.v_-3Ig:v4CCUVvtROL_Pxnpo4XD1UqmEtIM5m8PlF1ozE24Uro",
  clientId: Date.now() + "",
});
export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const MapRef = useRef();
  console.log(location);
  const [channel] = useChannel(`gps-tracking`, (message) => {
    console.log({ message });
  });
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      Location.watchPositionAsync({}, (location) => {
        setLocation(location);
        MapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.01,
          },
          500
        );
        channel.publish(`message`, location);
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        mapType="hybrid"
        showsTraffic
        ref={MapRef}
        provider="google"
        style={styles.map}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          >
            <View
              style={{
                borderColor: "red",
                padding: 10,
                borderRadius: 100,
                borderWidth: 2,
              }}
            >
              <Text>me</Text>
            </View>
          </Marker>
        )}
      </MapView>
      <Pressable
        onPress={() => {
          MapRef.current.animateToRegion(
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.0005,
            },
            500
          );
        }}
      >
        <View
          style={{
            position: "absolute",
            width: 70,
            height: 50,
            bottom: 15,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            right: 15,
            borderWidth: 1,
          }}
        >
          <Text>jump</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
