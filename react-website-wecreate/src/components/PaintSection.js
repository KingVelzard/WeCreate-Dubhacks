import React from 'react'
import '../App.css';
import { Button } from './Button';
import './PaintSection.css';
import Tools from './Tools';

function PaintSection() {
  return (
    <div className='paint-container'>
        <h1>CREATIVITY AWAITS</h1>
        <p>Anything that you can think of!</p>
        <div className='main-paint-btns'>
            <Button className='btns' 
            buttonStyle='btn--outline' 
            buttonSize='btn--large'>
            Lets Draw
            </Button>
            <Button 
            className='btns' 
            buttonStyle='btn--outline' 
            buttonSize='btn--medium'>Explore your Imagination
            </Button>
        </div>
        <div>
            <Tools/>
        </div>
    </div>
  )
}

export default PaintSection