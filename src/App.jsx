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

  // Countdown Timer
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

  // Search Function
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

  // Fetch Lyrics and Hide Search Results
  const fetchLyrics = async (song) => {
    setSelectedSong(song);
    setLyrics("Loading lyrics...");
    setSongs([]); // Hide search results when clicking a song

    try {
      const response = await axios.get(`http://localhost:5000/lyrics?song_url=${encodeURIComponent(song.result.url)}`);
      setLyrics(response.data.lyrics || "Lyrics not found.");
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setLyrics("Failed to load lyrics.");
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

      {/* Search Bar + Images */}
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

      {/* Instructional Text */}
<p className="search-instructions">
  🔍 Search format: <strong>Artist - Song Title</strong> (e.g., "Satoshi - Noaptea pe la 3")
</p>

      {/* Display search results (only if no lyrics are displayed) */}
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

      {/* Display lyrics (Only if a song is selected) */}
      {lyrics && selectedSong && (
        <div className="lyrics-container">
          <h2>{selectedSong.result.full_title}</h2>
          <pre className="lyrics-text">{lyrics}</pre>
        </div>
      )}

      {/* GIF at bottom */}
      <div className="gif-container">
        <img src={NBoe} alt="Funny GIF" className="gif-style" />
      </div>
    </div>
  );
}

export default App;
