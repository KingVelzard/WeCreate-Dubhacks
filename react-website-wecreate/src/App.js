import React from 'react';
import Home from './components/pages/Home';
import Paint from './components/pages/Paint';
import Information from './components/pages/Information';
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
        <Route path='/generate' exact Component={Paint}/>
        <Route path='/information' exact Component={Information}/>
      </Routes>
      </Router>
    </>
  );
}

export default App;
