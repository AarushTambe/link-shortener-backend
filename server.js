// require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const { createUrl, getLongUrl, getAllUrl, shortCodeExists, longCodeExists, getShortUrl } = require("./urlModel");

const app = express();
app.use(express.json());

const PORT = 4000;

function generateShortCode() {
  return crypto.randomBytes(3).toString("hex"); // 6 chars
}

const cors = require("cors");
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

/* CREATE SHORT LINK */
app.post("/shorten", async (req, res) => {
  try {
    const { longUrl, shortUrl } = req.body;

   console.log(longUrl)
   console.log(shortUrl)

    // 🔵 STEP 1: Check if long URL already exists
    var shortCode = await getShortUrl(longUrl);
    console.log(shortCode)
    if(shortCode){
      return res.json({
        shortUrl: `http://localhost:4000/${shortCode}`,
        reused: true
      });
    }
    
    customCode = shortUrl
    // 🔵 STEP 2: Validate short code
    if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
      return res.status(400).json({
        error: "Short link can contain only letters, numbers, _ and -"
      });
    }

    // 🔵 STEP 3: Check short code uniqueness
    const taken = await shortCodeExists(customCode);
    if (taken) {
      return res.status(409).json({
        error: "Short link already taken"
      });
    }

    // 🔵 STEP 4: Create mapping
    await createUrl(customCode, longUrl);

    res.json({
      shortUrl: `http://localhost:4000/${customCode}`,
      reused: false
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* ---------- READ ALL URL ---------- */
app.get("/allurl", async (req, res) => {
  try {
    const result = await getAllUrl();
    console.log(result)
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
    
  }
});

/* REDIRECT */
app.get("/:shortCode", async (req, res) => {
  console.log("called short code......"+req.params.shortCode)
  try {
    longUrl = await getLongUrl(req.params.shortCode);
    console.log("longUrl-> " + longUrl)
    if (!longUrl) return res.status(404).send("Short link not found");

    //ensure protocol exists
    if (!longUrl.startsWith("http://") && !longUrl.startsWith("https://")) {
      longUrl = "https://" + longUrl;
    }

    console.log("Going t redirect to -> " + longUrl)
    res.redirect(longUrl);
    console.log("done!!")
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});