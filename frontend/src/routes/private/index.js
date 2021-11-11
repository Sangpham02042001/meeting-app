import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Route, Redirect } from 'react-router-dom'
import { isAuthenticated } from '../../store/reducers/user.reducer'
import Loading from "../../components/Loading";
import Layout from '../../components/Layout';
import Welcome from '../../components/Welcome';

export default function PrivateRoute({ children, ...rest }) {
  const userReducer = useSelector(state => state.userReducer);
  const dispatch = useDispatch();
  const childrenWithProps = React.Children.map(children, child => {
    // Checking isValidElement is the safe way and avoids a typescript
    // error too.
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { params: rest.location.pathname });
    }
    return child;
  });
  useEffect(() => {
    if (!userReducer.loaded) {
      dispatch(isAuthenticated())
    }
  }, [])
  return (
    !userReducer.loaded ?
      <Loading />
      :
      <Route
        {...rest}
        render={
          ({ location }) => (
            userReducer.authenticated ?
              <Layout>
                {childrenWithProps}
              </Layout>
              :
              (rest.path === '/' ? <Welcome /> : <Redirect to='/login' />)
          )}
      />
  )
}
