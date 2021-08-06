import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from "@chakra-ui/react"
import { theme, ThemeProvider, CSSReset } from "@chakra-ui/react";  

ReactDOM.render(
  <ThemeProvider theme={theme}>  
    <CSSReset />
    <React.StrictMode>  
      <App />  
    </React.StrictMode>  
  </ThemeProvider>,  
  document.getElementById('root')
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
