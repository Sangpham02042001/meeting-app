import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Route, Redirect, Link, NavLink } from 'react-router-dom'
import { isAuthenticated } from '../../store/reducers/user'
import Navbar from '../../components/Navbar'
import Loading from "../../components/Loading";

export default function PrivateRoute({ children, ...rest }) {
  const userReducer = useSelector(state => state.userReducer)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!userReducer.loaded) {
      dispatch(isAuthenticated())
    }
  }, [])

  return (
    !userReducer.loaded ? <Loading />
      : <Route
        {...rest}
        render={
          () => (
            userReducer.authenticated ? <>
              <Navbar />
              <div className="layout">
                <div className="list-selection">
                  <div className="user-list-selection">
                    <Link to='/profile'>
                      <button className="btn-user" >
                        <i className="fas fa-user"></i>
                      </button>
                    </Link>
                  </div>
                  <div className="btn-list-selection">
                    <NavLink exact to='/' activeClassName="btn-active">
                      <button className="btn-default" >Home</button>
                    </NavLink>
                  </div>
                  <div className="btn-list-selection">
                    <NavLink to='/friends' activeClassName="btn-active">
                      <button className="btn-default" >Friend</button>
                    </NavLink>
                  </div>
                  <div className="btn-list-selection">
                    <NavLink to='/teams' activeClassName="btn-active">
                      <button className="btn-default"> Team</button>
                    </NavLink>
                  </div>
                  <div className="btn-list-selection">
                    <NavLink to='/setting' activeClassName="btn-active">
                      <button className="btn-default" >Setting</button>
                    </NavLink>
                  </div>
                </div>
                {children}
              </div>
            </> : (
              <Redirect
                to={{
                  pathname: '/login'
                }}
              />
            ))
        }
      />
  )
}
