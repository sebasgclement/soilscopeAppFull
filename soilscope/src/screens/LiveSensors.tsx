import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import SensorCard from "../components/SensorCard";
import { colors } from "../theme/colors";
import { useWebSocket } from "../hooks/useWebSocket";

interface SensorConfig {
  id: number;
  sensor_id: string;
  planta: string;
  sector: string;
}

export default function LiveSensors() {
  const [configs, setConfigs] = useState<SensorConfig[]>([]);
  const [valores, setValores] = useState<Record<string, number>>({});

  // cargar configuraciones al montar
  useEffect(() => {
    const cargarConfigs = async () => {
      try {
        const res = await fetch("http://192.168.1.50:8000/api/sensores-config/");
        const data = await res.json();
        setConfigs(data);
      } catch (err) {
        console.error("❌ Error cargando configs:", err);
      }
    };
    cargarConfigs();
  }, []);

  // usar hook de WebSocket con reintentos limitados
  const { status, manualReconnect } = useWebSocket(
    "ws://192.168.1.50:8000/ws/sensores/",
    (data) => {
      console.log("📡 WS mensaje:", data);
      if (data.sensor_id && data.valor !== undefined) {
        setValores((prev) => ({
          ...prev,
          [data.sensor_id]: data.valor,
        }));
      }
    },
    5000, // retryDelay
    5     // maxRetries
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensores en Vivo</Text>
      <Text style={{ color: status.includes("🟢") ? "lightgreen" : "tomato" }}>
        {status}
      </Text>

      {status.includes("❌") && (
        <Button title="Reintentar" onPress={manualReconnect} />
      )}

      <FlatList
        data={configs}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <SensorCard
            label={item.planta}
            value={valores[item.sensor_id] ?? "--"}
            unit="%"
            color={colors.moisture}
            subtitle={`Sector: ${item.sector}`}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
});
