import { useEffect, useRef, useState } from "react";

export function useWebSocket(
  url: string,
  onMessage: (data: any) => void,
  retryDelay = 5000,
  maxRetries = 5
) {
  const [status, setStatus] = useState("⏳ Conectando...");
  const [retries, setRetries] = useState(0);
  const retriesRef = useRef(0); // 🔑 contador real
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    setStatus("⏳ Conectando...");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("🟢 Conectado");
      setRetries(0);
      retriesRef.current = 0; // reset contador
      console.log("✅ WebSocket conectado");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("❌ Error parseando mensaje WS:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("⚠️ Error WS:", err);
      setStatus("🔴 Error de conexión");
    };

    ws.onclose = () => {
      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        setRetries(retriesRef.current); // actualizar visible
        setStatus(`⚪ Reintentando... (${retriesRef.current}/${maxRetries})`);
        retryRef.current = setTimeout(connect, retryDelay);
      } else {
        setStatus("❌ Sin conexión. Toque 'Reintentar'");
      }
    };
  };

  const manualReconnect = () => {
    retriesRef.current = 0;
    setRetries(0);
    connect();
  };

  useEffect(() => {
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [url]);

  return { status, retries, manualReconnect };
}
