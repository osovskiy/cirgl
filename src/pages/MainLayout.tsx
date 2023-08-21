import React from 'react';
import Canvas from './components/Canvas';
import ListUsers from './components/ListUsers';
import { Grid } from '@mui/material';

const MainLayout: React.FC = () => {    
    return (
        <Grid container>
            <Grid 
                item xs={2} 
                style={{ minWidth: 300, textAlign: 'center', maxHeight: window.outerHeight}}
            >
                <ListUsers/>
            </Grid>
            <Grid item  width={window.innerWidth * 0.80} height={window.innerHeight}>
                <Canvas/>
            </Grid>
        </Grid>
    );
};

export default MainLayout;