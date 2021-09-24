import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { isAuthenticated } from '../../store/reducers/user'
import Loading from "../../components/Loading";
import Layout from '../../components/Layout'

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
              <Layout>
                {children}
              </Layout>
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
