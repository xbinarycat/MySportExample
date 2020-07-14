import React, { Component } from 'react';
import moment from 'moment';
import { inject, observer } from "mobx-react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { UnorderedListOutlined } from '@ant-design/icons'
import { WorkoutModel } from "../../models/workout"
import { WorkoutStore } from "../../models/workout-store"
import { GroupsStore } from "../../models/groups-store"

import {
    Alert,
    Checkbox,
    Modal,
    Row,
    Col,
    Input,
    Button,
    Radio,
    Form,
    DatePicker,
    TimePicker,
    Select,
    InputNumber,
    Tag
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

import { WorkoutTask } from './WorkoutTask';

import { WorkoutTypes, WorkoutTags } from '../../components/workout';
import { WorkoutEditStyle, WorkoutRepeat } from './WorkoutEdit.style';

interface WorkoutEditState
{
    selectedType: string,
    selectedTemplate: string,
    repeatKey?: string,
    showRepeatHint?: boolean,
    repeatCount?: number,
    repeatTaskCount?: number
}

interface WorkoutEditProps
{
    workoutStore?: WorkoutStore,
    groupsStore?: GroupsStore,
    onClose?: () => void,
    template?: boolean,
    groupId?: string
}

@inject('workoutStore', 'groupsStore')
@observer
export class WorkoutEdit extends Component<WorkoutEditProps, WorkoutEditState> {
    formRef = React.createRef<FormInstance>();

    state = {
        selectedType: '',
        selectedTemplate: '',
        repeatKey: '',
        showRepeatHint: false,
        repeatCount: 2,
        repeatTaskCount: 0
    }

    onTypeChange = (ev) => {
        this.setState({
            selectedType: ev.target.value,
            selectedTemplate: ''
        });
    }

    onTemplateChange = (template) => {
        this.setState({
            selectedType: '',
            selectedTemplate: template || ''
        })
    }

    handleNext = () => {
        const workout = this.getWorkout();
        const templateData = this.state.selectedTemplate ?
            this.props.workoutStore!.getWorkout(this.state.selectedTemplate) :
            null;

        this.state.selectedType ?
            workout.setType(this.state.selectedType) :
            workout.setTemplate(templateData);
    }

    handleCancel = () => {
        this.props.onClose && this.props.onClose();
    }

    handleSave = () => {
        if (!this.formRef || !this.formRef.current) return;

        this.formRef.current
            .validateFields()
            .then(values => {
                let workoutDate;
                if (values.date) {
                    workoutDate = values.date.startOf('day');

                    if (values.time) {
                        ['hour', 'minute', 'second'].forEach(item => {
                            workoutDate.set(item, values.time.get(item));
                        });
                    }
                }

                this.props
                    .workoutStore!
                    .saveWorkout({
                        group: values.group || null,
                        date: workoutDate,
                        name: values.name || ''
                    });
            })
            .catch(err => {console.log(err)});
    }

    handleRemove = () => {
        Modal.confirm({
            title: 'Все данные тренировки будут удалены',
            content: 'Хотите продолжить?',
            onOk: () => {
                this.props.workoutStore!.removeWorkout(this.props.workoutStore!.dialog.workout)
            },
        })
    }

    handlePublish = () => {
        this.props.workoutStore!.dialog.setView('publish');
    }

    getWorkoutTypes = () => {
        const { workouttype } = this.getWorkout();
        return (
            <Radio.Group
                className={workouttype ? 'type type_full' : 'type'}
                onChange={this.onTypeChange}
                value={workouttype}
            >
                {WorkoutTypes.get().map(type => {
                    if (workouttype && workouttype !== type.key) {
                        return null;
                    }

                    const selectedButton = this.state.selectedType === type.key ?
                        'type-button__selected' :
                        '';

                    return (
                        <Radio.Button
                            value={type.key}
                            key={type.key}
                            className={['type-button', selectedButton].join(' ')}
                        >
                            {WorkoutTypes.getIcon(type.key)}
                            <div>{type.name}</div>
                        </Radio.Button>
                    )
                })}
            </Radio.Group>
        );
    }

    getInitView = () => {
        const templates = this.props
            .workoutStore!
            .templates
            .map(template => {
                return <Select.Option value={template._id} key={template._id}>{template.name || 'Без имени'}</Select.Option>
            });

        return (
            <div className='view-init'>
                {this.getWorkoutTypes()}
                <Alert
                    type='info'
                    showIcon
                    message='Создание тренировок'
                    description='Давайте выберем тип тренировки. У каждого типа собственный набор заданий, которые вы сможете использовать при составлении тренировок'
                />
                {templates.length ? (
                    <div style={{textAlign: 'center'}}>
                        или
                        <Select
                            onChange={this.onTemplateChange}
                            placeholder='Выберите шаблон'
                            style={{ textAlign: 'center', display: 'block' }}
                            allowClear={true}
                            value={this.state.selectedTemplate || undefined}
                        >
                            {templates}
                        </Select>
                    </div>
                ) : null}

            </div>
        );
    }

    onAddTask = () => {
        this.getWorkout().addTask();
    }

    setRepeatEdit = (repeatKey) => {
        this.setState({
           repeatKey: repeatKey,
           showRepeatHint: repeatKey === 'new'
        });

        if (this.state.repeatKey === 'new') {
            this.onRemoveRepeat('new');
        }
    }

    onRemoveRepeat = (key) => {
        const workout = this.getWorkout();
        workout.removeRepeat(key);
    }

    onRemoveTask = (task) => {
        const workout = this.getWorkout();
        workout.removeTask(task);
    }

    getGroupMenu = () => {
        const groups = this.props
            .groupsStore!
            .groups
            .map(group => {
                return <Select.Option value={group._id} key={group._id}>{group.name}</Select.Option>
            })

        return (
            <Select placeholder='группа'>
                {groups}
            </Select>
        );
    }

    getSettings = () => {
        const workout = this.getWorkout();
        const group = this.props.groupId ?
            this.props.groupsStore!.getGroup(this.props.groupId) :
            null;

        return !this.props.template ? (
            <div className='settings'>
                {!workout.isNew && workout.group && <div className='result'>
                    <Tag>{workout.group.name}</Tag>
                    <a href={`/sport/workout/${workout._originalId}`}>Результаты</a>
                </div>}
                {workout.isNew && group && <div className='result'>
                    <Tag>{group.name}</Tag>
                    <Form.Item name='group'>
                        <Input type='hidden' value={group._id} />
                    </Form.Item>
                </div>}
                <Form.Item
                    label='Дата:'
                    name='date'
                    rules={[
                        {
                            required: true,
                            message: 'укажите дату тренировки',
                        }
                    ]}
                >
                    <DatePicker format='DD.MM.YYYY' placeholder='дата тренировки' />
                </Form.Item>
                <Form.Item
                    label='Время:'
                    name='time'
                >
                    <TimePicker placeholder='время тренировки'/>
                </Form.Item>
                {!workout.group && !group && <Form.Item
                    label='Группа:'
                    name='group'
                    rules={[
                        {
                            required: true,
                            message: 'выберите группу',
                        }
                    ]}
                >
                    {this.getGroupMenu()}
                </Form.Item>}
            </div>) : (
            <div className='settings'>
                <Form.Item
                    label='Имя'
                    name='name'
                    rules={[
                        {
                            required: true,
                            message: 'Введите имя тренировки',
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
            </div>)
    }

    addTaskRepeat = (task: string, repeat: boolean) => {
        const workout = this.getWorkout();
        if (!this.state.repeatKey.length) return;

        // Если добавили первую таску к новому повтору,
        // необходимо скрыть блок подсказки
        if (repeat && this.state.repeatKey === 'new' && this.state.showRepeatHint) {
            this.setState({ showRepeatHint: false });
        }

        workout.setRepeatTask(repeat ? this.state.repeatKey : '', task);

        // Проверяем количество оставшихся тасок, если их нет - необходимо показать подсказку
        const repeatTasks = workout.getRepeatTasks(this.state.repeatKey);
        if (!repeatTasks.length) {
            this.setState({ showRepeatHint: true });
        }
    }

    saveRepeat = () => {
        const workout = this.getWorkout();
        workout.saveRepeat(this.state.repeatKey, this.state.repeatCount);
        this.setRepeatEdit('');
    }

    setRepeatChange = (value) => {
        this.setState({ repeatCount: value });
    }

    getRepeatInput = (key, count) => {
        return (<div className='repeat-input'>
            <span>Повторы: </span>
            {this.state.repeatKey === key ? (
                <span>
                    <InputNumber
                        min={2}
                        defaultValue={count}
                        onChange={this.setRepeatChange}
                    />
                    <Button onClick={() => this.saveRepeat()}>Сохранить</Button>
                    <Button onClick={() => this.setRepeatEdit('')}>Отмена</Button>
                </span>) : (<span>
                    <span>{count}</span>
                    <Button icon={<EditOutlined />} size='small' onClick={() => this.setRepeatEdit(key)} />
                    <Button icon={<DeleteOutlined />} size='small' onClick={() => this.onRemoveRepeat(key)} />
                </span>)
            }
        </div>)
    }

    // По умолчанию в качестве ключа блока повтора
    // устанавливается сгенерированный набор символов.
    // Если блок не является повтором, ключом будет является конкретное число
    isRepeatBlock = (key) => {
        return isNaN(key);
    }

    getRepeatView = (key, content) => {
        const workout = this.getWorkout();
        const repeat = workout.getRepeat(key);
        if (this.isRepeatBlock(key) && repeat) {
            return (<Droppable droppableId={key} key={key}>
                {(provided, snapshot) => (
                    <WorkoutRepeat
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className='workout-repeat droppable'
                    >
                        {this.getRepeatInput(key, repeat.count)}
                        {content}
                        {provided.placeholder}
                    </WorkoutRepeat>
                )}
            </Droppable>);
        } else {
             return (<Droppable droppableId={key} key={key}>
                {(provided, snapshot) => (
                    <div
                        className='droppable'
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {content}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>);
        }
    }

    getWorkoutView = () => {
        const workout = this.getWorkout();
        const { tasks } = workout;
        let repeatKey = '';
        const blocks = [{ key: '1', tasks: [] }] as any;

        tasks.slice().forEach((task, index) => {
            const key = task._id;
            const draggableTask = (<Draggable key={key} draggableId={key} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className='workout'
                    >
                        <div className='workout-checkbox'>
                            {this.state.repeatKey.length ? (
                                <Checkbox
                                    onChange={(e) => this.addTaskRepeat(task._id, e.target.checked)}
                                    defaultChecked={this.state.repeatKey === task.repeatKey}
                                >
                                </Checkbox>
                            ) : <UnorderedListOutlined />}
                        </div>
                        <WorkoutTask
                            key={key}
                            className='workout-task'
                            initTags={WorkoutTags.getTypeTags(workout.workouttype)}
                            task={task}
                            removable={tasks.length > 1}
                            onRemove={this.onRemoveTask}
                        />

                    </div>
                )}
            </Draggable>);

            if (task.repeatKey !== repeatKey) {
                repeatKey = task.repeatKey;
                blocks.push({
                    key: task.repeatKey.length ? task.repeatKey : String(blocks.length),
                    tasks: []
                });
            }

            blocks[blocks.length - 1].tasks.push(draggableTask);
        });

        return (
            <Row>
                <Col span={5}>
                    {this.getWorkoutTypes()}
                    {this.getSettings()}
                </Col>
                <Col span={18} offset={1}>
                    <DragDropContext onDragEnd={this.onTaskDragEnd}>
                        {blocks.map(block => this.getRepeatView(block.key, block.tasks.slice()))}
                    </DragDropContext>
                    {this.state.showRepeatHint ? (
                        <WorkoutRepeat className='hint'>
                            <span className='repeat-input'>Выберите задания для создания повтора&nbsp;
                                <Button onClick={() => this.setRepeatEdit('')}>Отмена</Button>
                            </span>
                        </WorkoutRepeat>
                    ) : null}
                    <div className='workout-buttons'>
                        <Button
                            className='btn-add-task'
                            onClick={this.onAddTask}
                        >
                            Добавить задание
                        </Button>
                        <Button
                            className='btn-add-task'
                            disabled={this.state.repeatKey.length ? true : false}
                            onClick={() => this.setRepeatEdit('new')}
                        >
                            Добавить повтор
                        </Button>
                    </div>
                </Col>
            </Row>
        );
    }

    onTaskDragEnd = (result) => {
        // Dropped outside
        if (!result.destination) {
            return;
        }

        const workout = this.getWorkout();
        const task = workout.tasks
            .slice()
            .find(task => task._id === result.draggableId);

        if (!task) return;

        workout.swapTasks(result.source.index, result.destination.index);
        const destinationRepeat = result.destination.droppableId;
        if (task.repeatKey !== destinationRepeat) {
            this.addTaskRepeat(task._id, this.isRepeatBlock(result.destination.droppableId) ? destinationRepeat : '');
        }
    }

    getWorkout = ():WorkoutModel => {
        return this.props.workoutStore!.currentWorkout!;
    }

    dialogButtons = (isInitView, loadingState) => {
        const buttons:any[] = [];
        if (isInitView) {
            buttons.push((
                <Button
                    type='primary'
                    key="next"
                    onClick={this.handleNext}
                    disabled={this.state.selectedTemplate || this.state.selectedType ? false : true}
                >
                    Далее
                </Button>
            ));
        } else {
            this.props.template && buttons.push(
                <Button loading={loadingState} key="submitset" onClick={this.handlePublish}>
                    Сохранить и назначить
                </Button>,
            );
            buttons.push((
                <Button
                    loading={loadingState}
                    htmlType="submit"
                    type='primary'
                    key="submit"
                    onClick={this.handleSave}
                >
                    Сохранить
                </Button>
            ));
        }

        return (<div className='buttons'>{buttons}</div>);
    }

    render() {
        const { workoutStore } = this.props;
        if (!workoutStore || !workoutStore.currentWorkout) {
            return null;
        }

        const workout = this.getWorkout();
        const { needType, isNew } = workout;

        const { error, loading, visible } = workoutStore.dialog;

        return (
            <Modal
                style={{ transition: 'width 0.2s ease-in'}}
                visible={visible}
                closable={true}
                footer={
                    <Row justify='space-between'>
                        <Col span={12} style={{ textAlign: 'left' }}>
                            {!isNew ? (
                                <Button key="remove" onClick={this.handleRemove}>
                                    Удалить
                                </Button>
                            ) : (
                                <Button key="cancel" onClick={this.handleCancel}>
                                    Отмена
                                </Button>
                            )}
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            {this.dialogButtons(needType, loading)}
                        </Col>
                    </Row>
                }
                onCancel={this.handleCancel}
                width={needType ? 600 : 900}
            >
                <Form
                    initialValues={{
                        date: workout.date ? moment(workout.date) : null,
                        time: workout.date ? moment(workout.date) : null,
                        group: this.props.groupId || null,
                        name: workout.name || '',
                    }}
                    ref={this.formRef}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 15, offset: 1 }}
                >
                    <WorkoutEditStyle>
                        {needType ? this.getInitView() : this.getWorkoutView()}
                        {error && (
                            <div className='workout-error'>
                                <Alert
                                    type='error'
                                    showIcon
                                    message='Произошла ошибка!'
                                    description={`${error}`}
                                />
                            </div>
                        )}
                    </WorkoutEditStyle>
                </Form>
            </Modal>
        )
    }
}

export default WorkoutEdit;