import React from 'react';
import Container from '@material-ui/core/Container';

import SystemInventoryGrid from '../Components/SystemInventoryGrid';

export default function SystemInventory(props) {
  return (
    <div>
      <Container>
        <SystemInventoryGrid></SystemInventoryGrid>
      </Container>
    </div>
  );
}
