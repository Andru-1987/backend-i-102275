import mongoose from 'mongoose'

export const isValidId = id => mongoose.isValidObjectId(id)
export const normalizeDoc = doc =>{
    if (!doc) return null

    const {_id, __v, ...rest } = doc

    return {
        ...rest,
        id: String(_id),
        _id: String(_id)
    }
}

export const sanitizeUpdatePayload = data => {
    const {id,_id,__v, ...cleanData} = data
    return cleanData
}