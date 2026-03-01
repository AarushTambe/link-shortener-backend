/* 
  Entry point for the Link Shortener backend.
  Exposes APIs to create custom short links and
  redirect short links to original URLs.
*/
// require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const { createUrl, getLongUrl, getAllUrl, shortCodeExists, longCodeExists, getShortUrl } = require("./urlModel");

const app = express();
app.use(express.json());
const path = require("path");
const PORT = 4000;

function generateShortCode() {
  return crypto.randomBytes(3).toString("hex"); // 6 chars
}

/*
  Enable CORS so the frontend and Chrome extension
  can communicate with this backend from any origin.
*/
const cors = require("cors");
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

/* 
  Creates a custom short link provided by the user.
  Enforces:
   - shortcode uniqueness
   - one-to-one mapping between short and long URLs
*/
app.post("/shorten", async (req, res) => {
  try {
    const { longUrl, shortUrl } = req.body;

   console.log(longUrl)
   console.log(shortUrl)

    // STEP 1: Check if long URL already exists
    var shortCode = await getShortUrl(longUrl);
    console.log(shortCode)
    if(shortCode){
      return res.json({
        shortUrl: `http://localhost:4000/${shortCode}`,
        reused: true
      });
    }
    
    //  STEP 2: Validate short code
    customCode = shortUrl
    if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
      return res.status(400).json({
        error: "Short link can contain only letters, numbers, _ and -"
      });
    }

    //  STEP 3: Check short code uniqueness
    const taken = await shortCodeExists(customCode);
    if (taken) {
      return res.status(409).json({
        error: "Short link already taken"
      });
    }

    //  STEP 4: Create mapping
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


/* 
  Reterives all the links
*/
app.get("/allurl", async (req, res) => {
  try {
    const result = await getAllUrl();
    console.log(result)
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
    
  }
});

/*
  GET shortcode
  Resolves a shortcode and performs an HTTP redirect
  to the original long URL.
 */
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "linkshortner.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});