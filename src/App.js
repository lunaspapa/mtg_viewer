import './App.css';
import flow from './images/Flow 1.gif'
import { useState } from 'react';

function App() {
  // States: Card List, Card Grid, Selected Card
  const [cardList, setCardList] = useState("");
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  // Printings
  const [printings, setPrintings] = useState([]);
  const [selectedPrinting, setSelectedPrinting] = useState(null);
  // Loading
  const [cardsLoading, setCardsLoading] = useState(false);
  // Flipping Modal Cards
  const [showBackFace, setShowBackFace] = useState(false);

  // More Robust List Pasting with a Parser
  const parseCardList = (list) => {
    // console.log("LIST:: ", list.split(/\n/))
    const parsed = list.split(/\n/).map(line => {
      return line
        .replace(/^(\d+)?x?\s*/i, '') // Handle '4x [Card Name]'
        .replace(/\s*\[.*\]$/, '') // Remove Set info in brackets
        .replace(/\s*#.*$/, '') // Remove comments starting with '#'
        .replace(/^\/\/.*$/gm, '') // Remove lines starting with '//'
        .trim();
    }).filter(Boolean); // Remove Empty Lines
    console.log(parsed)
    return parsed;
  }

  // Calling Scryfall API for cards
  const fetchCards = async () => {
    // Use regex and a map to handle different pasting formats.
    const cardNames = parseCardList(cardList)
    const fetchedCards = [];

    for (let name of cardNames) {
      try {
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`);
        const cardData = await response.json();
        fetchedCards.push(cardData);
      } catch (e) {
        console.error(`Error fetching card: ${name}`, e);
      }
    }
    setCards(fetchedCards)
    setCardsLoading(false)
  };

  // Fetch printings for a given card
  const fetchPrintings = async (card) => {
    try {
      const response = await fetch(card.prints_search_uri);
      const data = await response.json();
      setPrintings(data.data);
      setSelectedPrinting(card);
    } catch (e) {
      console.error('Error fetching printings:', e);
    }
  }

  // Update the Card image in the Grid
  const updateCardInGrid = (updatedCard) => {
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
  };

  // Handle old lingering card image in new modal
  const handleCardClick = (card) => {
    setSelectedCard(null);
    setSelectedPrinting(null);
    setShowBackFace(false);
    setTimeout(() => {
      setSelectedCard(card);
      fetchPrintings(card);
    }, 0) // Updating occurs sequentially
  }

  const clearCards = () => {
    setCardList("");
    setCards([]);
  }

  return (
    <div className="app">
      <div id="headline-container">
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
        <button className="controls-button" onClick={() => {
          fetchCards();
          setCardsLoading(true)
        }}>Fetch Cards</button>

        {cards && (
          <button className="controls-button" onClick={clearCards}>Clear Cards</button>
        )}
      </div>
      <>
        {cardsLoading && (
          <div className="loading-blip">
            <img src={flow} alt="loading" />
            <p>Fetching Cards...</p>
          </div>
        )}
        {!cardsLoading && (
          <div className="card-grid">
            {cards.map((card, index) => (
              <div
                key={index}
                className="card-container"
                onClick={() => handleCardClick(card)}
              >
                {card.card_faces ? (
                  <>
                    <img
                      className="card-image"
                      src={card.card_faces[0].image_uris?.normal}
                      alt={card.name}
                    />
                    <span className="double-faced-indicator">⇆</span>
                  </>
                ) : (
                  <img
                    className="card-image"
                    src={card.image_uris?.normal}
                    alt={card.name}
                  />
                )}
                {/* <img
                  className="card-image"
                  src={card.image_uris?.front || card.image_uris?.normal}
                  alt={card.name}
                /> */}
              </div>
            ))}
          </div>
        )}
      </>
      {selectedCard && (
        <div className="card-modal">
          <button
            className="close-button"
            onClick={(e) => {
              setSelectedCard(null)
              e.stopPropagation()
            }}
          >x</button>
          <div
            className="modal-content"
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseLeave={() => {
              setTimeout(() => {
                resetCardPosition()
              }, 500)
            }}
          >
            <img
              className="modal-card-image lighting-effect"
              src={
                selectedCard.card_faces
                  ? selectedCard.card_faces[showBackFace ? 1 : 0]?.image_uris?.normal
                  : selectedPrinting?.image_uris?.normal || selectedCard.image_uris?.normal
              }
              alt={selectedCard.name}
            />
            {selectedCard.card_faces && (
              <button
                className="flip-button"
                onClick={() => setShowBackFace(!showBackFace)}
              >
                Flip Card
              </button>
            )}
            <select
              className="printings-dropdown"
              onChange={(e) => {
                const newPrinting = printings.find(printing => printing.id === e.target.value);
                setSelectedPrinting(newPrinting);
                const updatedCard = { ...selectedCard, image_uris: newPrinting.image_uris };
                updateCardInGrid(updatedCard);
              }}
            >
              {printings.map(printing => (
                <option key={printing.id} value={printing.id}>
                  {printing.set_name} ({printing.collector_number})
                </option>
              ))}
            </select>
          </div>
        </div>
      )
      }
    </div >
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
