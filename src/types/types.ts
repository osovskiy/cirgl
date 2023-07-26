export interface IUsers {
    userName: string, 
    department: string,
    id: number,
    salary: number,
    avatar: string,
}

export interface ITeam {
    department: string,
    id: number,
    salary: number,
    team: IUsers[],
}