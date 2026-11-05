const loggerHandler = (request, _, next) => {
    const isoTime = new Date().toISOString()
    console.log(`[${request.method}]\t[${isoTime}] ->${request.url}`);
    next()
}

export default loggerHandler