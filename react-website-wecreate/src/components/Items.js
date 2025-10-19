import React from 'react';
import { faMarker, faEraser, faBucket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from './Button';

function Items() {
    return (
        <>
        <Button buttonStyle='btn--outline'> Draw <FontAwesomeIcon icon={faMarker}/> </Button>
        <Button buttonStyle='btn--outline'> Erase <FontAwesomeIcon icon={faEraser}/> </Button>
        <Button buttonStyle='btn--outline'> Fill <FontAwesomeIcon icon={faBucket}/> </Button>
        <Button buttonStyle='btn--outline'>SIGN UP</Button>
        </>
    );
}

export default Items;