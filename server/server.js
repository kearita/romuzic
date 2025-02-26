require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
const PORT = 5000;

const GENIUS_API_KEY = process.env.GENIUS_API_KEY; // load API key

// check if the API key is loaded
console.log("Loaded Genius API Key:", GENIUS_API_KEY ? "Key Loaded" : "Key Missing");

app.get("/search", async (req, res) => {
    const searchTerm = req.query.q;
    try {
        console.log(`Searching Genius API for: ${searchTerm}`);

        const response = await axios.get(`https://api.genius.com/search`, {
            params: { q: searchTerm },
            headers: { Authorization: `Bearer ${GENIUS_API_KEY}` },
        });

        // log full API response
        console.log("API Response:", JSON.stringify(response.data, null, 2));

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching from Genius API:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});



app.get("/lyrics", async (req, res) => {
    const songUrl = req.query.song_url;
    
    if (!songUrl) {
        return res.status(400).json({ error: "Missing song URL" });
    }

    try {
        console.log(`Fetching lyrics from: ${songUrl}`);
        
        const response = await axios.get(songUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(response.data);

        // Genius updated their structure, so we check multiple possible locations
        let lyrics = $("div[data-lyrics-container]").text().trim();

        if (!lyrics) {
            lyrics = $(".lyrics").text().trim(); // older Genius layout fallback
        }

        if (!lyrics) {
            return res.status(404).json({ error: "Lyrics not found." });
        }

        res.json({ lyrics });
    } catch (error) {
        console.error("Error fetching lyrics:", error.message);
        res.status(500).json({ error: "Failed to fetch lyrics" });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
