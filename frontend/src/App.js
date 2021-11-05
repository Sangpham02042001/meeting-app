import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from "./routes/home";
import Teams from "./routes/teams";
import Conversations from "./routes/conversations";
import Setting from "./routes/setting";
import Profile from "./routes/profile";
import TeamDiscover from './routes/teams/discover';
import Login from './components/auth/LoginComponent';
import SignUp from './components/auth/SignUpComponent';
import Welcome from './components/Welcome';
import Meeting from './routes/meeting'
import './App.css'
import PrivateRoute from './routes/private';
import NotFound from './components/NotFound';
import Team from './routes/team';
import TeamSetting from './routes/team/setting';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={() => <Welcome />} />
        <Route exact path="/login" component={() => <Login />} />
        <Route exact path="/signup" component={() => <SignUp />} />
        <PrivateRoute path="/home" >
          <Home />
        </PrivateRoute>
        <PrivateRoute path="/profile">
          <Profile />
        </PrivateRoute>
        <PrivateRoute path="/conversations" >
          <Conversations />
        </PrivateRoute>
        <PrivateRoute path="/teams" >
          <Switch>
            <Route exact path="/teams">
              <Teams />
            </Route>
            <Route path="/teams/discover">
              <TeamDiscover />
            </Route>
            <Route path="/teams/:teamId/setting">
              <TeamSetting />
            </Route>
            <Route exact path="/teams/:teamId">
              <Team />
            </Route>
            <Route path="/teams/:teamId/meeting/:meetingId" component={Meeting} >
            </Route>
            <Route render={() => <Redirect to="/notfound" />}>
            </Route>
          </Switch>
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