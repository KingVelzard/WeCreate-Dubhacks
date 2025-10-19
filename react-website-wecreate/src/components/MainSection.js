import React from 'react'
import '../App.css';
import { Button } from './Button';
import './MainSection.css';

function MainSection() {
  return (
    <div className='main-container'>
        <h1>CREATIVITY AWAITS</h1>
        <p>Anything that you can think of!</p>
        <div className='main-btns'>
            <Button className='btns' 
            buttonStyle='btn--outline' 
            buttonSize='btn--large'>
            Get Creative!
            </Button>
            <Button 
            className='btns' 
            buttonStyle='btn--primary' 
            buttonSize='btn--large'>Generate Now!
            </Button>
        </div>
    </div>
  )
}

export default MainSection
