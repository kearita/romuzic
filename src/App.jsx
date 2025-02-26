import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import gintama1 from "./assets/gintama1.png";
import gintama2 from "./assets/gintama2.webp";
import NBoe from "./assets/NBoe.gif";

const targetDate = new Date("2025-03-15T00:00:00");

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [songs, setSongs] = useState([]);
  const [lyrics, setLyrics] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [blankedLyrics, setBlankedLyrics] = useState(null);
  const [removedWords, setRemovedWords] = useState({});
  const [userAnswers, setUserAnswers] = useState({});

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = targetDate - now;

      if (timeLeft <= 0) {
        setCountdown("You're there!");
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, []);

  // search Function
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await axios.get(`http://localhost:5000/search?q=${encodeURIComponent(searchTerm)}`);
      console.log("API Response:", response.data);

      if (response.data.response?.hits.length > 0) {
        setSongs(response.data.response.hits);
        setLyrics(null);
        setSelectedSong(null);
      } else {
        setSongs([]);
        setLyrics("No results found.");
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  // fetch lyrics and genrate blanks
  const fetchLyrics = async (song) => {
    setSelectedSong(song);
    setLyrics("Loading lyrics...");
    setSongs([]); // hide search results when clicking a song

    try {
      const response = await axios.get(`http://localhost:5000/lyrics?song_url=${encodeURIComponent(song.result.url)}`);
      const lyricsText = response.data.lyrics || "Lyrics not found.";
      setLyrics(lyricsText);

      generateBlanks(lyricsText, 5); // Pick 5 words
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setLyrics("Failed to load lyrics.");
    }
  };

  // Generate Blanks (for now blanks are answers)
  const generateBlanks = (text, numBlanks) => {
    let words = text.split(" ");
    let blankIndexes = new Set();

    while (blankIndexes.size < numBlanks) {
      let randIndex = Math.floor(Math.random() * words.length);
      let cleanWord = words[randIndex].replace(/[^a-zA-Zăîâșț]/g, ""); // remove punctuation for now

      if (cleanWord.length > 3) {
        blankIndexes.add(randIndex);
      }
    }

    let newRemovedWords = {};
    let newBlankedLyrics = words.map((word, index) => {
      let cleanWord = word.replace(/[^a-zA-Zăîâșț]/g, ""); // remove punctuation for now
      if (blankIndexes.has(index)) {
        newRemovedWords[index] = cleanWord;
        return (
          <span key={index}>
            <input
              type="text"
              className="blank-input"
              data-index={index}
              placeholder={`____ (${cleanWord})`}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => checkAnswer(e, index)}
              style={{
                border: "2px solid white",
                backgroundColor: userAnswers[index] === cleanWord ? "lightgreen" : "white",
                color: userAnswers[index] === cleanWord ? "black" : "black",
                fontWeight: userAnswers[index] === cleanWord ? "bold" : "normal",
              }}
            />{" "}
          </span>
        );
      }
      return word + " ";
    });

    setRemovedWords(newRemovedWords);
    setBlankedLyrics(newBlankedLyrics);
  };

  // input
  const handleInputChange = (e, index) => {
    setUserAnswers((prev) => ({ ...prev, [index]: e.target.value }));
  };

  // check answer Enter
  const checkAnswer = (e, index) => {
    if (e.key === "Enter") {
      if (userAnswers[index] === removedWords[index]) {
        e.target.style.backgroundColor = "lightgreen"; // correct
        e.target.style.color = "black";
      } else {
        e.target.style.backgroundColor = "red"; // incorrect
        e.target.style.color = "white";
      }
    }
  };

  return (
    <div className="app-container">
      <h1>
        <span className="bouncing-note-left">&#9835;</span> Romuzic{" "}
        <span className="bouncing-note-right">&#9835;</span>
      </h1>

      {/* Countdown message */}
      <p className="countdown-message">
        Hi Ștefan! See you in <span className="countdown">{countdown}</span> 💙
      </p>

      {/* Search Bar and images */}
      <div className="search-container">
        <img src={gintama1} alt="Gintama Left" className="search-image" />
        <div className="search-box">
          <input
            type="text"
            placeholder="Type in a Romanian song..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <img src={gintama2} alt="Gintama Right" className="search-image" />
      </div>

      {/* instructional text */}
      <p className="search-instructions">
        🔍 Search format: <strong>Artist - Song Title</strong> (e.g., "Satoshi - Noaptea pe la 3")
      </p>

      {/* display search results */}
      {songs.length > 0 && !lyrics && (
        <div className="results-container">
          <h2>Results:</h2>
          {songs.map((song, index) => (
            <div key={index} className="song-item">
              <p>{song.result.full_title}</p>
              <button onClick={() => fetchLyrics(song)}>View Lyrics</button>
            </div>
          ))}
        </div>
      )}

      {/* Display lyrics */}
      {blankedLyrics && selectedSong && (
        <div className="lyrics-container">
          <h2>{selectedSong.result.full_title}</h2>
          <p>{blankedLyrics}</p>
        </div>
      )}

      {/* GIF */}
      <div className="gif-container">
        <img src={NBoe} alt="Funny GIF" className="gif-style" />
      </div>
    </div>
  );
}

export default App;
