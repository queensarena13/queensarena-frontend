import { useEffect, useState } from "react";
import { socket } from "./services/socket";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 liga ao socket
    socket.on("live_scores", (data) => {
      setGames(data?.response || []);
      setLoading(false);
    });

    // cleanup (evita bugs)
    return () => {
      socket.off("live_scores");
    };
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚽ Queens Arena PRO LIVE</h1>

      {loading && (
        <p style={styles.loading}>🔄 A carregar jogos em tempo real...</p>
      )}

      {!loading && games.length === 0 && (
        <p style={styles.empty}>Sem jogos ativos no momento</p>
      )}

      <div style={styles.list}>
        {games.map((g) => (
          <div key={g.fixture.id} style={styles.card}>
            <div style={styles.teams}>
              <span>{g.teams.home.name}</span>
              <span style={{ margin: "0 10px" }}>VS</span>
              <span>{g.teams.away.name}</span>
            </div>

            <div style={styles.score}>
              🔴 {g.goals.home} - {g.goals.away}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 UI simples mas profissional
const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial",
    background: "#0b0b0b",
    minHeight: "100vh",
    color: "#fff"
  },
  title: {
    textAlign: "center",
    marginBottom: 20
  },
  loading: {
    textAlign: "center",
    opacity: 0.7
  },
  empty: {
    textAlign: "center",
    opacity: 0.5
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  card: {
    padding: 15,
    borderRadius: 12,
    background: "#1a1a1a",
    border: "1px solid #333"
  },
  teams: {
    display: "flex",
    justifyContent: "center",
    fontSize: 16
  },
  score: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold"
  }
};