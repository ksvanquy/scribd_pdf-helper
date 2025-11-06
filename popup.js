function convertScribdLink(url) {
    const match = url.match(/https:\/\/www\.scribd\.com\/document\/(\d+)/);
    if (match) {
        return `https://www.scribd.com/embeds/${match[1]}/content`;
    } else {
        return null;
    }
}

document.getElementById("openLink").addEventListener("click", () => {
    const inputUrl = document.getElementById("scribdLink").value;
    const embedUrl = convertScribdLink(inputUrl);
    if (embedUrl) {
        chrome.tabs.create({ url: embedUrl });
    } else {
        alert("Invalid Scribd URL");
    }
});

// ---------- Khi nhấn nút ----------
document.getElementById("openLink").addEventListener("click", () => {
    const inputUrl = document.getElementById("scribdLink").value.trim();
    const embedUrl = convertScribdLink(inputUrl);
    openEmbedLink(embedUrl);
});

// ---------- Tự động detect URL Scribd từ tab hiện tại ----------
document.addEventListener("DOMContentLoaded", () => {
    // Lấy tab hiện tại
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;

        const currentTabUrl = tabs[0].url;
        const embedUrl = convertScribdLink(currentTabUrl);

        if (embedUrl) {
            document.getElementById("scribdLink").value = currentTabUrl;
            console.log("Detected Scribd link from current tab:", embedUrl);
        }
    });
});