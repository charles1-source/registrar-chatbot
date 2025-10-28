const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express().use(bodyParser.json());
const PORT = process.env.PORT || 3000;

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    body.entry.forEach(entry => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message && event.message.text) {
        const text = event.message.text.toLowerCase();

        let reply = "Hello! 👋 I'm the Registrar’s Office chatbot.";
        if (text.includes("tor")) reply = "To request your TOR, please visit the Registrar’s Office or use our online form.";
        else if (text.includes("enroll")) reply = "Enrollment usually starts every June. You can check our FB page for updates.";
        else if (text.includes("hours")) reply = "Our office hours are Monday to Friday, 8 AM to 5 PM.";
        else if (text.includes("hi") || text.includes("hello")) reply = "Hi there! How can I assist you today?";

        axios.post(
          `https://graph.facebook.com/v17.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
          {
            recipient: { id: senderId },
            message: { text: reply }
          }
        );
      }
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
