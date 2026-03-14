import { useEffect, useState } from "react";
import "./App.css";

const EMOJIS = ["🍍", "🦶", "👃", "🐧", "🐈", "🍪", "☕", "🏸"];

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createDeck() {
  return shuffle(
    [...EMOJIS, ...EMOJIS].map((emoji, index) => ({
      id: `${emoji}-${index}`,
      emoji,
      matched: false,
    }))
  );
}

export default function App() {
  const [cards, setCards] = useState(createDeck());
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [locked, setLocked] = useState(false);
  const [bestScore, setBestScore] = useState(null);

  const totalPairs = EMOJIS.length;

  function restartGame() {
    setCards(createDeck());
    setFlipped([]);
    setMoves(0);
    setMatchedPairs(0);
    setLocked(false);
  }

  useEffect(() => {
    if (matchedPairs === totalPairs) {
      setBestScore((prev) => {
        if (prev === null || moves < prev) return moves;
        return prev;
      });
    }
  }, [matchedPairs, moves, totalPairs]);

  useEffect(() => {
    if (flipped.length !== 2) return;

    const [firstId, secondId] = flipped;
    const firstCard = cards.find((card) => card.id === firstId);
    const secondCard = cards.find((card) => card.id === secondId);

    if (!firstCard || !secondCard) return;

    setLocked(true);

    if (firstCard.emoji === secondCard.emoji) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === firstId || card.id === secondId
            ? { ...card, matched: true }
            : card
        )
      );
      setMatchedPairs((prev) => prev + 1);
      setFlipped([]);
      setLocked(false);
      return;
    }

    const timeout = setTimeout(() => {
      setFlipped([]);
      setLocked(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, [flipped, cards]);

  function handleCardClick(id) {
    if (locked) return;
    if (flipped.includes(id)) return;

    const card = cards.find((item) => item.id === id);
    if (!card || card.matched) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
    }
  }

  const gameWon = matchedPairs === totalPairs;

  return (
    <div className="app">
      <div className="container">
        <div className="top">
          <div className="intro">
            <p className="badge">Memory Card Game</p>
            <h1>Match the cards in as few moves as possible</h1>
            <p className="subtitle">
              Flip two cards at a time and try to find all the matching pairs.
            </p>
          </div>

          <div className="stats">
            <div className="stat-box">
              <p>Moves</p>
              <h2>{moves}</h2>
            </div>
            <div className="stat-box">
              <p>Pairs Found</p>
              <h2>
                {matchedPairs}/{totalPairs}
              </h2>
            </div>
            <div className="stat-box">
              <p>Best Score</p>
              <h2>{bestScore ?? "-"}</h2>
            </div>
          </div>

          <button className="restart-btn" onClick={restartGame}>
            Restart Game
          </button>

          {gameWon && (
            <div className="win-box">
              <h3>You won!</h3>
              <p>You matched every pair in {moves} moves.</p>
            </div>
          )}
        </div>

        <div className="grid">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || card.matched;

            return (
              <button
                key={card.id}
                className={`card ${isFlipped ? "flipped" : ""}`}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="card-inner">
                  <div className="card-front">?</div>
                  <div className="card-back">{card.emoji}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}