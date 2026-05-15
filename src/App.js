import React, { useEffect, useState } from "react";

const API_URL = "https://queensarena-backend.onrender.com";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/fixtures`);
        const data = await res.json();
        setGames(data?.response || []);
      } catch (err) {
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>🔥 A carregar Queens Arena...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚽ Queens Arena</h1>

      {games.length === 0 ? (
        <p style={styles.empty}>Sem jogos disponíveis</p>
      ) : (
        games.map((g) => (
          <div key={g.fixture.id} style={styles.card}>
            <div style={styles.match}>
              <span style={styles.team}>{g.teams.home.name}</span>
              <span style={styles.vs}>VS</span>
              <span style={styles.team}>{g.teams.away.name}</span>
            </div>

            <div style={styles.score}>
              {g.goals.home} - {g.goals.away}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b0b0b, #1a1a1a)",
    color: "white",
    padding: 20,
    fontFamily: "Arial",
    textAlign: "center"
  },

  title: {
    fontSize: 28,
    marginBottom: 20
  },

  card: {
    background: "#1f1f1f",
    margin: "10px auto",
    padding: 15,
    borderRadius: 12,
    maxWidth: 400,
    boxShadow: "0 4px 15px rgba(0,0,0,0.4)"
  },

  match: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  team: {
    fontWeight: "bold",
    fontSize: 14
  },

  vs: {
    fontSize: 12,
    opacity: 0.6
  },

  score: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#00ff88"
  },

  empty: {
    opacity: 0.7
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b0b0b",
    color: "white"
  }
};