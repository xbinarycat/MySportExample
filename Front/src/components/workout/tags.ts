export interface WorkoutTagsType {
    key: string,
    text: string
}

const Tags = {
    run: [
        { key: 'run', text: 'Легкий бег' },
        { key: 'intervals', text: 'Интервалы' },
        { key: 'pulse', text: 'Бег на пульсе' },
        { key: 'easy', text: 'Заминка' },
    ],
    swim: [
        { key: 'free', text: 'Свободный стиль' },
        { key: 'breast', text: 'Брасс' },
        { key: 'back', text: 'Спина' },
        { key: 'but', text: 'Баттерфляй' },
        { key: 'paddle', text: 'С лопатками' },
        { key: 'flipper', text: 'В ластах' },
    ],
    bike: [
        { key: 'intervals', text: 'Интервалы' },
    ],
    rest: [
        { key: 'relax', text: 'Отдых' },
        { key: 'ofp', text: 'ОФП' },
        { key: 'drink', text: 'Паста-пати' },
    ],
};


export const WorkoutTags = {
    getTypeTags(type): WorkoutTagsType[] {
        return Tags[type].slice() || [];
    },
    get(type) {
        return Object.assign({}, Tags);
    }
}
