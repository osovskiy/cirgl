import React, { useCallback, useState } from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, ListItemButton, Typography, FormControl, Divider, Grid, InputBase, IconButton, Paper, Fab, Dialog, DialogTitle, DialogContent, Tooltip } from '@mui/material';
import 'primeicons/primeicons.css';
import SearchIcon from "@mui/icons-material/Search";
import AddSharpIcon from '@mui/icons-material/AddSharp';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { IUsers } from '../../types/types';
import * as XLSX from 'xlsx';

const ListUsers: React.FC = () => {
    const [users, setUsers] = useState(JSON.parse(localStorage.getItem('users') as string) ?? []);
    const [importUsers, setImportUsers] = useState<IUsers[]>(JSON.parse(localStorage.getItem('importUsers') as string) ?? []);
    const [checked, setChecked] = useState<number[]>([]);
    const [department, setDepartment] = useState<string>('');
    const [openDialog, setOpenDialog] = useState(false);

    //методы для модального окна
    const handleClickOpenDialog = useCallback(() => {
        setOpenDialog(true);
    }, []);
    
    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
        window.location.reload();
    }, []);

    const onImportExcel = useCallback((file: { target: { files: any; }; }) => {
        const { files } = file.target;
        const fileReader = new FileReader();
        fileReader.onload = () => {
            try {
                const result = fileReader.result;
                const workbook = XLSX.read(result, { type: 'binary' });
                let data: any[] = [];
                for (const sheet in workbook.Sheets) {
                    if (workbook.Sheets.hasOwnProperty(sheet)) {
                        data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                    }
                }
                const users = data.map((item, index) => {
                    return {
                        avatar: item.avatar,
                        department: item.department,
                        salary: item.salary,
                        userName: item.userName,
                        id: index,
                    };
                });
                setImportUsers(users);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('importUsers', JSON.stringify(users));
                localStorage.setItem('team', JSON.stringify([]));
                localStorage.setItem('user', JSON.stringify([]));
                handleCloseDialog();
            } catch (e) {
                console.log('Неверный тип файла');
                return;
            }
        };
        fileReader.readAsBinaryString(files[0]);
    }, [ handleCloseDialog ]);

    const onCheckedUser = useCallback((index: number) => {
        var newChecked = checked;
        const chechedUser = index;
        newChecked.push(chechedUser as number);
        setChecked(newChecked);
        localStorage.setItem('user', JSON.stringify(importUsers.filter((item) => item.id === index)));
    }, [ checked, importUsers ]);

    const onAddTeam = useCallback(() => {
        const chechedUser = importUsers.filter((item) => checked.includes(item.id));
        const salary = chechedUser.map(item => item.salary);
        const team = JSON.parse(localStorage.getItem('team') as string) ?? [];
        const result = {
            department: department, 
            id: team.length,
            salary: salary?.reduce((partialSum, a) => partialSum + a, 0),
            team: chechedUser,
        };
        localStorage.setItem('team', JSON.stringify([ ...team, result]));
        const resultUsers = users.filter((item: IUsers) => !checked.includes(item.id));
        localStorage.setItem('users', JSON.stringify(resultUsers));
        localStorage.setItem('user', JSON.stringify([]));
        setDepartment('');
        setChecked([]);
        window.location.reload();
    },[checked, department, importUsers, users]);

    const onSearch = useCallback((value: string) => {
        if (value) {
            const resultSearch = users.filter((item: IUsers) => item.userName.includes(value));
            setUsers(resultSearch);
        } else {
            setUsers(JSON.parse(localStorage.getItem('users') as string) ?? []);
        }
    },[users]);

    return (
        <>
            
            <Typography variant="caption" display="block" gutterBottom style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', marginLeft: 25 }}>Контакты<IconButton sx={{ p: '0px', ml: '10px' }} 
                    onClick={handleClickOpenDialog}
                ><FileUploadIcon /></IconButton></span>
                <span style={{ marginRight: 25, paddingBlock: 5 }}>{users.length} </span>
            </Typography>
            <FormControl variant="standard" style={{ margin: 15, width: window.innerWidth * 0.13 }} >
                <Paper
                    component="form"
                    variant='outlined'
                    sx={{ display: 'flex', alignItems: 'center', size: 'small' }}
                    >
                    <IconButton sx={{ p: '10px' }}>
                        <SearchIcon />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Поиск"
                        onChange={(event) => {
                            onSearch(event.target.value);
                        }}
                    />
                </Paper> 
            </FormControl>
            <List dense sx={{ width: '100%', bgcolor: 'background.paper', position: 'relative', overflow: 'auto', height: window.innerHeight*0.76 }}>
                {users?.map((item: IUsers) => {
                    return (
                        <>
                        <ListItemButton
                            selected={checked.includes(item.id)}
                            onClick={(event) => onCheckedUser(item.id)}
                        >
                            <Tooltip title="Чтобы добавить участника в существующую команду, кликните сначала по нему, после по соответствующей команде" placement="right">
                                <ListItem
                                    alignItems="flex-start"
                                    key={item.id}
                                    style={{ paddingInline: 15 }}
                                    disablePadding
                                >
                                    <Grid container wrap="nowrap" spacing={2}>
                                        <Grid item>
                                            <ListItemAvatar>
                                                <Avatar variant="rounded" src={item.avatar}>{item.id}</Avatar>
                                            </ListItemAvatar>
                                        </Grid>
                                        <Grid item xs>
                                            <ListItemText
                                                primary={item.userName}
                                                secondary={`${item.department ?? 'Позиция не указана'}, ${item.salary ?? 'заработная плата не указана'}`} 
                                            />
                                        </Grid>
                                    </Grid>        
                                </ListItem>
                            </Tooltip>
                        </ListItemButton>
                        <Divider variant="inset" component="li" />
                    </>
                        
                    );
                })}
            </List>
            <FormControl variant="standard" style={{ margin: 15, width: window.innerWidth * 0.13 }} >
                <Paper
                    component="form"
                    variant='outlined'
                    sx={{ display: 'flex', alignItems: 'center', size: 'small' }}
                    >
                    <IconButton sx={{ }} onClick={() => {
                        if (department && checked.length) {
                            onAddTeam();
                        }}}>
                        <Fab color="primary" aria-label="add" size="small">
                            <AddSharpIcon />
                        </Fab>
                    </IconButton>
                    <InputBase
                        value={department}
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Создать команду"
                        onChange={(event) => {
                            setDepartment(event.target.value);
                        }}
                    />
                </Paper>
            </FormControl>
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>
                    Загрузить список сотрудников
                </DialogTitle>
                <DialogContent>
                    <input type='file' accept='.xlsx'  onChange={onImportExcel} />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ListUsers;