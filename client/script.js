import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    if (element.textContent.length === 3) {
      element.textContent = "";
    } else {
      element.textContent += ".";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random;
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueID) {
  return `
    <div class="wrapper ${isAi ? "ai" : ""}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}" />
        </div>
        <div class="message" id="${uniqueID}">${value}</div>
      </div>
    </div>
  `;
}

// Function to add a chat stripe to chatContainer
function addChatStripe(isAi, value, uniqueID) {
  chatContainer.innerHTML += chatStripe(isAi, value, uniqueID);
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User's chat stripe
  addChatStripe(false, data.get("prompt"));

  form.reset();

  //bot's chatstripe
  const uniqueID = generateUniqueID();
  addChatStripe(true, " ", uniqueID);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Wait for the DOM to be updated
  const messageDiv = document.getElementById(uniqueID);
  loader(messageDiv);

  console.log(messageDiv);
  console.log("before fetch");

  //fetch data from server (get bots response)
  const response = await fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });
  console.log("after fetch");
  console.log(response);

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();
    console.log(parseData);

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});
