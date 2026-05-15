import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://queensarena-backend.onrender.com");

export default function App() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    socket.on("live_scores", (data) => {
      setGames(data?.response || []);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>⚽ Queens Arena LIVE</h1>

      {games.length === 0 ? (
        <p>A aguardar dados...</p>
      ) : (
        games.map((g) => (
          <div key={g.fixture.id} style={{
            margin: 10,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 8
          }}>
            <h3>
              {g.teams.home.name} vs {g.teams.away.name}
            </h3>

            <h2>
              🔴 LIVE: {g.goals.home} - {g.goals.away}
            </h2>
          </div>
        ))
      )}
    </div>
  );
}