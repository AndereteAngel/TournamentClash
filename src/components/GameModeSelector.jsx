const GAME_MODES = [
  {
    value: "Clash Royale 1v1",
    icon: "👑",
    title: "Clash Royale",
    description: "Fantasía y estrategia",
    theme: "theme-clash",
  },
  {
    value: "Fútbol",
    icon: "⚽",
    title: "Fútbol",
    description: "Pasión por la cancha",
    theme: "theme-futbol",
  },
  {
    value: "Ajedrez",
    icon: "♟️",
    title: "Ajedrez",
    description: "Estrategia y precisión",
    theme: "theme-ajedrez",
  },
  {
    value: "Brawl Stars",
    icon: "💥",
    title: "Brawl Stars",
    description: "Acción y competencia",
    theme: "theme-esports",
  },
  {
    value: "EA Sports FC 26",
    icon: "🏟️",
    title: "EA Sports FC 26",
    description: "Fútbol virtual",
    theme: "theme-futbol",
  },
  {
    value: "Valorant",
    icon: "🎯",
    title: "Valorant",
    description: "Competencia táctica",
    theme: "theme-esports",
  },
];

export function GameModeSelector({
  selectedGame,
  onSelect,
  onContinue,
  onCancel,
  cancelLabel = "Volver",
  continueLabel = "Continuar",
  eyebrow = "UNA PLATAFORMA · MUCHAS MODALIDADES",
  description = "Elegí cómo querés competir. La plataforma adaptará su identidad visual a tu modalidad.",
}) {
  return (
    <section className={`game-mode-screen ${selectedGame ? GAME_MODES.find((mode) => mode.value === selectedGame)?.theme || "theme-clash" : "theme-neutral"}`}>
      <header className="game-mode-heading">
        <div className="platform-mark" aria-hidden="true">🏆</div>
        <span className="game-mode-eyebrow">{eyebrow}</span>
        <h1 className="platform-title">Tournament<span>Clash</span></h1>
        <h2 className="game-mode-question">¿Qué querés jugar?</h2>
        <p>{description}</p>
      </header>

      <div className="game-mode-grid">
        {GAME_MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`game-mode-card ${option.theme} ${selectedGame === option.value ? "is-selected" : ""}`}
            aria-pressed={selectedGame === option.value}
            onClick={() => onSelect(option.value)}
          >
            <span className="game-mode-card-icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="game-mode-card-title">{option.title}</span>
            <span className="game-mode-card-description">{option.description}</span>
            <span className="game-mode-card-check">
              {selectedGame === option.value ? "✓ Seleccionado" : "Elegir modalidad"}
            </span>
          </button>
        ))}
      </div>

      <footer className="game-mode-actions">
        {onCancel ? (
          <button type="button" className="game-mode-back" onClick={onCancel}>
            {cancelLabel}
          </button>
        ) : <span />}
        <button
          type="button"
          className="game-mode-continue"
          disabled={!selectedGame}
          onClick={onContinue}
        >
          {continueLabel} →
        </button>
      </footer>
      <p className="game-mode-footnote">Una sola cuenta. Distintas experiencias. La misma comunidad.</p>
    </section>
  );
}
