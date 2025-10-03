import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors } from "../theme/colors";
import { useFetch } from "../hooks/useFetch";

type SensorType = "humedad" | "ambiente" | "bomba" | "nivel";

interface Registro {
  id: number;
  ts_sensor: string;
  ts_server: string;
  valor?: number;
  temperatura?: number;
  humedad?: number;
  estado?: boolean;
  distancia?: number;
}

const filtros = [
  { label: "24h", from: () => new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { label: "Semana", from: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { label: "Mes", from: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { label: "Todo", from: () => null },
];

export default function History() {
  const [tipo, setTipo] = useState<SensorType>("humedad");
  const [filtro, setFiltro] = useState("24h");

  // construir la URL según filtro
  const f = filtros.find((f) => f.label === filtro)?.from();
  const fromIso = f ? f.toISOString() : null;
  const endpoint = fromIso
    ? `http://192.168.1.50:8000/api/${tipo}/?from=${fromIso}`
    : `http://192.168.1.50:8000/api/${tipo}/`;

  const { data, loading, error, refetch } = useFetch<{ results: Registro[] }>(endpoint, [tipo, filtro]);

  const registros = data?.results || [];

  const renderFila = (item: Registro) => {
    const fecha = new Date(item.ts_server).toLocaleString();
    switch (tipo) {
      case "humedad":
        return (
          <View style={styles.row}>
            <Text style={styles.cell}>{fecha}</Text>
            <Text style={styles.cell}>{item.valor}%</Text>
          </View>
        );
      case "ambiente":
        return (
          <View style={styles.row}>
            <Text style={styles.cell}>{fecha}</Text>
            <Text style={styles.cell}>{item.temperatura}°C</Text>
            <Text style={styles.cell}>{item.humedad}%</Text>
          </View>
        );
      case "bomba":
        return (
          <View style={styles.row}>
            <Text style={styles.cell}>{fecha}</Text>
            <Text style={styles.cell}>{item.estado ? "Encendida" : "Apagada"}</Text>
          </View>
        );
      case "nivel":
        return (
          <View style={styles.row}>
            <Text style={styles.cell}>{fecha}</Text>
            <Text style={styles.cell}>{item.distancia} cm</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Sensores</Text>

      <View style={styles.selector}>
        {["humedad", "ambiente", "bomba", "nivel"].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTipo(t as SensorType)}>
            <Text style={[styles.selectorText, tipo === t && styles.selectorActive]}>
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterBar}>
        {filtros.map((f) => (
          <TouchableOpacity key={f.label} onPress={() => setFiltro(f.label)}>
            <Text style={[styles.filterText, filtro === f.label && styles.filterActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator size="large" color={colors.text} />}
      {error && <Text style={{ color: "tomato" }}>❌ {error}</Text>}

      <FlatList
        data={registros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderFila(item)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 12 },
  selector: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  selectorText: { color: "#aaa", fontSize: 16, fontWeight: "600" },
  selectorActive: { color: colors.text, textDecorationLine: "underline" },
  filterBar: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  filterText: { color: "#aaa", fontSize: 14, fontWeight: "600" },
  filterActive: { color: colors.text, textDecorationLine: "underline" },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#666" },
  cell: { flex: 1, padding: 6, color: colors.text },
});
