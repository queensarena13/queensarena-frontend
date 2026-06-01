import { useEffect, useMemo, useState } from "react";
import { socket } from "./services/socket";

const MODALIDADES = [
  { id: "futebol", label: "Futebol", keywords: ["football", "soccer", "futebol"] },
  { id: "futsal", label: "Futsal", keywords: ["futsal"] },
  { id: "basquetebol", label: "Basquetebol", keywords: ["basketball", "basquetebol"] },
  { id: "andebol", label: "Andebol", keywords: ["handball", "andebol"] },
  { id: "voleibol", label: "Voleibol", keywords: ["volleyball", "voleibol"] }
];

function normalizarTexto(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obterModalidade(jogo) {
  const campos = [
    jogo?.sport,
    jogo?.modalidade,
    jogo?.league?.sport,
    jogo?.league?.name,
    jogo?.fixture?.sport,
    jogo?.category
  ]
    .map(normalizarTexto)
    .filter(Boolean);

  const encontrada = MODALIDADES.find((modalidade) =>
    campos.some((campo) =>
      modalidade.keywords.some((keyword) => campo.includes(keyword))
    )
  );

  // A API atual do backend é de futebol. Só usamos futebol como fallback
  // quando o jogo não traz qualquer campo de modalidade.
  return encontrada?.id || (campos.length === 0 ? "futebol" : "outra");
}

export default function App() {
  const [jogos, setJogos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [modalidadeAtiva, setModalidadeAtiva] = useState("futebol");

  useEffect(() => {
    function receberResultados(data) {
      setJogos(Array.isArray(data?.response) ? data.response : []);
      setACarregar(false);
    }

    socket.on("live_scores", receberResultados);

    return () => {
      socket.off("live_scores", receberResultados);
    };
  }, []);

  const jogosFiltrados = useMemo(
    () => jogos.filter((jogo) => obterModalidade(jogo) === modalidadeAtiva),
    [jogos, modalidadeAtiva]
  );

  const modalidadeSelecionada = MODALIDADES.find(
    (modalidade) => modalidade.id === modalidadeAtiva
  );

  return (
    <main style={styles.container}>
      <section style={styles.header}>
        <p style={styles.badge}>Queens Arena</p>
        <h1 style={styles.title}>Resultados em direto</h1>
        <p style={styles.subtitle}>
          Escolhe uma modalidade para veres apenas os jogos dessa categoria.
        </p>
      </section>

      <nav style={styles.tabs} aria-label="Modalidades">
        {MODALIDADES.map((modalidade) => {
          const ativa = modalidade.id === modalidadeAtiva;

          return (
            <button
              key={modalidade.id}
              type="button"
              onClick={() => setModalidadeAtiva(modalidade.id)}
              style={{
                ...styles.tab,
                ...(ativa ? styles.tabAtiva : {})
              }}
              aria-pressed={ativa}
            >
              {modalidade.label}
            </button>
          );
        })}
      </nav>

      {aCarregar && (
        <p style={styles.estado}>A carregar jogos em tempo real...</p>
      )}

      {!aCarregar && jogosFiltrados.length === 0 && (
        <p style={styles.estado}>
          Sem jogos de {modalidadeSelecionada?.label || "esta modalidade"} no
          momento.
        </p>
      )}

      <section style={styles.lista} aria-live="polite">
        {jogosFiltrados.map((jogo) => (
          <article key={jogo.fixture?.id || `${jogo.teams?.home?.name}-${jogo.teams?.away?.name}`} style={styles.cartao}>
            <div style={styles.equipas}>
              <span>{jogo.teams?.home?.name || "Equipa da casa"}</span>
              <span style={styles.separador}>vs</span>
              <span>{jogo.teams?.away?.name || "Equipa visitante"}</span>
            </div>

            <div style={styles.resultado}>
              {jogo.goals?.home ?? 0} - {jogo.goals?.away ?? 0}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    background: "#0b0b0b",
    minHeight: "100vh",
    color: "#fff"
  },
  header: {
    textAlign: "center",
    marginBottom: 24
  },
  badge: {
    margin: 0,
    color: "#f7c948",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: "bold"
  },
  title: {
    margin: "8px 0",
    fontSize: 32
  },
  subtitle: {
    margin: 0,
    opacity: 0.72
  },
  tabs: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 12,
    marginBottom: 18
  },
  tab: {
    border: "1px solid #333",
    background: "#161616",
    color: "#fff",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  tabAtiva: {
    background: "#f7c948",
    borderColor: "#f7c948",
    color: "#111",
    fontWeight: "bold"
  },
  estado: {
    textAlign: "center",
    opacity: 0.72
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  cartao: {
    padding: 16,
    borderRadius: 14,
    background: "#1a1a1a",
    border: "1px solid #333"
  },
  equipas: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    fontSize: 16
  },
  separador: {
    opacity: 0.6,
    textTransform: "uppercase"
  },
  resultado: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold"
  }
};
