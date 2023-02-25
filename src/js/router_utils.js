export const beforeTryError = fn => async (to, from, next) => {
    try {
        await fn(to, from, next);
        next();
    } catch (err) {
        console.error(err);
        next({
            name: 'error',
            props: {
                main: {
                    message: err,
                },
            },
        });
    }
};
