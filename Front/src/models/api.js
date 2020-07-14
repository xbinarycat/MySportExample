const backendHost = process.env.NODE_ENV === 'production' ?
    '' :
    '';
const version = 1;
module.exports = {
    fetch: (url, opts) => {
        if (!opts) opts = {};
        return fetch(`${backendHost}/api/${version}/${url}`,
            Object.assign({
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                }
            }, opts)
        )
        .then(resp => resp.json())
    }
}
