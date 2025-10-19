import React from 'react'
import '../App.css';
import { Button } from './Button';
import './InfoSection.css';

function InfoSection() {
  return (
    <div className='info-container'>
        <h1>Creativity and Connection</h1>
        <p>Bringing together Child-like wonder and Artificial Intelligence</p>
        <div className='info-btns'>
            <Button className='btns' 
            buttonStyle='btn--outline' 
            buttonSize='btn--large'>
            Find your passion through discovery, creativity, and fun!
            </Button>
            <Button 
            className='btns' 
            buttonStyle='btn--primary' 
            buttonSize='btn--large'>Let's Create!
            </Button>
        </div>
    </div>
  )
}

export default InfoSection
