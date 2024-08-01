import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ element, ...rest }) => {
  const { auth } = useContext(AuthContext);
  console.log(auth);
  console.log(element);

  return (
    <Route {...rest} element={auth ? element : <Navigate to="/login" />} />
  );
};

export default PrivateRoute;