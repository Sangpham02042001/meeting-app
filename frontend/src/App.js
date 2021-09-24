import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from "./routes/home";
import Meeting from "./routes/meeting";
import Login from './components/auth/LoginComponent';
import SignUp from './components/auth/SignUpComponent';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/meeting/:meetingId" component={Meeting} />
        <Route exact path="/login" component={() => <Login />} />
        <Route exact path="/signup" component={() => <SignUp />} />
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;