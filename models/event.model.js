const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    length: {
        type: Number,
        required: true,
        default: 0
    },
    title: {
        type: String,
        required: true,
        trim: true,
        default: "No title available"
    },
    brief: {
        type: String,
        required: true,
        trim: true,
        default: "No brief available"
    },
    details: {
        type: String,
        required: true,
        trim: true,
        default: "No details available"
    },
    Performer: {
        type: [String],
        required: true,
        trim: true,
        default: []
    },
    Guests: {
        type: [String],
        required: true,
        trim: true,
        default: []
    },
    Organisers: {
        type: [String],
        required: true,
        trim: true,
        default: []
    },
    // Auditorium: {
    //     type: String,
    //     required: true,
    //     trim: true,
    //     default: "No auditorium available"
    // },
    // Location: {
    //     type: String,
    //     required: true,
    //     trim: true,
    //     default: "No location available"
    // },
    price: {
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
    vip_tickets: {
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
    tickets_sold: {
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
    ticketsleft: {
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
    vendor_id: {
        balcony: {
            type: [Schema.Types.ObjectId],
            ref: 'user',
            required: true,
            default: null
        },
        normal: {
            type: [Schema.Types.ObjectId],
            ref: 'user',
            required: true,
            default: null
        }
    },
    vendor_tickets: {
        balcony: {
            type: [Number],
            required: true,
            default: null
        },
        normal: {
            type: [Number],
            required: true,
            default: null
        }
    },
    vendor_cancelled:{
        balcony: {
            type: [Number],
            required: true,
            default: []
        },
        normal: {
            type: [Number],
            required: true,
            default: []
        }
    },
    vendor_comission: {
        type: Number,
        default: 0,
        required: true
    },
    ticketNumbersLeft: {
        balcony: {
            type: [Number],
            default: [],
            required: true
        },
        normal: {
            type: [Number],
            default: [],
            required: true
        }
    },
    ticketNumbersSold: {
        balcony: {
            type: [Number],
            default: [],
            required: true
        },
        normal: {
            type: [Number],
            default: [],
            required: true
        }
    },
    userId: {
        type: [Schema.Types.ObjectId],
        ref: 'user',
        required: true,
        default: null
    },
    expen_Stage_Management: {
        type: Number,
        default: 0,
        required: true,
    },
    expen_Sound_Engineer: {
        type: Number,
        default: 0,
        required: true,
    },
    expen_Light_Engineer: {
        type: Number,
        default: 0,
        required: true,
    },
    expen_Catering: {
        type: Number,
        default: 0,
        required: true,
    },
    expen_Security: {
        type: Number,
        default: 0,
        required: true,
    },
    expen_Marketing: {
        type: Number,
        default: 0,
        required: true,
    },
    expen_Cleaning: {
        type: Number,
        default: 0,
        required: true,
    },
    expen_Other: {
        type: Number,
        default: 0,
        required: true,
    },
    expen_Performer: {
        type: [Number],
        default: function() {
            return new Array(this.Performer.length).fill(0);
        },
        required: true
    },
    extra_Amount: {
        type: Number,
        default: 0,
        required: true
    },
}, { timestamps: true });

const Event = mongoose.model('event', EventSchema);
module.exports = Event;