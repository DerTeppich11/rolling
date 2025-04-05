import React from 'react';
import './App.css';
import AppNavbar from './AppNavbar';
import { Link } from 'react-router-dom';
import { Button, Container } from 'reactstrap';

const Home = () => {
  return (
    <div>
      <AppNavbar/>
      <Container fluid>
        <Button color="link"><Link to="/diceGame">Start Game</Link></Button>
      </Container>
      <Container fluid>
        <Button color="link"><Link to="/options">Options</Link></Button>
      </Container>
      <Container fluid>
        <Button color="link"><Link to="/groups">Statistics</Link></Button>
      </Container>
    </div>
  );
}

export default Home;