import React from 'react';
import Container from '@material-ui/core/Container';

import Login from './Login';
import SystemInventoryGrid from '../Components/SystemInventoryGrid';

export default function SystemInventory(props) {
  const img = new Image();
  const backgroundImage = (img.src = '../img/landing-background.png');

  // uncomment out this when landing page is merged
  function SystemInventoryBackground() {
    return (
      // <div
      //   style={{
      //     backgroundImage: `url(${backgroundImage})`,
      //     width: '99.6vw',
      //     height: '35vh',
      //     position: 'relative',
      //     left: '50%',
      //     right: '50%',
      //     top: '-100px',
      //     marginLeft: '-50vw',
      //     marginRight: '-50vw',
      //     backgroundRepeat: 'no-repeat',
      //     backgroundSize: 'cover',
      //   }}
      // >
      <div
        style={{
          padding: '10em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1>AI System Inventory</h1>
        <div>
          You're one stop shop to see all AI System Inventory in one spot.
        </div>
      </div>
      // </div>
    );
  }

  return (
    <div>
      <SystemInventoryBackground />
      <Login />

      <SystemInventoryGrid></SystemInventoryGrid>
    </div>
  );
}
