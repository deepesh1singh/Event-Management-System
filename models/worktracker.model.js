const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const worktrackSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    event_id:{
        type: Schema.Types.ObjectId,
        ref: 'event',
        required: true
    },
    booking_id:{
        type: Schema.Types.ObjectId,
        ref: 'booking',
        required: true
    },
    workDone:{
        type: String,
        required: true,
        enum : ['Ticket_Booking','Ticket_Cancellation']
    }
}, { timestamps: true });

const worktrack = mongoose.model('worktrack', worktrackSchema);
module.exports = worktrack;