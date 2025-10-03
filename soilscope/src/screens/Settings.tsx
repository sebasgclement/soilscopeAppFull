import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useFetch } from "../hooks/useFetch";

interface SensorConfig {
  id: number;
  sensor_id: string;
  planta: string;
  sector: string;
}

export default function Configuracion() {
  const [sensorId, setSensorId] = useState("");
  const [planta, setPlanta] = useState("");
  const [sector, setSector] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const { data, loading, error, refetch } = useFetch<SensorConfig[]>(
    "http://192.168.1.50:8000/api/sensores-config/",
    []
  );

  // Crear o editar
  const guardarConfig = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `http://192.168.1.50:8000/api/sensores-config/${editId}/`
      : "http://192.168.1.50:8000/api/sensores-config/";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sensor_id: sensorId, planta, sector }),
    });

    limpiarFormulario();
    refetch();
  };

  const eliminarConfig = async (id: number) => {
    await fetch(`http://192.168.1.50:8000/api/sensores-config/${id}/`, {
      method: "DELETE",
    });
    refetch();
  };

  const cargarEnFormulario = (cfg: SensorConfig) => {
    setSensorId(cfg.sensor_id);
    setPlanta(cfg.planta);
    setSector(cfg.sector);
    setEditId(cfg.id);
  };

  const limpiarFormulario = () => {
    setSensorId("");
    setPlanta("");
    setSector("");
    setEditId(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración de Sensores</Text>

      {/* Formulario */}
      <TextInput placeholder="Sensor ID" value={sensorId} onChangeText={setSensorId} style={styles.input}/>
      <TextInput placeholder="Planta" value={planta} onChangeText={setPlanta} style={styles.input}/>
      <TextInput placeholder="Sector" value={sector} onChangeText={setSector} style={styles.input}/>
      <Button title={editId ? "Actualizar" : "Guardar"} onPress={guardarConfig} />
      {editId && <Button title="Cancelar" color="orange" onPress={limpiarFormulario} />}

      {/* Estados */}
      {loading && <Text>Cargando...</Text>}
      {error && <Text style={{color:"red"}}>{error}</Text>}

      {/* Lista */}
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.item}>
              {item.planta} ({item.sector}) → {item.sensor_id}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => cargarEnFormulario(item)}>
                <Text style={styles.edit}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarConfig(item.id)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 8, marginVertical: 5, borderRadius: 6 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 4 },
  item: { fontSize: 16, flex: 1 },
  actions: { flexDirection: "row", gap: 12 },
  edit: { color: "blue", fontSize: 18 },
  delete: { color: "red", fontSize: 18 },
});
