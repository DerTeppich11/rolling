import React from 'react';
import './App.css';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DiceGame from './DiceGame';
import Options from './Options';
import GroupEdit from './GroupEdit';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>}/>
        <Route path='/diceGame' exact={true} element={<DiceGame/>}/>
        <Route path='/options' exact={true} element={<Options/>}/>
        <Route path='/groups/:id' element={<GroupEdit/>}/>
      </Routes>
    </Router>
  )
}

export default App;
