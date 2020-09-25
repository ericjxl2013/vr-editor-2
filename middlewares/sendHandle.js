// 0000 表示请求成功

const sendHandle = () => {
    // 处理请求成功方法
    const render = ctx => {
        return (data, message = "success") => {
            ctx.set("Context-Type", "application/json");
            ctx.body = {
                code: "0000",
                data,
                message
            };
        };
    };

    // 处理请求失败方法
    const renderError = ctx => {
        return (code, message = "fail") => {
            ctx.set("Context-Type", "application/json");
            ctx.body = {
                code,
                data: null,
                message
            };
        };
    };

    return async (ctx, next) => {
        ctx.send = render(ctx);
        ctx.sendError = renderError(ctx);
        await next();
    };
};

module.exports = sendHandle;
