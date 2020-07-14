import React, { createRef, Component } from 'react';
import moment from 'moment';
import { Input, Button, Tooltip, Avatar, Empty } from 'antd';
import { ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons'
import WorkoutChatHolder from './WorkoutChat.style';
import { WorkoutModel } from '../../models/workout'

interface WorkoutChatProps
{
    userId: string,
    author: string,
    comments: any[],
    workout: WorkoutModel,
}

interface WorkoutChatState
{
    commentText: string
}

export class WorkoutChat extends Component<WorkoutChatProps, WorkoutChatState> {
    private commentsRef = createRef<HTMLDivElement>()
    state = {
        commentText: ''
    }

    getComments = () => {
        const comments = this.props.comments || [];

        return (<div className='comments'>
            {comments.length > 0 ? comments
                .slice()
                .sort((c1, c2) => c2.date - c1.date)
                .reverse()
                .map((comment, index) => {
                    const commentStyle = comment.user === this.props.author ?
                        'comment comment_right' :
                        'comment comment_left';

                    return <div className={commentStyle} key={index}>
                            {comment.status === 'error' ? <Tooltip title="Сообщение не было отправлено">
                                <ExclamationCircleOutlined className='comment_status' style={{ color: 'red '}} />
                            </Tooltip> : null}
                            <div className='comment_data'>
                                <Avatar icon={<UserOutlined />} />
                                <div className='comment_content'>
                                    <div className='comment_text'>
                                        {comment.text}
                                    </div>
                                    <div className='comment_date'>
                                        {moment(comment.date).fromNow()}
                                    </div>
                                </div>
                            </div>
                        </div>;
                }) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description='Нет комментариев'
                    />
                )
            }
            <div ref={this.commentsRef} />
        </div>);
    }

    commentChange = (ev) => {
        this.setState({ commentText: ev.target.value });
    }

    sendComment = () => {
        if (!this.state.commentText.trim().length) return;
        this.props.workout.sendComment(this.props.author, this.state.commentText.trim(), this.props.userId);
        this.setState({ commentText: '' });
    }

    componentDidUpdate = () => {
        if (this.commentsRef && this.commentsRef.current) {
            this.commentsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    componentDidMount = () => {
        if (this.commentsRef && this.commentsRef.current) {
            this.commentsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    render() {
        const comments = this.getComments();
        this.props.workout.readComments(this.props.author, this.props.userId);

        return (
            <WorkoutChatHolder>
                <b>Комментарии</b>
                {comments}
                <div className='send'>
                    <Input
                        onChange={this.commentChange}
                        onPressEnter={() => this.sendComment()}
                        value={this.state.commentText}
                        placeholder='Введите сообщение'
                    />
                    <Button
                        type='primary'
                        onClick={() => this.sendComment()}
                    >
                        Отправить
                    </Button>
                </div>
            </WorkoutChatHolder>
        )
    }
}

export default WorkoutChat;
