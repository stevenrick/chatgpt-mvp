import React, { Component } from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import './App.css';
import './Chat.css';

class App extends Component {
  
  state = {
    textAreaInput: "",
    chatLog: {},
    chatCount: 0,
    currentChatId: null,
    currentChatThread: []
  };

  getUserParam = () => {
    const queryParams = new URLSearchParams(window.location.search);
    return queryParams.get("user");
  }

  callBackendAPI = async () => {
    var postData = {
      time: Date.now(),
      chat: this.state.currentChatThread,
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
      .then(res => this.setState({ currentChatThread: [...this.state.currentChatThread, {"role": "assistant", "content": res.data}]}, this.createGPTChatBubble(res.data)))
      .then(() => {
        this.setState(prevState => {
          let chatLog = prevState.chatLog
          chatLog[prevState.currentChatId] = prevState.currentChatThread;
          return { chatLog }
        })
        this.hideLoading();
      })
      .catch(err => {
        this.hideLoading();
        this.handleError(err);
      });
  }

  clearThread = () => {
    let thread = document.getElementById("thread");
    while (thread.firstChild) {
      thread.removeChild(thread.firstChild);
    }
    this.setState({ currentChatThread: [] });
  }

  populateThread = () => {
    let chatThread = this.state.chatLog[this.state.currentChatId];
    if (chatThread){
      this.setState({ currentChatThread: chatThread });
      chatThread.forEach(msg => {
        if (msg.role === "user"){
          this.createUserChatBubble(msg.content);
        }
        if (msg.role === "assistant"){
          this.createGPTChatBubble(msg.content);
        }
      });
    }
  }

  resetThread = () => {
    this.clearThread();
    this.populateThread();
  }

  startNewChat = async () => {
    this.setState(prevState => {
      let chatLog = Object.assign({}, prevState.chatLog);
      let currentChatId = uuid();
      chatLog[currentChatId] = [];
      let chatCount = prevState.chatCount + 1;
      return { currentChatId, chatLog, chatCount }
    }, () => {
      this.resetThread();
      this.createNewChatButton();
      this.debug();
    });
  }

  handlePriorChatClick = (e) => {
    let activeChat = document.getElementsByClassName("active");
    if (activeChat.length > 0){
      if (e.target.id !== activeChat[0].id){
        activeChat[0].classList.remove("active");
        e.target.classList.add("active");
        this.setState({ currentChatId: e.target.id }, this.resetThread);
      }
    }
  }

  createNewChatButton = () => {
    let chatHistory = document.getElementById("chat-history");
    let newChatButton = document.createElement("button");
    newChatButton.id = this.state.currentChatId;
    newChatButton.classList.add("priorChatButton");
    newChatButton.classList.add("active");
    newChatButton.innerText = "Chat " + (this.state.chatCount);
    newChatButton.onclick = this.handlePriorChatClick;
    chatHistory.appendChild(newChatButton);
  }

  debug = () => {
    console.log("chatLog",this.state.chatLog);
    console.log("currentChatThread",this.state.currentChatThread);
    console.log("curentChatId", this.state.currentChatId);
  }

  handleNewChatClick = () => {
    let activeChat = document.getElementsByClassName("active");
    if (activeChat.length > 0){
      activeChat[0].classList.remove("active");
    }
    this.startNewChat();
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

  handleEnterKeyDown = async () => {
    let textInput = this.state.textAreaInput;
    if (textInput !== ""){
      if (this.state.currentChatId === null){
        await this.startNewChat();
      }
      this.setState({ currentChatThread: [...this.state.currentChatThread, {"role": "user", "content": textInput}]}, this.sendMessage);
      this.setState({ textAreaInput: ""});
      this.createUserChatBubble(textInput);
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
    if (loadingBubble){
      loadingBubble.remove();
    }
  }

  showLoading() {
    let threadDiv = document.getElementById("thread");
    let loadingBubble = document.createElement("div");
    loadingBubble.id = "loadingBubble";
    loadingBubble.classList.add("message");
    loadingBubble.classList.add("loading");
    loadingBubble.innerText = "Thinking...";
    threadDiv.appendChild(loadingBubble);
    loadingBubble.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
  }

  createErrorBubble() {
    let threadDiv = document.getElementById("thread");
    let errorBubble = document.createElement("div");
    errorBubble.classList.add("message");
    errorBubble.classList.add("error");
    errorBubble.innerText = "Something went wrong... click here to try again";
    errorBubble.onclick = this.handleTryAgain;
    threadDiv.appendChild(errorBubble);  
    errorBubble.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
  }

  createGPTChatBubble(gptInput) {
    let threadDiv = document.getElementById("thread");
    let gptChatBubble = document.createElement("div");
    gptChatBubble.classList.add("message");
    gptChatBubble.classList.add("from-chatbot");
    gptChatBubble.innerText = gptInput;
    threadDiv.appendChild(gptChatBubble);  
    gptChatBubble.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
  }

  createUserChatBubble(userInput) {
    let threadDiv = document.getElementById("thread");
    let userChatBubble = document.createElement("div");
    userChatBubble.classList.add("message");
    userChatBubble.classList.add("from-user");
    userChatBubble.innerText = userInput;
    threadDiv.appendChild(userChatBubble);  
    userChatBubble.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
  }
  
  render() {
    return (
      <div className="App">
        <div id="main-container">
          <div id="sidebar">
            <button
              id="newChatButton"
              onClick={this.handleNewChatClick}
            >+ New Chat</button>
            <div id="chat-history"/>
          </div>
          <div id="chat-container">
            <div id="thread"></div>
            <div id="textarea-container">
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
        </div>
      </div>
    </div>
    );
  }
}

export default App;
