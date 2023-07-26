import React, {  } from 'react';
import { Grid } from '@mui/material';
import ListUsers from './components/ListUsers';
import Canvas from './components/Canvas';

const MainLayout: React.FC = () => {
    return (
        <Grid container>
            <Grid 
                item xs={2} 
                style={{ minWidth: 300, textAlign: 'center', maxHeight: window.outerHeight}}>
                <ListUsers/>
            </Grid>
            <Grid item xs={9}>
                <Canvas/>
            </Grid>
        </Grid>
    );
};

export default MainLayout;