import { useEffect, useMemo, useState } from "react";
import { socket } from "./services/socket";
import "./App.css";

const MODALIDADES = [
  { id: "futebol", label: "Futebol", icon: "⚽", keywords: ["football", "soccer", "futebol"] },
  { id: "futsal", label: "Futsal", icon: "◉", keywords: ["futsal"] },
  { id: "basquetebol", label: "Basquetebol", icon: "🏀", keywords: ["basketball", "basquetebol"] },
  { id: "andebol", label: "Andebol", icon: "◌", keywords: ["handball", "andebol"] },
  { id: "voleibol", label: "Voleibol", icon: "✦", keywords: ["volleyball", "voleibol"] }
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
  ].map(normalizarTexto).filter(Boolean);

  const encontrada = MODALIDADES.find((modalidade) =>
    campos.some((campo) => modalidade.keywords.some((keyword) => campo.includes(keyword)))
  );

  return encontrada?.id || (campos.length === 0 ? "futebol" : "outra");
}

function obterEstadoJogo(jogo) {
  const estado = jogo?.fixture?.status?.short || jogo?.status?.short || "";
  const elapsed = jogo?.fixture?.status?.elapsed;

  if (["1H", "2H", "ET", "P", "LIVE"].includes(estado)) {
    return elapsed ? `${elapsed}'` : "Ao vivo";
  }
  if (["HT"].includes(estado)) return "Intervalo";
  if (["FT", "AET", "PEN"].includes(estado)) return "Finalizado";
  if (["NS", "TBD"].includes(estado)) return "Por começar";
  return estado || "Em direto";
}

function nomeEquipa(equipa, fallback) {
  return equipa?.name || equipa?.shortName || fallback;
}

export default function App() {
  const [jogos, setJogos] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [modalidadeAtiva, setModalidadeAtiva] = useState("futebol");
  const [ligacao, setLigacao] = useState("a ligar");
  const [erro, setErro] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  useEffect(() => {
    function receberResultados(data) {
      setJogos(Array.isArray(data?.response) ? data.response : []);
      setACarregar(false);
      setErro("");
      setLigacao("online");
      setUltimaAtualizacao(new Date());
    }

    function quandoConecta() {
      setLigacao("online");
      setErro("");
    }

    function quandoDesliga() {
      setLigacao("offline");
    }

    function quandoFalha() {
      setLigacao("offline");
      setACarregar(false);
      setErro("Não foi possível ligar ao serviço de resultados.");
    }

    socket.on("live_scores", receberResultados);
    socket.on("connect", quandoConecta);
    socket.on("disconnect", quandoDesliga);
    socket.on("connect_error", quandoFalha);
    socket.connect();

    return () => {
      socket.off("live_scores", receberResultados);
      socket.off("connect", quandoConecta);
      socket.off("disconnect", quandoDesliga);
      socket.off("connect_error", quandoFalha);
    };
  }, []);

  const jogosFiltrados = useMemo(
    () => jogos.filter((jogo) => obterModalidade(jogo) === modalidadeAtiva),
    [jogos, modalidadeAtiva]
  );

  const modalidadeSelecionada = MODALIDADES.find((modalidade) => modalidade.id === modalidadeAtiva);

  function atualizarResultados() {
    setACarregar(true);
    setErro("");
    socket.connect();
  }

  return (
    <main className="app-shell">
      <div className="app-content">
        <header className="hero">
          <div className="brand-row">
            <div className="brand-mark" aria-hidden="true">QA</div>
            <div>
              <p className="eyebrow">Queens Arena</p>
              <p className="brand-caption">O teu centro de resultados</p>
            </div>
            <div className={`connection-status connection-${ligacao}`} aria-label={`Estado da ligação: ${ligacao}`}>
              <span className="connection-dot" />
              <span>{ligacao === "online" ? "Online" : ligacao === "a ligar" ? "A ligar" : "Offline"}</span>
            </div>
          </div>
          <div className="hero-copy">
            <p className="kicker">RESULTADOS EM DIRETO</p>
            <h1>Vê o jogo.<br /><span>Vive o momento.</span></h1>
            <p className="hero-description">Acompanha os resultados das tuas modalidades favoritas, em tempo real e num só lugar.</p>
          </div>
        </header>

        <section className="toolbar" aria-label="Filtros de resultados">
          <div>
            <p className="section-label">Modalidades</p>
            <nav className="tabs" aria-label="Escolher modalidade">
              {MODALIDADES.map((modalidade) => {
                const ativa = modalidade.id === modalidadeAtiva;
                return (
                  <button
                    key={modalidade.id}
                    type="button"
                    onClick={() => setModalidadeAtiva(modalidade.id)}
                    className={`tab ${ativa ? "tab-active" : ""}`}
                    aria-pressed={ativa}
                  >
                    <span aria-hidden="true">{modalidade.icon}</span>
                    {modalidade.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <button type="button" className="refresh-button" onClick={atualizarResultados} disabled={aCarregar}>
            <span aria-hidden="true" className={aCarregar ? "spin" : ""}>↻</span>
            Atualizar
          </button>
        </section>

        <section className="results-heading" aria-live="polite">
          <div>
            <p className="section-label">Agora</p>
            <h2>{modalidadeSelecionada?.label || "Resultados"}</h2>
          </div>
          <div className="results-meta">
            <span className="match-count">{jogosFiltrados.length} {jogosFiltrados.length === 1 ? "jogo" : "jogos"}</span>
            {ultimaAtualizacao && <span>Atualizado às {ultimaAtualizacao.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
        </section>

        {aCarregar && (
          <div className="state-card" role="status">
            <div className="loader" aria-hidden="true" />
            <div><strong>A procurar resultados</strong><p>A informação mais recente está a chegar.</p></div>
          </div>
        )}

        {!aCarregar && erro && (
          <div className="state-card state-error" role="alert">
            <span className="state-icon" aria-hidden="true">!</span>
            <div><strong>{erro}</strong><p>Verifica a ligação e tenta novamente.</p></div>
            <button type="button" className="retry-button" onClick={atualizarResultados}>Tentar novamente</button>
          </div>
        )}

        {!aCarregar && !erro && jogosFiltrados.length === 0 && (
          <div className="state-card empty-state">
            <span className="state-icon" aria-hidden="true">◌</span>
            <div><strong>Sem jogos neste momento</strong><p>Não encontrámos jogos de {modalidadeSelecionada?.label || "esta modalidade"} em direto.</p></div>
          </div>
        )}

        <section className="matches-list" aria-label={`Jogos de ${modalidadeSelecionada?.label || "esta modalidade"}`}>
          {jogosFiltrados.map((jogo, index) => {
            const id = jogo.fixture?.id || `${jogo.teams?.home?.name}-${jogo.teams?.away?.name}-${index}`;
            const estado = obterEstadoJogo(jogo);
            return (
              <article key={id} className="match-card">
                <div className="match-topline">
                  <span className="league-name">{jogo.league?.name || "Competição"}</span>
                  <span className={`match-status ${estado === "Finalizado" ? "status-finished" : ""}`}><span className="live-dot" />{estado}</span>
                </div>
                <div className="teams-row">
                  <div className="team team-home"><span>{nomeEquipa(jogo.teams?.home, "Equipa da casa")}</span><small>Casa</small></div>
                  <div className="score"><strong>{jogo.goals?.home ?? 0}</strong><span>:</span><strong>{jogo.goals?.away ?? 0}</strong></div>
                  <div className="team team-away"><span>{nomeEquipa(jogo.teams?.away, "Equipa visitante")}</span><small>Fora</small></div>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="app-footer">Dados atualizados automaticamente <span aria-hidden="true">•</span> Queens Arena</footer>
      </div>
    </main>
  );
}
