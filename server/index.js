const express = require("express");
const axios = require("axios");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const app = express();
const filePath = __dirname + '/public/usage.txt';
const writer = fs.createWriteStream(filePath, {flags:'a'});

app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.post("/api", (req, res) => {
  let requestBody = {
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "messages": req.body.chat
  };
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+process.env.KEY
    }
  };
  axios.post("https://api.openai.com/v1/chat/completions", requestBody, axiosConfig).then(response => {
    gpt_text = response.data.choices[0].message.content;
    let dataOut = {
      time: req.body.time,
      user: req.body.user,
      request: req.body.chat.slice(-1)[0].content,
      response: gpt_text
    }
    writer.write(JSON.stringify(dataOut)+"\n");
    res.json( gpt_text );
  })

})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
