const express = require("express");
const axios = require("axios");
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.post("/api", (req, res) => {
  let requestBody = {
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "messages": req.body
  };
  let axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+process.env.KEY
    }
  };
  axios.post("https://api.openai.com/v1/chat/completions", requestBody, axiosConfig).then(response => {
    gpt_text = response.data.choices[0].message.content;
    res.json( gpt_text );
  })

})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
