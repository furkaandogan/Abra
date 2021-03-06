const mongoose = require("mongoose");
const collections = require("../db/collectionNames");
const _dictionary = require("../localization/dictionary");
const responseCode = require("../utilities/responseCode");
const Schema = mongoose.Schema;
const objectId = Schema.Types.ObjectId;

const courierSchema = new Schema({
    ownerId: objectId,
    dateCreated: Date,
    note: String,
    // ayrılış tarihi
    originDate: Date,
    // hedef tarihi
    destinationDate: Date,
    // gelen sipariş isteiğinin hemen onaylanması
    instantBooking: Boolean,
    // hedef
    destination: objectId,
    // başlangıç noktası
    origin: objectId,
    // bagaj kapasitesi
    weight: Number,
    price: Number

}, { versionKey: false });

mongoose.model("courier", courierSchema, collections.courier);

const model = mongoose.model("courier");

model.register = (courier, req) => {
    var dictionary = _dictionary(req);
    return new Promise((res, rej) => {
        if (courier.ownerId == null) {
            rej({
                message: dictionary.errorMessages.invalidUser,
                statusCode: responseCode.BAD_REQUEST
            });
        } else if (courier.originDate == null) {
            rej({
                message: dictionary.errorMessages.nullOrEmptyOriginDate,
                statusCode: responseCode.BAD_REQUEST
            })
        } else if (courier.destinationDate == null) {
            rej({
                message: dictionary.errorMessages.nullOrEmptydestinationDate,
                statusCode: responseCode.BAD_REQUEST
            });
        } else if (courier.destination == null) {
            rej({
                message: dictionary.errorMessages.nullOrEmptyDestination,
                statusCode: responseCode.BAD_REQUEST
            });
        } else if (courier.origin == null) {
            rej({
                message: dictionary.errorMessages.nullOrEmptyOrigin
            }, responseCode.BAD_REQUEST);
        } else if (courier.weight == null) {
            rej({
                message: dictionary.errorMessages.invalidLuggageCapacity,
                statusCode: responseCode.BAD_REQUEST
            });
        } else if (courier.weight < 0) {
            rej({
                message: dictionary.errorMessages.negativeBaggage,
                statusCode: responseCode.BAD_REQUEST
            });
        } else {
            model.create(courier)
                .then(res)
                .catch((err) => {
                    rej({
                        message: dictionary.errorMessages.systemError,
                        statusCode: responseCode.SERVER_ERROR
                    });
                });
        }
    });
};

function gets(query, options, pageIndex, pageSize, req) {
    var dictionary = _dictionary(req);
    if (pageIndex == undefined) {
        pageIndex = 0;
    }
    if (pageSize == undefined) {
        pageSize = 20;
    }
    return model.find(query, options)
        .limit(parseInt(pageSize))
        .skip(parseInt(pageIndex) * parseInt(pageSize));
}

model.getList = (pageIndex, pageSize, req) => {
    var dictionary = _dictionary(req);
    return new Promise((res, rej) => {
        gets({}, {}, pageIndex, pageSize, req)
            .sort({
                price: 1
            })
            .exec()
            .then(res)
            .catch((err) => {
                rej({
                    message: dictionary.errorMessages.systemError,
                    statusCode: responseCode.SERVER_ERROR
                });
            });;
    });
};

model.search = (originDate, destination, origin, weight, pageSize, pageIndex, req) => {
    const query = {
        $and: []
    };
    if (originDate != null) {
        query.$and.push({
            originDate: { $gte: originDate }
        });
    }
    if (destination != null) {
        query.$and.push({
            destination: destination
        });
    }
    if (origin != null) {
        query.$and.push({
            origin: origin
        });
    }
    if (weight != null) {
        query.$and.push({
            weight: { $gte: weight }
        });
    }
    return new Promise((res, rej) => {
        gets(query, {}, pageIndex, pageSize, req)
            .sort({
                price: 1
            })
            .exec()
            .then(res)
            .catch((err) => {
                rej({
                    message: dictionary.errorMessages.systemError,
                    statusCode: responseCode.SERVER_ERROR
                });
            })
    });
}

model.getListById = (idArray, req) => {
    var dictionary = _dictionary(req);
    return new Promise((res, rej) => {
        const query = {
            _id: { $in: idArray }
        };
        model.find(query)
            .exec()
            .then(res)
            .catch((err) => {
                rej({
                    message: dictionary.errorMessages.systemError,
                    statusCode: responseCode.SERVER_ERROR
                });
            });;
    });
}

model.getDestinationDateById = (id, req) => {
    var dictionary = _dictionary(req);
    return new Promise((res, rej) => {
        const query = {
            _id: { $eq: id }
        };
        const projection = {
            destinationDate: 1,
            ownerId: 1
        }
        model.findOne(query, projection)
            .exec()
            .then(res)
            .catch((err) => {
                rej({
                    message: dictionary.errorMessages.systemError,
                    statusCode: responseCode.SERVER_ERROR
                });
            });;
    });
}

model.getById = (id, req) => {
    var dictionary = _dictionary(req);
    return new Promise((res, rej) => {
        model.findById(id)
            .exec()
            .then(res)
            .catch((err) => {
                rej({
                    message: dictionary.errorMessages.systemError,
                    statusCode: responseCode.SERVER_ERROR
                });
            });
    });
}

module.exports = model;