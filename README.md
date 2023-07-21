# ChatGPT Clone

This is a minimal working example of ChatGPT, outside of (ChatGPT)[https://chat.openai.com/].

In order to conduct human-subjects experiments with generative AI systems, we needed ChatGPT with a sort of psuedo federated access model so we could provision access to ChatGPT while conducting remote and unsupervised experiments.

The client side of this project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

The server side uses an Express application as an API in order to avoid leaking OpenAI access tokens on the client side.

To run the front end alone, `cd client` and `npm start`

To run the backend you first need to be at the root of the project, then build the frontend with `npm run-script build`, finally you can `npm start` to launch the full system.
