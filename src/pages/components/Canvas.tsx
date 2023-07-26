import React, { useMemo, useState } from 'react';
import { Checkbox, FormControlLabel, FormGroup, Typography, useEventCallback } from '@mui/material';
import { colors } from '../../mock/mock';
import 'primeicons/primeicons.css';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage, Layer, Group, Circle, Rect, Image, Text } from 'react-konva';
import { ITeam, IUsers } from '../../types/types';

const Canvas: React.FC = () => {
    const [ team ] = useState<ITeam[]>(JSON.parse(localStorage.getItem('team') as string) ?? []);
    const [checkedName, setCheckedName] = useState<boolean>(true);

    const users = useMemo(() => {
        team.sort(function(a, b){
            return b.salary - a.salary;
        });
        return team.map((item: ITeam, index: number) => { 
            const radius = Math.sqrt((item.salary)/3.14);
            const x = ((window.innerWidth * 0.83) / team.length) * (index + 1) - (window.innerWidth * 0.83) / team.length / 2;
            const y  = Math.random() * (window.innerHeight*0.7 - radius - radius) + radius;
            return {
                id: item.id,
                x: x,
                y: y,
                department: item.department,
                salary: item.salary,
                isDragging: false,
                radius: radius,
                color: colors[index] ?? colors[Math.floor(Math.random() * (colors.length - 1))],
                team: item.team.map((value: IUsers) => { 
                    const radiusValue = Math.sqrt((value.salary)/3.14);   
                    var a = new window.Image();    
                    a.src = value.avatar;       
                    return {
                        userName: value.userName,
                        id: value.id,
                        idTeam: item.id,
                        x: item.team.length === 1 ? x - radius + 10 : Math.random() * (x - (x - radius + 10)) + (x - radius + 10),
                        y: item.team.length === 1 ? y - radius + 10  : Math.random() * (y - (y - radius + 10)) + (y - radius + 10),
                        radius: radiusValue*0.6, // радиус вычеслен на основании площади круга = зарплате
                        image: a,
                        avatar: value.avatar,
                    }
                })
            }
        });
        }, [team],
    );
    const [circle, setCircle] = useState(users);

    const handleDragStartTeam = useEventCallback((e: KonvaEventObject<DragEvent>) => {
        const id = e.target.id();
        setCircle(
            circle.map((circle) => {
            return {
              ...circle,
              isDragging: circle.id as unknown as string === id
            };
          })
        );
      });

    const handleDragEndTeam = useEventCallback((e: KonvaEventObject<DragEvent>) => {        
        setCircle(
            circle.map((circle: any) => {
            return {
              ...circle,
              isDragging: false
            };
          })
        );
    });

    const handleDragStart = useEventCallback((e: KonvaEventObject<DragEvent>) => {
        const id = e.target.id();
        setCircle(
            circle.map((circle) => {
            return {
              ...circle,
              isDragging: circle.id as unknown as string === id
            };
          })
        );
      });

    const handleDragEnd = useEventCallback((e: KonvaEventObject<DragEvent>, id?: number | undefined, idTeam?: number | undefined) => {
        const team = users.filter((item) => item.id === idTeam);
        if (e.evt.offsetX < team[0].x + team[0].radius && e.evt.offsetX > team[0].x - team[0].radius && e.evt.offsetY < team[0].y + team[0].radius && e.evt.offsetY > team[0].y - team[0].radius) {
            setCircle(
                circle.map((circle: any) => {
                return {
                  ...circle,
                  isDragging: false
                };
              })
            );
        } else {
            const teamLS = JSON.parse(localStorage.getItem('team') as string) ?? [];
            const result = teamLS?.map((item: ITeam) => { 
                if (idTeam === item.id) {
                    const resultTeam = item?.team?.filter((value: IUsers) => value.id !== id);
                    const removeUser = item?.team?.filter((value: IUsers) => value.id === id);
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
        }
    });

    const onClick = useEventCallback((e: KonvaEventObject<MouseEvent>) => {
        if (e.target.attrs.id !== undefined) {
            const team = JSON.parse(localStorage.getItem('team') as string) ?? [];
            const user = JSON.parse(localStorage.getItem('user') as string)[0];
            const result = team.map((item: ITeam) => { 
                if (item.id === e.target.attrs.id) {
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
        }
    });

    return (
        <>
            <FormGroup style={{ width: window.innerWidth * 0.83, marginInline: 0 }}>
                <Typography variant="caption" display="block" gutterBottom style={{ margin: 15, display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '18px' }}><span style={{ fontWeight: 'bold'}}>Проект: №1</span>, количество команд: {team.length}</div>
                    {team.length ? (<FormControlLabel 
                        control={<Checkbox onChange={(event) => setCheckedName(event.target.checked)} checked={checkedName}/>} 
                        label="Показать ФИО" 
                    />) : null}
                </Typography>
            </FormGroup>
            <Stage width={window.innerWidth * 0.83} height={window.innerHeight-72} onClick={(e) => onClick(e)}>
                <Layer>
                    {users.map((item) => (
                        <Group
                            draggable
                            onDragStart={(event) => handleDragStartTeam(event)}
                            onDragEnd={(event) => handleDragEndTeam(event)}
                        >
                            <Circle
                                key={item.id}
                                id={item.id as unknown as string}
                                x={item.x}
                                y={item.y}
                                radius={item.radius}
                                fill={item.color as string} />
                            {item.team.map((value) => (
                                <Group
                                    draggable
                                    onDragStart={(event) => handleDragStart(event)}
                                    onDragEnd={(event) => handleDragEnd(event, value.id, value.idTeam)}
                                >
                                    <Image
                                        cornerRadius={360}
                                        image={value.image}
                                        key={value.id}
                                        id={value.id as unknown as string}
                                        x={value.x}
                                        y={value.y}
                                        width={value.radius*2*(value.image?.width ?? 1)/(value.image?.height ?? 1)}
                                        height={value.radius*2}
                                        scale={{x: 1, y: 1}}
                                        stroke='#FFFFFF' />
                                    {checkedName ? (
                                        <>
                                            <Rect
                                                x={value.x + value.radius / 2}
                                                y={value.y + 2 * value.radius - 20}
                                                width={`${value.userName}`.length * 12}
                                                height={24}
                                                stroke={item.color}
                                                align='center'
                                                fill='#FFFFFF' 
                                            />
                                            <Text
                                                x={value.x + value.radius / 2}
                                                y={value.y + 2 * value.radius - 15}
                                                text={`${value.userName}`}
                                                fontSize={14}
                                                width={`${value.userName}`.length * 12}
                                                align='center' 
                                            />
                                        </>)
                                    : null}
                                </Group>
                            ))}
                            <Rect
                                x={item.x - item.radius / 2}
                                y={item.y + item.radius - 15}
                                width={`${item.department} ${item.salary}`.length * 12}
                                height={36}
                                stroke={item.color}
                                align='center'
                                fill='#FFFFFF' />
                            <Text
                                x={item.x - item.radius / 2}
                                y={item.y + item.radius - 5}
                                text={`${item.department} ${item.salary}`}
                                width={`${item.department} ${item.salary}`.length * 12}
                                height={36}
                                fontSize={18}
                                fontStyle='bold'
                                align='center' />
                        </Group>
                    ))}
                </Layer>
            </Stage>
        </>
    );
};

export default Canvas;