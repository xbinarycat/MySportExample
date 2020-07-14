const { api, Action } = require('actionhero');

module.exports = class Invite extends Action {
    constructor() {
        super();

        this.name = 'invite';
        this.description = 'Invite';
        this.inputs = {
            groupid: { required: true }
        }

    }

    redirect(connection, url) {
        connection.rawConnection.responseHeaders.push(['Location', url]);
        connection.rawConnection.responseHttpCode = 302;
    }

    async run({ connection, params, response }) {
        const { groupid } = params;
        try {
            const user = await api.user.getUser(connection);
            if (!user) {
                return this.redirect(connection, '/?retpath=/invite/' + groupid);
            }

            if (user.user_type !== 'sport') {
                return this.redirect(connection, '/');
            }

            // Проверяем, нет ли пользователя в группе
            const group = await api.db.Groups.findOne({ id: groupid }).lean();
            if (!group) {
                return this.redirect(connection, '/');
            }

            // Элементы представлены в ввиде ObjectId, обычный includes не работает
            const findUser = (group.users || []).filter(item => {
                return String(item) === String(user._id);
            });

            if (findUser.length === 0) {
                const invite = { email: user.email, group: group._id };
                // Используем findOneAndUpdate чтобы удостоверится, что не добавим новый, если инвайт уже есть
                const res = await api.db
                    .Invites
                    .findOneAndUpdate(
                        invite,
                        { ...invite, status: 'new', inviteDate: Date.now() },
                        { new: true, upsert: true }
                    );
            }

            this.redirect(connection, '/');
        } catch(err) {
            api.log(err.stack, 'warning');
            response.error = err.message;
        }
    }
}
