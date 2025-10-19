import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { Button } from './Button.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenNib, faXmark, faBars } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);

    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);

    const showButton = () => {
        if(window.innerWidth <= 960) {
            setButton(false);
        } else {
            setButton(true);
        }
    };

    useEffect(() => {
        showButton();
    }, []);

    window.addEventListener('resize', showButton);

    return (
        <>
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className='navbar-logo' onClick={closeMobileMenu}>
                    WeCreate 
                    <FontAwesomeIcon icon={faPenNib} />
                </Link>
                <div FontAwesomeIcon icon onClick={handleClick}>
                    <FontAwesomeIcon icon={click ? faXmark : faBars } />
                </div>
                <ul className={click ? 'nav-menu active' : 'nav-menu'}> 
                    <li className='nav-item'>
                        <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                            Home
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link to='/generate' className='nav-links' onClick={closeMobileMenu}>
                            Generate
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link to='/information' className='nav-links' onClick={closeMobileMenu}>
                            Information
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link to='/sign-up' className='nav-links-mobile' onClick={closeMobileMenu}>
                            Sign Up
                        </Link>
                    </li>
                </ul>
                {button && <Button buttonStyle='btn--outline'>SIGN UP</Button>}
            </div>
        </nav>
    </>
    );
}

export default Navbar;