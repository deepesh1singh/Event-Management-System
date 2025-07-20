const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    issuerName: {
        type: String,
        required: true,
    },
    ticket_id:{
        type: Schema.Types.ObjectId,
        ref: 'event',
        required: true
    },   
    NumberOfTickets: {
        balcony: {
            type: Number,
            required: true,
            default: 0
        },
        normal: {
            type: Number,
            required: true,
            default: 0
        }
    },
    seatNumbers: {
        balcony: {
            type: [Number],
            required: true,
            default: []
        },
        normal: {
            type: [Number],
            required: true,
            default: []
        },
    },
    is_cancelled: {
        type: Boolean,
        required: true,
        default: false
    },
}, { timestamps: true });

const booking = mongoose.model('booking', bookingSchema);
module.exports = booking;