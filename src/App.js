import './App.css';

function App() {
  // States: Card List, Card Grid, Selected Card
  const [cardList, setCardList] = useState("");
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  // Calling Scryfall API for cards
  const fetchCards = async () => {
    // Use regex and a map to handle different pasting formats.
    const cardNames = cardList.split(/\r?\n/).map(name => name.trim()).filter(Boolean);
  }

  return (
    <div>
    </div>
  );
}

export default App;
