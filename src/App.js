import './App.css';
import { useState } from 'react';

function App() {
  // States: Card List, Card Grid, Selected Card
  const [cardList, setCardList] = useState("");
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Calling Scryfall API for cards
  const fetchCards = async () => {
    // Use regex and a map to handle different pasting formats.
    const cardNames = cardList.split(/\r?\n/).map(name => name.trim()).filter(Boolean);
    const fetchedCards = [];

    for (let name of cardNames) {
      try {
        const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
        const cardData = await response.json();
        fetchedCards.push(cardData);
      } catch (e) {
        console.error(`Error fetching card: ${name}`, e);
      }
    }
    setCards(fetchedCards)
  };

  return (
    <div className="app">
      <div id="headline_container">
        <h1>Magic: The Gathering Card Viewer</h1>
        <h3>Interactive card viewing experience by Luis Sanchez.</h3>
      </div>
      <div className="controls">
        <textarea
          className="card-input"
          placeholder="Paste decklist or card names here..."
          value={cardList}
          onChange={(e) => setCardList(e.target.value)}
        ></textarea>
        <button className="fetch-button" onClick={fetchCards}>Fetch Cards</button>
      </div>
      <div className="card-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="card-container"
            onClick={() => setSelectedCard(card)}
          >
            <img
              className="card-image"
              src={card.image_uris?.front || card.image_uris?.normal}
              alt={card.name}
            />
          </div>
        ))}
      </div>
      {selectedCard && (
        <div className="card-modal" onClick={() => setSelectedCard(null)}>
          <div
            className="modal-content"
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseLeave={() => resetCardPosition()}
          >
            <img
              className="modal-card-image"
              src={selectedCard.image_uris?.front || selectedCard.image_uris?.normal}
              alt={selectedCard.name}
            />
          </div>
        </div>
      )}
    </div>
  );

  function handleMouseMove(e) {
    const card = document.querySelector('.modal-card-image');
    const { clientX, clientY } = e;
    const { width, height, left, top } = card.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    card.style.transform = `rotateX(${y * -20}deg) rotateY(${x * 20}deg)`;
    card.style.background = `linear-gradient(${x * 100 + 50}deg, rgba(255,255,255,0.7), rgba(0,0,0,0.5))`;
  }

  function resetCardPosition() {
    const card = document.querySelector('.modal-card-image');
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    card.style.background = "";
  }
}

export default App;
