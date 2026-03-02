/* 
  Entry point for the Link Shortener backend.
  Exposes APIs to create custom short links and
  redirect short links to original URLs.
*/
 require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const { createUrl, getLongUrl, getAllUrl, shortCodeExists, longCodeExists, getShortUrl, deletelink } = require("./urlModel");

const app = express();
app.use(express.json());
const path = require("path");
const PORT = 4000;

function generateShortCode() {
  return crypto.randomBytes(3).toString("hex");
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "linkshortnerfrontend.html"));
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

    //  STEP 1: Validate short code format
    customCode = shortUrl.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
      return res.status(400).json({
        error: "Short link can contain only letters, numbers, _ and -"
      });
    }

    //  STEP 2: Check short code uniqueness
    const taken = await shortCodeExists(customCode);
    if (taken) {
      return res.status(409).json({
        error: "This shortcode is already taken. Please choose another one."
      });
    }

    //  STEP 3:  Always create a new mapping
    await createUrl(customCode, longUrl);

    res.json({
      shortUrl: `/${customCode}`,
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
  try {
    longUrl = await getLongUrl(req.params.shortCode);
    if (!longUrl) return res.status(404).send("Short link not found");

    //ensure protocol exists
    if (!longUrl.startsWith("http://") && !longUrl.startsWith("https://")) {
      longUrl = "https://" + longUrl;
    }

    res.redirect(longUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

/*
  DELETE short link (password protected)
*/
  app.delete("/delete/:shortCode", async (req, res) => {

  try {
    const { password } = req.body;
con
    if (!process.env.DELETE_PASSWORD) {
      return res.status(500).json({
        error: "Server misconfiguration"
  });
}
    // Password required
    if (!password) {
      return res.status(401).json({
        error: "Password required to delete link"
      });
    }

    //  Password validation
    if (password !== process.env.DELETE_PASSWORD) {
      return res.status(403).json({
        error: "Invalid password"
      });
    }

    //  Delete logic (unchanged)
    const deleted = await deletelink(req.params.shortCode);
    if (!deleted) {
      return res.status(404).json({
        error: "Short link not found"
      });
    }

    //  Success
    res.json({
      message: "Short link deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});