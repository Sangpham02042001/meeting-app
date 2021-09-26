import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from "./routes/home";
import Teams from "./routes/teams";
import Friends from "./routes/friends";
import Setting from "./routes/setting";
import Profile from "./routes/profile";
import Login from './components/auth/LoginComponent';
import SignUp from './components/auth/SignUpComponent';
import Meeting from './routes/meeting'
import './App.css'
import PrivateRoute from './routes/private';
import NotFound from './components/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/meeting/:meetingId" component={Meeting} />
        <Route exact path="/login" component={() => <Login />} />
        <Route exact path="/signup" component={() => <SignUp />} />
        <PrivateRoute exact path="/" >
          <Home />
        </PrivateRoute>
        <PrivateRoute path="/profile">
          <Profile />
        </PrivateRoute>
        <PrivateRoute path="/friends" >
          <Friends />
        </PrivateRoute>
        <PrivateRoute path="/teams" >
          <Teams />
        </PrivateRoute>
        <PrivateRoute path="/setting" >
          <Setting />
        </PrivateRoute>
        <Route component={() => <NotFound />} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;