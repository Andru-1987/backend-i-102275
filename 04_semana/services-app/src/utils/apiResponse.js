export default class ApiReponse {
    static #send(response,statusCode,payload,message){
        return response.status(statusCode).json({
            status: 'success',
            ...(message && { message: message }),
            payload: payload
        })
    }

    static sendSuccess(response, payload, message) {
        return this.#send(response, 200, payload, message)
    }

    static sendCreated(response, payload, message) {
        return this.#send(response, 201, payload, message)
    }

    static sendUpdated(response, payload, message) {
        return this.#send(response, 204, payload, message)
    }

    static sendDeleted(response, payload, message) {
        return this.#send(response, 200, payload, message)
    }

    static sendAsyncRequest(response, payload, message) {
        return this.#send(response, 202, payload, message)
    }
}