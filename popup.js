// popup.js
document.addEventListener("DOMContentLoaded", function () {


  let randomLine = "";
  let randomWordChosen = "";
  let counter = 1;

  let lastDateWhenActivated = 0;

  let isSolved = false;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // One day in milliseconds

  const randomWord = document.getElementById("today-word");
  const textBox = document.getElementById("word-box");

  const okButton = document.getElementById("ok");
  const alreadyKnownButton = document.getElementById("already-known");
  const skipButton = document.getElementById("skip");
  const sendButton = document.getElementById("send");

  const allButtons = document.querySelectorAll("button");

  const generateRandomWord = async () => {
    try {
      // Get the URL of the file
      const fileURL = chrome.runtime.getURL("data/data.txt");

      // Fetch the content of the file
      const response = await fetch(fileURL);

      // Check if the fetch was successful
      if (response.ok) {
        // Read the response body as text
        const text = await response.text();
        const lines = text.split("\n");
        //Choses a random line from the list
        const randomIndex = Math.floor(Math.random() * lines.length);
        randomLine = lines[randomIndex];

        const words = randomLine.split("	");
        randomWordChosen = words[1];

        console.log(randomWordChosen);
        console.log(randomLine);
        randomWord.textContent = `Today's word is ${randomLine}`;

        //Setting the word and word meaning so it doesn't refresh every single time
        chrome.storage.local.set({ randomWord: randomWordChosen });
        chrome.storage.local.set({ randomWordMeaning: words[2] });
      } else {
        console.error("Failed to fetch file. Status:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const hasDayPassed = (lastActivationTimestamp) => {
    if (!lastActivationTimestamp) {
      return true; // If no timestamp is found, treat it as a day passed
    }
    const currentTimestamp = Date.now();
    return currentTimestamp - lastActivationTimestamp >= ONE_DAY_MS;
  };

  const getRandomWord = async () => {
    let wordMeaning = "";
    try {
      // Check if a day has passed since the last activation
      chrome.storage.local.get(
        [
          "lastActivationTimestamp",
          "isSolved",
          "randomWord",
          "randomWordMeaning",
        ],
        (result) => {
          if (hasDayPassed(result.lastActivationTimestamp)) {
            // If a day has passed, generate a new word
            generateRandomWord();
            // Update the last activation timestamp
            chrome.storage.local.set({ lastActivationTimestamp: Date.now() });
          } else if (result.isSolved) {
            randomWordChosen = result.randomWord;
            wordMeaning = result.randomWordMeaning || ""; // Use the stored word meaning if available
            randomWord.textContent = `Today's word is ${randomWordChosen} ${wordMeaning}`;
            sendRemoveBlurFilter();
          } else if (result.randomWord) {
            // If a word is stored, use it
            randomWordChosen = result.randomWord;
            wordMeaning = result.randomWordMeaning || ""; // Use the stored word meaning if available
            randomWord.textContent = `Today's word is ${randomWordChosen} ${wordMeaning}`;
          } else {
            // If no word is stored, generate a new one
            generateRandomWord();
          }
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  getRandomWord();

  okButton.addEventListener("click", () => {
    randomWord.textContent = "";
    textBox.style.display = "inline-grid";
    allButtons.forEach((button) => {
      button.style.display = "none";
    });
    sendButton.style.display = "inline-grid";
  });

  textBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendButton.click();
    }
  });

  sendButton.addEventListener("click", () => {
    sendGuess();
  });

  alreadyKnownButton.addEventListener("click", () => {
    generateRandomWord();
  });

  skipButton.addEventListener("click", () => {
    sendRemoveBlurFilter();
  });

  function sendGuess() {
    const miau = textBox.value.trim();
    if (miau === randomWordChosen) {
      randomWord.textContent = `NICE ${10 - counter} left`;
      textBox.value = "";
      counter++;
      if (counter === 11) {
        isSolved = true;
        chrome.storage.local.set({ isSolved: true });
        textBox.style.display = "none";
        randomWord.textContent='Congrats , you did it!'
        sendButton.style.display = "none";
        saveIsSolvedAndTime(isSolved, lastDateWhenActivated);
        sendRemoveBlurFilter();
      }
    } else {
      randomWord.textContent = "WRONG";
    }
  }

  function sendRemoveBlurFilter() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "removeBlurFilter" });
    });
  }

  function saveIsSolvedAndTime(isSolved, lastTimeSolved) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "saveIsSolvedAndTime",
        isSolved: isSolved,
        lastTimeSolved: lastTimeSolved,
      });
    });
  }

  textBox.addEventListener('paste',function(event){
    event.preventDefault();
  })

});
