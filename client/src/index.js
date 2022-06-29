import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {ApolloClient,  HttpLink } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { ApolloLink, from, operationName } from '@apollo/client';
import trackerGraphQL from '@openreplay/tracker-graphql';
import {init} from './tracker/index'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


const {graphqlTracker} = init({
  plugins: { 
    graphqlTracker: trackerGraphQL
  }
})

/**
 * Sanitize the result from a GraphQL operation
 * @returns Returns the result object but with the sanitized fields changed.
 */
function sanitizeResult(res) {
  //deep clonning needs to happen to make sure this only affects the new object and not
  //the original object.
  let sanitized = JSON.parse(JSON.stringify(res))

  let ops = Object.keys(sanitized.data)
  ops.forEach( o => {
    if(Array.isArray(sanitized.data[o])) { //mutations don't really return arrays
      sanitized.data[o] = sanitized.data[o].map( sanitizeData )
    }
  })
  return sanitized
}

// We only want to hide the content of othe "email" field for now.
function sanitizeData(vars) {
  let newVars = {...vars}
  if(newVars.email) {
    newVars.email = "****@***.***"
  }
  return newVars
}

const trackerApolloLink = new ApolloLink((operation, forward) => {

  const operationDefinition = operation.query.definitions[0];
  let {operationName, variables} = operation
  const {kind, operation: op} = operationDefinition
  const opKind = kind === 'OperationDefinition' ? op : 'unknown?'

  let trackedVariables = sanitizeData({...variables})
  let results = forward(operation).map((result) => {
    let trackedResults = sanitizeResult(result)
    graphqlTracker(opKind, operationName, trackedVariables, trackedResults);
    return result //we have to return the original "result" object here, not the sanitized one
  });
  if(results.length === 0) { //if there are no results, then we've not tracked anything so far...
    graphqlTracker(opKind, operationName, trackedVariables, {});
  }
  return results
});

const link = from([
  trackerApolloLink,
  new HttpLink({uri: () => 'http://localhost:4000/graphql'}),
]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

ReactDOM.render(<ApolloProvider client={client}>
  <App />
</ApolloProvider>, document.getElementById('root'));
