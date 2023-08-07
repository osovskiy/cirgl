import React from 'react';
import { Grid } from '@mui/material';
import ListUsers from './components/ListUsers';
import Circle from './components/Circle';
import Canvas from './components/Canvas';

const MainLayout: React.FC = () => {
    return (
        <Grid container>
            <Grid 
                item xs={2} 
                style={{ minWidth: 300, textAlign: 'center', maxHeight: window.outerHeight}}>
                <ListUsers/>
            </Grid>
            <Grid item  width={window.innerWidth * 0.80} height={window.innerHeight - 115}>
                {/* <Canvas/> */}
                <Circle/>
            </Grid>
        </Grid>
    );
};

export default MainLayout;