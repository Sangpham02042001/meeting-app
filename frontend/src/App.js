import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import CreateRoom from "./routes/createRoom";
import Room from "./routes/room";
import Main from './components/MainComponent';
import Login from './components/auth/LoginComponent';
import SignUp from './components/auth/SignUpComponent';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={CreateRoom} />
        <Route path="/room/:roomID" component={Room} />
        {/* <Route exact path="/" component={() => <Main />} /> */}
        <Route exact path="/login" component={() => <Login />} />
        <Route exact path="/signup" component={() => <SignUp />} />
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;