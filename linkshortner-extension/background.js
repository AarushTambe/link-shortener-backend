chrome.omnibox.onInputEntered.addListener((text) => {
  const shortCode = text.trim();

  const redirectUrl = `https://linkshortner-xtoy.onrender.com/${shortCode}`;

  chrome.tabs.update({ url: redirectUrl });
});