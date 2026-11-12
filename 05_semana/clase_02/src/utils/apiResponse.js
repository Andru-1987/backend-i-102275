export default class ApiReponse {
    static #STATUS_CODES = Object.freeze({
        OK: 200,
        CREATED: 201,
        UPDATED: 204,
        DELETED: 200,
        ASYNC_REQUEST: 202
    })

    static #send(response, statusCode, payload, message) {
        return response.status(statusCode).json({
            status: 'success',
            ...(message && { message: message }),
            payload: payload
        })
    }


    static #sender(statusCode) {
        return (response, payload, message) => {
            return this.#send(response, statusCode, payload, message)
        }
    }

    static sendSuccess = this.#sender(this.#STATUS_CODES.OK)

    static sendCreated = this.#sender(this.#STATUS_CODES.CREATED)

    static sendUpdated = this.#sender(this.#STATUS_CODES.UPDATED)

    static sendDeleted = this.#sender(this.#STATUS_CODES.DELETED)

    static sendAsyncRequest = this.#sender(this.#STATUS_CODES.ASYNC_REQUEST)

}