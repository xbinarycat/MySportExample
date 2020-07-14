interface WorkoutValueInput
{
    key: string,
    name: string,
    noInput?: boolean
}

interface WorkoutValueType
{
    key: string,
    name: string,
    inputs: WorkoutValueInput[]
}

const Values = [
    {
        key: 'distance',
        name: 'Дистанция',
        inputs: [
            {
                key: 'm',
                name: 'м'
            },
            {
                key: 'km',
                name: 'км'
            }
        ]
    },
    {
        key: 'hr',
        name: 'Пульс',
        inputs: [
            {
                key: 'hr',
                name: 'чсс'
            }
        ]
    },
    {
        key: 'time',
        name: 'Время',
        inputs: [
            {
                key: 'min',
                name: 'мин'
            },
        ]
    },
    {
        key: 'speed',
        name: 'Скорость',
        inputs: [
            {
                key: 'fast',
                name: 'быстро',
                noInput: true
            },
            {
                key: 'slow',
                name: 'медленно',
                noInput: true
            },
            {
                key: 'normal',
                name: 'спокойно',
                noInput: true
            },
            {
                key: 'valuemin',
                name: 'мин/км'
            },
            {
                key: 'valuekm',
                name: 'км/ч'
            },
        ]
    },
    {
        key: 'zone',
        name: 'Зона',
        inputs: [
            {
                key: '1',
                name: '1: <60%',
                noInput: true
            },
            {
                key: '2',
                name: '2: <70%',
                noInput: true
            },
            {
                key: '3',
                name: '3: <80%',
                noInput: true
            },
            {
                key: '4',
                name: '4: <90%',
                noInput: true
            },
            {
                key: '5',
                name: '5: <100%',
                noInput: true
            },
            {
                key: '6',
                name: '6: 100%',
                noInput: true
            }
        ]
    }
];

export const WorkoutValues = {
    get(): WorkoutValueType[] {
        return Values.slice();
    },
    getType(type): WorkoutValueType | undefined {
        return Values.find(value => value.key === type);
    },
    getValueType(type, valueType): WorkoutValueInput | undefined {
        const mainType = this.getType(type);
        if (!mainType) return;
        return mainType.inputs.find(input => input.key === valueType);
    },
}
