import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import "./App.css";
import React from "react";
import Login from "./components/Login";
import Home from "./components/Home";
import firebase from 'firebase/compat/app';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      setUser(user);
    })
  }, [])

  return (
    <div className="App">
      <header>
        <Container fluid>
          <h1>Steel Division 2 Helper</h1>
        </Container>
      </header>
      {user ? <Home user={user} /> : <Login />}
    </div>
  );
};

export default App;
