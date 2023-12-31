// content.js
randomLine = "";
let lastTimeActivated = 0;
const ONE_DAY_MS_CONTENT = 24 * 60 * 60 * 1000;

document.querySelector("body").style.filter = "blur(5px)";
console.log("Censored");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "removeBlurFilter") {
    // Remove the blur filter from the tab's body
    document.querySelector("body").style.filter = "none";
  }
});

chrome.storage.local.get("isSolved", (result) => {
  if (result.isSolved) {
    document.querySelector("body").style.filter = "none";
  }
});

chrome.storage.local.get("lastActivationTimestamp", (result) => {
  //console.log(result.lastActivationTimestamp);
  lastTimeActivated = result.lastActivationTimestamp;
  //console.log(Date.now()-lastTimeActivated);
  if (Date.now()- lastTimeActivated > ONE_DAY_MS_CONTENT) {

    document.querySelector("body").style.filter = "blur(5px)";
    chrome.storage.local.set({ isSolved: false });

  
  }
});


