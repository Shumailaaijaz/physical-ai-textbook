(function () {
  const API_URL =
    document.currentScript.getAttribute("data-api") ||
    "https://YOUR-HF-SPACE.hf.space/chat";

  /* ---------- Styles ---------- */
  const style = document.createElement("style");
  style.innerHTML = `
    #chatbot-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #111;
      color: #fff;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      cursor: pointer;
      font-size: 22px;
      border: none;
      z-index: 9999;
    }
    #chatbot-box {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 320px;
      height: 420px;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 8px;
      display: none;
      flex-direction: column;
      z-index: 9999;
      font-family: sans-serif;
    }
    #chatbot-messages {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      font-size: 14px;
    }
    #chatbot-input {
      display: flex;
      border-top: 1px solid #ccc;
    }
    #chatbot-input input {
      flex: 1;
      padding: 8px;
      border: none;
      outline: none;
    }
    #chatbot-input button {
      padding: 8px 12px;
      border: none;
      background: #111;
      color: #fff;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  /* ---------- HTML ---------- */
  const btn = document.createElement("button");
  btn.id = "chatbot-btn";
  btn.innerText = "💬";

  const box = document.createElement("div");
  box.id = "chatbot-box";
  box.innerHTML = `
    <div id="chatbot-messages"></div>
    <div id="chatbot-input">
      <input type="text" placeholder="Ask about the book..." />
      <button>Send</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(box);

  /* ---------- Logic ---------- */
  btn.onclick = () => {
    box.style.display = box.style.display === "none" ? "flex" : "none";
  };

  const input = box.querySelector("input");
  const sendBtn = box.querySelector("button");
  const messages = box.querySelector("#chatbot-messages");

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.onclick = async () => {
    const query = input.value.trim();
    if (!query) return;

    addMessage(query, "You");
    input.value = "";
    addMessage("Thinking...", "Bot");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      messages.lastChild.remove();
      addMessage(data.answer || "No response", "Bot");
    } catch (err) {
      messages.lastChild.remove();
      addMessage("Error connecting to server", "Bot");
    }
  };
})();
