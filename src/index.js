import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
// Client keeps track of all settings
//Keeps track of what end point the api requests come from
//It will keep a cache
const client = new ApolloClient({
  uri: 'https://react-todo-graphql-bk.herokuapp.com/v1/graphql',
  // uri: 'https://react-todo-graphql-brian-kidd.herokuapp.com/v1/graphql',
  cache: new InMemoryCache()
});


// client.query({
//   query: gql`
//   query getTodos {
//     todos {
//       done
//       id
//       text
//     }
//   }
//   `
// }).then(data => console.log(data));

ReactDOM.render(
  //set client equal to the instantiated client
  //Now client can be sent throughout the entire application
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
