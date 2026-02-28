chrome.omnibox.onInputEntered.addListener((text) => {
  const shortCode = text.trim();
  const redirectUrl = `http://localhost:4000/${shortCode}`;

  chrome.tabs.update({
    url: redirectUrl
  });
});