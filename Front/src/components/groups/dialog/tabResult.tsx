import React, { Component } from 'react';
import TabResultStyle from './tabResult.style';
import { Alert } from 'antd';

import { GroupModel } from "../../../models/group"

interface TabResultProps
{
    group: GroupModel
}

export class TabResult extends Component<TabResultProps, {}> {
    render() {
        const { group } = this.props;
        if (!group) return null;

        return (
            <TabResultStyle>
                <div className='title'>
                    <strong>{group.name}</strong>
                </div>
                {group.description && <div className='description'>{group.description}</div>}
                <div className='users'>
                    Приглашений: <strong>{group.invites.length}</strong>
                </div>
                <div>
                    <Alert
                        type='info'
                        message='Вы в одном шаге от создания группы. Полученные данные можно изменить позднее в любой момент.'
                    />
                </div>
            </TabResultStyle>
        );
    }
}

export default TabResult;
