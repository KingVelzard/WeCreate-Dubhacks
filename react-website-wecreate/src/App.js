import React from 'react';
import Home from './components/pages/Home';
import Paint from './components/pages/Paint';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';

function App() {
  return (
    <>
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' exact Component={Home}/>
        <Route path='/' exact Component={Paint}/>
      </Routes>
      </Router>
    </>
  );
}

export default App;
