import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import './Chat.css';

class App extends Component {
  
  state = {
    textAreaInput: "",
    chat: [],
  };

  getUserParam = () => {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get("user");
  }

  callBackendAPI = async () => {
    var postData = {
      time: Date.now(),
      chat: this.state.chat,
      user: this.getUserParam()
    };
    
    let axiosConfig = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.post('api', postData, axiosConfig)

    if (response.status !== 200) {
      throw Error(response);
    }
    console.log(response);
    return response;
  }

  sendMessage = () => {
    this.showLoading();
    this.callBackendAPI()
      .then(res => this.setState({ chat: [...this.state.chat, {"role": "assistant", "content": res.data}]}, this.createGPTChatBubble(res.data)))
      .catch(err => this.handleError(err));
  }

  handleTryAgain = (e) => {
    console.log("try again clicked");
    e.target.remove();
    this.sendMessage();
  }

  handleError = (err) => {
    console.log(err);
    this.createErrorBubble();
  }

  handleEnterKeyDown = () => {
    let textInput = this.state.textAreaInput;
    if (textInput !== ""){
      this.setState({ chat: [...this.state.chat, {"role": "user", "content": textInput}]}, this.sendMessage);
      this.createUserChatBubble(textInput);
      this.setState({ textAreaInput: ""});
    }
  }

  handleTextAreaChange = (event) => {
    this.setState({ textAreaInput: event.target.value});
  }

  handleKeyDown = (event) => {
    if(event.key === 'Enter'){
      event.preventDefault();
      this.handleEnterKeyDown();
    }
  }

  hideLoading() {
    let loadingBubble = document.getElementById("loadingBubble");
    loadingBubble.remove();
  }

  showLoading() {
    let threadDiv = document.getElementById("thread");
    let loadingBubble = document.createElement("div");
    loadingBubble.id = "loadingBubble";
    loadingBubble.classList.add("message");
    loadingBubble.classList.add("loading");
    loadingBubble.innerText = "Thinking...";
    threadDiv.appendChild(loadingBubble);
    loadingBubble.scrollIntoView({behavior: 'smooth'});
  }

  createErrorBubble() {
    this.hideLoading();
    let threadDiv = document.getElementById("thread");
    let errorBubble = document.createElement("div");
    errorBubble.classList.add("message");
    errorBubble.classList.add("error");
    errorBubble.innerText = "Something went wrong... click here to try again";
    errorBubble.onclick = this.handleTryAgain;
    threadDiv.appendChild(errorBubble);  
    errorBubble.scrollIntoView({behavior: 'smooth'});
  }

  createGPTChatBubble(gptInput) {
    this.hideLoading();
    let threadDiv = document.getElementById("thread");
    let gptChatBubble = document.createElement("div");
    gptChatBubble.classList.add("message");
    gptChatBubble.classList.add("from-chatbot");
    gptChatBubble.innerText = gptInput;
    threadDiv.appendChild(gptChatBubble);  
    gptChatBubble.scrollIntoView({behavior: 'smooth'});
  }

  createUserChatBubble(userInput) {
    let threadDiv = document.getElementById("thread");
    let userChatBubble = document.createElement("div");
    userChatBubble.classList.add("message");
    userChatBubble.classList.add("from-user");
    userChatBubble.innerText = userInput;
    threadDiv.appendChild(userChatBubble);  
    userChatBubble.scrollIntoView({behavior: 'smooth'});
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2 className="App-title">ChatGPT Clone</h2>
          <div id="thread" className="chat-container"/>
          <div className="textarea-container">
            <textarea
              id="chat-textarea"
              className="chat-textarea"
              rows = "3"
              placeholder='Send a message'
              value={this.state.textAreaInput}
              onChange={this.handleTextAreaChange}
              onKeyDown={this.handleKeyDown}
            />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
