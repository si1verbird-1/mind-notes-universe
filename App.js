// App.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [planets, setPlanets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlanetTitle, setNewPlanetTitle] = useState("");
  const [newPlanetImage, setNewPlanetImage] = useState(null);

  useEffect(() => {
    // request permission for image picker
    (async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission needed", "Please allow access to photos to add planet images.");
        }
      } catch (e) {}
    })();

    // load saved planets
    AsyncStorage.getItem("planets").then((data) => {
      if (data) {
        try {
          setPlanets(JSON.parse(data));
        } catch {}
      }
    });
  }, []);

  const openImagePicker = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewPlanetImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log("image picker error", e);
    }
  };

  const addPlanet = () => {
    if (!newPlanetTitle.trim()) {
      Alert.alert("Enter a title", "Please enter a title for the planet.");
      return;
    }
    const newPlanet = {
      id: Date.now().toString(),
      title: newPlanetTitle.trim(),
      image: newPlanetImage,
    };
    const updated = [...planets, newPlanet];
    setPlanets(updated);
    AsyncStorage.setItem("planets", JSON.stringify(updated));
    setNewPlanetTitle("");
    setNewPlanetImage(null);
    setModalVisible(false);
  };

  const deletePlanet = (id) => {
    const updated = planets.filter((p) => p.id !== id);
    setPlanets(updated);
    AsyncStorage.setItem("planets", JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Universe Notes</Text>

      <FlatList
        data={planets}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.planet}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.planetImage} />
            ) : (
              <View style={[styles.planetImage, { backgroundColor: "#88f" }]} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <TouchableOpacity onPress={() => deletePlanet(item.id)} style={styles.deleteBtn}>
              <Text style={{ color: "white", fontSize: 12 }}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addBtnText}>+ Add Planet</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Planet</Text>
            <TextInput
              style={styles.input}
              placeholder="Planet title"
              placeholderTextColor="#bfc9e0"
              value={newPlanetTitle}
              onChangeText={setNewPlanetTitle}
            />
            <TouchableOpacity style={styles.imagePicker} onPress={openImagePicker}>
              <Text style={{ color: "white" }}>{newPlanetImage ? "Change Image" : "Pick Image"}</Text>
            </TouchableOpacity>
            {newPlanetImage && <Image source={{ uri: newPlanetImage }} style={styles.preview} />}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={addPlanet}>
                <Text style={{ color: "white" }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "white" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000814", paddingTop: 50 },
  header: { color: "white", fontSize: 24, textAlign: "center", marginBottom: 10 },
  grid: { padding: 10 },
  planet: {
    margin: 8,
    alignItems: "center",
    width: 90,
    position: "relative",
  },
  planetImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "white",
  },
  title: { color: "white", fontSize: 12, marginTop: 4, textAlign: "center" },
  deleteBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "red",
    borderRadius: 12,
    padding: 4,
  },
  addBtn: {
    backgroundColor: "#1f6feb",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    borderRadius: 8,
  },
  addBtnText: { color: "white", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#0b1220",
    padding: 20,
    borderRadius: 10,
    width: "84%",
  },
  modalTitle: { color: "white", fontSize: 18, marginBottom: 10 },
  input: {
    backgroundColor: "#1c2333",
    color: "white",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  imagePicker: {
    backgroundColor: "#1f6feb",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  preview: { width: 70, height: 70, borderRadius: 35, alignSelf: "center" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: "#1f6feb",
    padding: 10,
    borderRadius: 6,
  },
  cancelBtn: {
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 6,
  },
});
