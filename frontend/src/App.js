import React, { Children, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from "./routes/home";
import Teams from "./routes/teams";
import Friends from "./routes/friends";
import Setting from "./routes/setting";
import Profile from "./routes/profile";
import Meeting from "./routes/meeting";
import Login from './components/auth/LoginComponent';
import SignUp from './components/auth/SignUpComponent';
import './App.css';
import PrivateRoute from './routes/private';
import Welcome from './components/Welcome';
import { isAuthenticated } from './store/reducers/user.reducer'

function App() {
  const userReducer = useSelector(state => state.userReducer)
  const dispatch = useDispatch();
  useEffect(() => {
    if (!userReducer.loaded) {
      dispatch(isAuthenticated())
    }
  }, [])
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/meeting/:meetingId" component={Meeting} />
        {
          !userReducer.authenticated ?
            <Switch>
              < Route exact path="/" component={Welcome} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={() => <SignUp />} />
              <Redirect to='/' />
            </Switch>
            :
            <Switch>
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
              <Redirect to="/" />
            </Switch>
        }
      </Switch>
    </BrowserRouter>
  );
}

export default App;