import { Checkbox, FormControlLabel, FormGroup, Typography, Tooltip } from "@mui/material";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import React, { useState, useMemo, useCallback } from "react";
import { ITeam, IUsers } from "../../types/types";

const Circle: React.FC = () => {
    const [ team ] = useState<ITeam[]>(JSON.parse(localStorage.getItem('team') as string) ?? []);
    const [possibilityRemoval, setPossibilityRemoval] = useState<boolean>(true);

    const users = useMemo(() => {
        return {
            name: 'Проект 1',
            children: team.map((item) => {
                return {
                    name: item.department,
                    children:  item.team.map((val) => {
                        return {
                            id: val.id,
                            nameTeam: item.department,
                            salary: val.salary,
                            name: val.userName,
                        }
                    })   
                }
            }) 
        };
    }, [ team ]);

    const onAdd = useCallback((team: { name: string, children: {} }) => {
        const teams= JSON.parse(localStorage.getItem('team') as string) ?? [];
        const user = JSON.parse(localStorage.getItem('user') as string)[0];
        const result = teams.map((item: ITeam) => { 
            if (item.department === team.name) {
                const resultTeam = [...item.team, user];
                return {
                    department: item.department, 
                    id: item.id,
                    salary: item.salary + user.salary,
                    team: resultTeam,
                };
            } else {
                return item;
            }
        });
        localStorage.setItem('team', JSON.stringify(result));
        const users = JSON.parse(localStorage.getItem('users') as string) ?? [];
        const resultUsers = users.filter((item: IUsers) => user.id !== item.id);
        localStorage.setItem('users', JSON.stringify(resultUsers));
        localStorage.setItem('user', JSON.stringify([]));
        window.location.reload();
    }, []);
    
    const onDelete = useCallback((event: any) => {
        const teamLS = JSON.parse(localStorage.getItem('team') as string) ?? [];
        const result = teamLS?.map((item: ITeam) => { 
            if (event.data.nameTeam === item.department) {
                const resultTeam = item?.team?.filter((value: IUsers) => value.id !== event.data.id);
                const removeUser = item?.team?.filter((value: IUsers) => value.id === event.data.id);
                const users = JSON.parse(localStorage.getItem('users') as string) ?? [];
                users.push(removeUser[0]);
                localStorage.setItem('users', JSON.stringify(users));
                const salary = resultTeam?.map(value => value.salary);
                if (resultTeam.length) {
                    return {
                        department: item.department,
                        id: item.id,
                        salary: salary?.reduce((partialSum, a) => partialSum + a, 0),
                        team: resultTeam,
                    };
                };
            } else {
                return item;
            }
        });
        localStorage.setItem('team', JSON.stringify(result.filter((item: ITeam) => item)));
        window.location.reload();
    }, []);

    return (
        <>
            <FormGroup style={{ width: window.innerWidth * 0.80, marginInline: 0 }}>
                <Typography variant="caption" display="block" gutterBottom style={{ margin: 15, marginRight: 0  }}>
                    <div style={{ fontSize: '18px' }}><span style={{ fontWeight: 'bold'}}>Проект: №1</span>, количество команд: {users.children.length}</div>
                    {users.children.length ? (<Tooltip title="Если выбрана возможность удаления, по клику на участника происходит удаление его из команды" placement="bottom">
                        <FormControlLabel 
                            control={<Checkbox onChange={(event) => setPossibilityRemoval(event.target.checked)} checked={possibilityRemoval}/>} 
                            label="Возможность удаления участников команды" 
                        />
                    </Tooltip>) : null}
                </Typography>
            </FormGroup>
            <ResponsiveCirclePacking
                data={users}
                id="name"
                value={"salary"}
                colors={{ scheme: 'set3' }}
                colorBy='id'
                borderColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'brighter',
                            3
                        ]
                    ]
                }}
                padding={5}
                enableLabels={true}
                labelsFilter={n=>2===n.node.depth}
                labelTextColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            3,
                        ]
                    ]
                }}
                borderWidth={1}
                valueFormat={value => `${Number(value).toLocaleString('ru-RU', {
                    minimumFractionDigits: 2
                })} ₽`}
                onClick={event => {
                    if (event.depth === 2 && possibilityRemoval && JSON.parse(localStorage.getItem('user') as string).length === 0) {
                        onDelete(event);
                    } else if (event.depth === 1 && JSON.parse(localStorage.getItem('user') as string).length) {
                        onAdd(event.data);
                    }
                }}
            />
       </>
    );
};

export default Circle;