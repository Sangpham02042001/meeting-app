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
        <Route path="/" exact component={Home} /> no la cai may`
        <Route path="/meeting/:meetingId" component={Meeting} />
        <Route exact path="/login" component={() => <Login />} />
        <Route exact path="/signup" component={() => <SignUp />} />
        <Switch>
          {/* <Navbar /> */}
          {/* Private route */}
        </Switch>
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;