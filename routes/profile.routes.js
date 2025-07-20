const express = require("express");
const router = express.Router();

const {
    getSearchResults,
    pageDirector,
    getEventDetails,
    getProfile,
    getaddvendor,
    postaddvendor,
    getaddAccountant,
    postaddAccountant,
    editProfile,
    addNewEvent
} = require("../controllers/users.controller");

const { generatepdf } = require("../controllers/pdf.controller");
const sendEmail = require("../utils/email/sendEmail");

const Events = require("../models/event.model");
const User = require("../models/User.model");
const worktrack = require("../models/worktracker.model");
const Booking = require('../models/booking.model');

router.get("/:user_id", pageDirector);
router.get("/:user_id/vendor", getaddvendor);
router.post("/:user_id/vendor", postaddvendor);
router.get("/:user_id/Accountant", getaddAccountant);
router.post("/:user_id/Accountant", postaddAccountant);
router.get("/:user_id/cancelTicket", async (req, res) => {
    const book = await Booking.find();
    const user_Id = await req.params.user_id;
    res.render("../views/cancelTicket", { booking: book, userId: user_Id, title: "Cancel Ticket" });
});

router.get("/:user_id/:event_id/addExpenditure", async (req, res) => {
    const event = await Events.findOne({ _id: req.params.event_id });
    res.render("../views/AddExpenditure", { userId: req.params.user_id, eventId: req.params.event_id, event: event, title: "Add Expenditure" });
});

router.patch("/:user_id/:event_id/addExpenditure", async (req, res) => {
    const userId = req.params.user_id;
    const eventId = req.params.event_id;
    const {
        expen_Stage_Management,
        expen_Sound_Engineer,
        expen_Light_Engineer,
        expen_Catering,
        expen_Security,
        expen_Marketing,
        expen_Cleaning,
        expen_Other,
        expen_Performer
    } = req.body;

    try {
        console.log(req.body);

        let event = {}

        if (expen_Stage_Management.length > 0) {
            event.expen_Stage_Management = expen_Stage_Management;
        }
        if (expen_Sound_Engineer.length > 0) {
            event.expen_Sound_Engineer = expen_Sound_Engineer;
        }
        if (expen_Light_Engineer.length > 0) {
            event.expen_Light_Engineer = expen_Light_Engineer;
        }
        if (expen_Catering.length > 0) {
            event.expen_Catering = expen_Catering;
        }
        if (expen_Security.length > 0) {
            event.expen_Security = expen_Security;
        }
        if (expen_Marketing.length > 0) {
            event.expen_Marketing = expen_Marketing;
        }
        if (expen_Cleaning.length > 0) {
            event.expen_Cleaning = expen_Cleaning;
        }
        if (expen_Other.length > 0) {
            event.expen_Other = expen_Other;
        }
        if (expen_Performer.length > 0) {
            event.expen_Performer = expen_Performer;
        }

        // Find and update the event
        const updatedEvent = await Events.findByIdAndUpdate(eventId, event, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        } else {
            console.log("Event updated successfully");
            return res.status(200).json(updatedEvent);
        }
    } catch (err) {
        console.error("Error updating event:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:user_id/yearWiseReport", async (req, res, next) => {
    const userId = req.params.user_id;
    let user = await User.findOne({ _id: userId });
    if (user.personType !== 'manager') {
        const referer = req.headers.referer || '/';
        return res.send(
            `<script>alert("You are not authorised for this page"); window.location.href = '${referer}';</script>`
        ).status(500);
    }
    try {
        const events = await Events.find({});
        let revenue = [];
        let companyExpenditure = [];
        let vendorExpenditure = [];
        let gained = [];
        let total_revenue = 0;
        let total_companyExpenditure = 0;
        let total_vendorExpenditure = 0;
        let total_gained = 0;

        const uniqueYears = new Set(); // Using Set to ensure uniqueness

        for (let i = 0; i < events.length; i++) {
            const eventYear = events[i].date.getFullYear();
            uniqueYears.add(eventYear);
        }

        const sortedUniqueYears = Array.from(uniqueYears).sort((a, b) => a - b);

        // Initialize arrays for revenue, companyExpenditure, vendorExpenditure, and gained
        for (let i = 0; i < sortedUniqueYears.length; i++) {
            revenue.push(0);
            companyExpenditure.push(0);
            vendorExpenditure.push(0);
            gained.push(0);
        }

        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const eventYear = event.date.getFullYear();
            const index = sortedUniqueYears.indexOf(eventYear);

            // Calculate values
            let expen_Performer = event.expen_Performer.reduce((acc, val) => acc + val, 0);
            let totalVendorTickets = event.vendor_tickets.balcony.reduce((acc, val) => acc + val, 0) +
                event.vendor_tickets.normal.reduce((acc, val) => acc + val, 0);
            let expen_Vendor = totalVendorTickets * event.vendor_comission;
            const eventRevenue = event.tickets_sold.balcony * event.price.balcony + event.tickets_sold.normal * event.price.normal + event.extra_Amount;
            const eventCompanyExpenditure = event.expen_Stage_Management + event.expen_Sound_Engineer + event.expen_Light_Engineer +
                event.expen_Catering + event.expen_Security + event.expen_Marketing + event.expen_Cleaning + event.expen_Other + expen_Performer;

            // Accumulate values at respective indices
            revenue[index] += eventRevenue;
            companyExpenditure[index] += eventCompanyExpenditure;
            vendorExpenditure[index] += expen_Vendor;
            gained[index] += eventRevenue - eventCompanyExpenditure - expen_Vendor;

            // Accumulate total values
            total_revenue += eventRevenue;
            total_companyExpenditure += eventCompanyExpenditure;
            total_vendorExpenditure += expen_Vendor;
            total_gained += eventRevenue - eventCompanyExpenditure - expen_Vendor;

        }

        res.render("../views/yearWiseReport", {
            revenue: revenue,
            companyExpenditure: companyExpenditure,
            vendorExpenditure: vendorExpenditure,
            gained: gained,
            totalRevenue: total_revenue,
            totalCompanyExpenditure: total_companyExpenditure,
            totalVendorExpenditure: total_vendorExpenditure,
            totalGained: total_gained,
            arrayOFyear: sortedUniqueYears
        });
    } catch (err) {
        console.error("Error retrieving events:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:user_id/AddEvent", (req, res) => {
    res.render("../views/AddEvent", { userId: req.params.user_id, title: "Add Event" });
});
router.post("/:user_id/AddEvent", addNewEvent);

router.get("/:user_id/search", getSearchResults);
router.get("/:user_id/details/:event_id", getEventDetails);

router.get("/:user_id/search_salesperson", async (req, res) => {
    try {
        const userId = req.query.searchText;

        // Check if userId is provided
        if (!userId) {
            const referer = req.headers.referer || '/';
            return res.send(
                `<script>alert("User ID is required"); window.location.href = '${referer}';</script>`
            ).status(400);
        }

        // Search for the user by ID
        const user = await User.findById(userId);

        if (!user) {
            const referer = req.headers.referer || '/';
            return res.send(
                `<script>alert("User Not found Enter a correct Id"); window.location.href = '${referer}';</script>`
            ).status(404);
        }

        // Search for worktracks associated with the user
        const worktracks = await worktrack.find({ user_id: userId }).sort({ createdAt: -1 });

        // Render the sales.ejs view with user and worktracks data
        res.render('../views/sales', { user, worktracks });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/:user_id/yearlyreport", async (req, res) => {
    try {
        const year = req.query.searchText; // Get the year from the request query string
        const startDate = new Date(year, 0, 1); // Start of the year
        const endDate = new Date(year, 11, 31, 23, 59, 59); // End of the year

        // Search events within the specified year
        const events = await Events.find({
            date: { $gte: startDate, $lte: endDate }
        }).exec();

        // Extract event IDs from the selected events
        const eventIds = events.map(event => event._id);

        // Find worktrack entries with event IDs matching the selected events
        const worktracker = await worktrack.find({ event_id: { $in: eventIds } }).sort({ createdAt: -1 });

        // Initialize variables for calculations
        let totalExpenditure = 0;
        let totalVendorPayment = 0;
        let totalRevenue = 0;

        // Iterate over each event to calculate totals
        events.forEach(event => {
            // Calculate total expenditure for each event
            const expenditure = event.expen_Stage_Management +
                event.expen_Sound_Engineer +
                event.expen_Light_Engineer +
                event.expen_Catering +
                event.expen_Security +
                event.expen_Marketing +
                event.expen_Cleaning +
                event.expen_Other +
                event.expen_Performer.reduce((acc, cur) => acc + cur, 0);
            totalExpenditure += expenditure;

            // Calculate total amount payable to vendors for each event
            const vendorPayment = event.vendor_tickets.balcony.reduce((acc, cur) => acc + cur, 0) +
                event.vendor_tickets.normal.reduce((acc, cur) => acc + cur, 0);
            totalVendorPayment += vendorPayment * event.vendor_comission;

            // Calculate total revenue for each event
            const revenue = event.price.balcony * event.tickets_sold.balcony +
                event.price.normal * event.tickets_sold.normal +
                event.extra_Amount;
            totalRevenue += revenue;
        });

        // Calculate total company profit
        const totalCompanyProfit = totalRevenue - totalVendorPayment - totalExpenditure;

        // Render the view and pass the calculated data
        res.render('../views/yearlyreport', {
            events: events,
            totalExpenditure: totalExpenditure,
            totalVendorPayment: totalVendorPayment,
            totalRevenue: totalRevenue,
            totalCompanyProfit: totalCompanyProfit,
            worktracker: worktracker
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get("/:user_id/deleteuser", async (req, res) => {
    let userId = req.params.user_id;
    let user = await User.findOne({ _id: userId });
    if (user.personType !== 'manager') {
        const referer = req.headers.referer || '/';
        return res.send(
            `<script>alert("You are not authorised for this page"); window.location.href = '${referer}';</script>`
        ).status(500);
    }
    res.render("../views/deleteuser", { title: "Delete User" });
});

router.patch("/:user_id/deleteuser", async (req, res) => {
    try {
        const { email, ID } = req.body;

        if (!email && !ID) {
            return res.send(
                `<script>alert("Please enter at least one of the fields");</script>`
            ).status(500);
        }
        let user = null;
        if (!ID) {
            user = await User.findOne({ email: email });
        }
        else if (!email) {
            user = await User.findOne({ _id: ID });
        }
        if (!user) {
            return res.send(
                `<script>alert("User Not Found");</script>`
            ).status(500);
        }
        if (user.personType === 'manager') {
            return res.send(
                `<script>alert("You can't delete manager");</script>`
            ).status(500);
        }
        user.is_deleted = true;
        await user.save();
        sendEmail(user.email, "Account Suspended", { name: user.name }, "./template/restoreAccount.handlebars");
        res.send(
            `<script>alert("User Deleted Successfully");</script>`
        ).status(200);
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.send(
            `<script>alert("Error Deleting User. Try again later");</script>`
        ).status(500);
    }
});

router.get("/:user_id/restore_user", async (req, res) => {
    let userId = req.params.user_id;
    let user = await User.findOne({ _id: userId });
    if (user.personType !== 'manager') {
        const referer = req.headers.referer || '/';
        return res.send(
            `<script>alert("You are not authorised for this page"); window.location.href = '${referer}';</script>`
        ).status(500);
    }
    res.render("../views/restoreuser", { title: "Restore User" });
});

router.patch("/:user_id/restore_user", async (req, res) => {
    try {
        const { email, ID } = req.body;

        if (!email && !ID) {
            return res.send(
                `<script>alert("Please enter at least one of thfe fields");</script>`
            ).status(500);
        }
        let user = null;
        if (!ID) {
            user = await User.findOne({ email: email });
        }
        else if (!email) {
            user = await User.findOne({ _id: ID });
        }
        if (!user) {
            return res.send(
                `<script>alert("User Not Found");</script>`
            ).status(500);
        }
        user.is_deleted = false;
        await user.save();
        sendEmail(user.email, "Account Restored", { name: user.name }, "./template/restoreAccount.handlebars");
        res.send(
            `<script>alert("User Restored Successfully");</script>`
        ).status(200);
    } catch (error) {
        console.error("Error restoring user:", error);
        return res.send(
            `<script>alert("Error Restoring User. Try again later");</script>`
        ).status(500);
    }
});

router.get("/:user_id/userlist", async (req, res) => {
    let userId = req.params.user_id;
    let user = await User.findOne({ _id: userId });
    if (user.personType !== 'manager') {
        const referer = req.headers.referer || '/';
        return res.send(
            `<script>alert("You are not authorised for this page"); window.location.href = '${referer}';</script>`
        ).status(500);
    }
    const users = await User.find();
    res.render("../views/userlist", { users: users, title: "User List" });
});

router.get("/:user_id/details/:event_id/booking", async (req, res) => {
    const event_id = await req.params.event_id;
    const user_id = await req.params.user_id;
    const user = await User.findOne({ _id: user_id });
    const event = await Events.findOne({ _id: event_id });
    res.render("../views/booking", { title: "Booking", user_id: user_id, event_id: event_id, event: event, user: user });
});

router.patch("/:user_id/details/:event_id/booking/:ticket_id", async (req, res) => {
    try {
        const user_id = await req.params.user_id;
        const event_id = await req.params.event_id;
        const ticket_id = await req.params.ticket_id;
        const { balconySeats, normalSeats, selectedBalconySeats, selectedNormalSeats } = req.body;

        console.log("Event editing data: ", req.body);

        // Find the event document
        const event = await Events.findById(event_id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Update tickets_sold and ticketsleft
        event.tickets_sold.balcony += balconySeats;
        event.tickets_sold.normal += normalSeats;
        event.ticketsleft.balcony -= balconySeats;
        event.ticketsleft.normal -= normalSeats;


        event.ticketNumbersSold.balcony = event.ticketNumbersSold.balcony.concat(selectedBalconySeats.map(Number));
        event.ticketNumbersSold.normal = event.ticketNumbersSold.normal.concat(selectedNormalSeats.map(Number));

        event.ticketNumbersLeft.balcony = event.ticketNumbersLeft.balcony.filter(seat => !selectedBalconySeats.includes(String(seat)));
        event.ticketNumbersLeft.normal = event.ticketNumbersLeft.normal.filter(seat => !selectedNormalSeats.includes(String(seat)));

        // Check if the user is a vendor
        const user = await User.findById(user_id);
        let vendorIndex = -1;
        vendorIndex = event.userId.indexOf(user_id);
        if (vendorIndex === -1) {
            event.userId.push(user_id);
        }

        if (user && user.personType === 'vendor') {
            vendorIndex = event.vendor_id.balcony.indexOf(user_id);

            if (vendorIndex !== -1) {
                event.vendor_tickets.balcony[vendorIndex] += balconySeats;
            } else {
                event.vendor_id.balcony.push(user_id);
                event.vendor_tickets.balcony.push(balconySeats);
                event.vendor_cancelled.balcony.push(0);
            }

            vendorIndex = event.vendor_id.normal.indexOf(user_id);

            if (vendorIndex !== -1) {
                event.vendor_tickets.normal[vendorIndex] += normalSeats;
            } else {
                event.vendor_id.normal.push(user_id);
                event.vendor_tickets.normal.push(normalSeats);
                event.vendor_cancelled.normal.push(0);
            }
        }

        // Save the modified event document
        const updatedEvent = await event.save();

        const updatedUser = await User.findOneAndUpdate(
            { _id: user_id },
            { $push: { tickets_ids: ticket_id } },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        else {
            console.log("Event and User updated successfully");
            res.status(200).json(updatedEvent);
        }
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/:user_id/details/:event_id/booking", async (req, res) => {
    try {
        const { user_id, event_id } = req.params;
        const { name, balconySeats, normalSeats, selectedBalconySeats, selectedNormalSeats } = req.body;
        console.log("Booking data2: ", req.body);

        const user = await User.findOne({ _id: user_id });
        const event = await Events.findOne({ _id: event_id });

        // Create a new booking document
        const newBooking = new Booking({
            issuerName: name,
            ticket_id: event_id,
            NumberOfTickets: {
                balcony: balconySeats,
                normal: normalSeats
            },
            seatNumbers: {
                balcony: selectedBalconySeats,
                normal: selectedNormalSeats
            }
        });

        // Save the new booking
        const savedBooking = await newBooking.save();
        console.log("New booking saved: ", savedBooking);

        if (savedBooking) {
            const newTrack = new worktrack({
                name: user.name,
                user_id: user._id,
                event_id: event._id,
                booking_id: savedBooking._id,
                workDone: "Ticket_Booking"
            });
            await newTrack.save();
            console.log("New worktrack saved: ", newTrack);
            res.status(200).json(savedBooking);
        }
        else {
            res.status(404).json({ message: "Booking not found" });
        }
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:user_id/details/:event_id/booking/:ticket_id/payment", async (req, res) => {
    const user_id = req.params.user_id;
    const event_id = req.params.event_id;
    const ticket_id = req.params.ticket_id;
    const user = await User.findOne({ _id: user_id });
    const event = await Events.findOne({ _id: event_id });
    const ticket = await Booking.findOne({ _id: ticket_id });
    res.render("../views/payment", { title: "Payment", user: user, event: event, ticket: ticket });
});

router.get("/:user_id/details/:event_id/booking/:ticket_id/payment/:email/download", generatepdf);

router.patch("/:user_id/details/:event_id/booking/:ticket_id/payment/delete", async (req, res) => {
    try {
        const user_id = await req.params.user_id;
        const event_id = await req.params.event_id;
        const ticket_id = await req.params.ticket_id;
        const booking = await Booking.findOne({ _id: req.params.ticket_id });
        const user = await User.findOne({ _id: req.params.user_id });
        const event = await Events.findOne({ _id: req.params.event_id });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.is_cancelled) {
            return res.status(505).json({ message: "The ticket has been already deleated" });
        }
        else {
            booking.is_cancelled = true;
            const updatedBooking = await booking.save();
            if (!updatedBooking) {
                return res.status(404).json({ message: "Booking not found" });
            }
            else {
                console.log("Booking updated successfully");
            }
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user && user.personType === 'customer') {
            // Remove the ticket_id from the user
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { tickets_ids: ticket_id } },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            else {
                console.log("User updated successfully");
            }
        }
        if (user && user.personType === 'vendor') {
            vendorIndex = event.vendor_id.balcony.indexOf(user_id);

            if (vendorIndex !== -1) {
                event.vendor_cancelled.balcony[vendorIndex] += 1;
            } else {
                event.vendor_id.balcony.push(user_id);
                event.vendor_tickets.balcony.push(0);
                event.vendor_cancelled.balcony.push(1);
            }

            vendorIndex = event.vendor_id.normal.indexOf(user_id);

            if (vendorIndex !== -1) {
                event.vendor_cancelled.normal[vendorIndex] += 1;
            } else {
                event.vendor_id.normal.push(user_id);
                event.vendor_tickets.normal.push(0);
                event.vendor_cancelled.normal.push(1);
            }
        }
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        for (let i = 0; i < booking.NumberOfTickets.balcony; i++) {
            const index = event.ticketNumbersSold.balcony.indexOf(booking.seatNumbers.balcony[i]);
            if (index !== -1) {
                event.ticketNumbersSold.balcony.splice(index, 1);
                event.ticketNumbersLeft.balcony.push(booking.seatNumbers.balcony[i]);
            }
        }

        for (let i = 0; i < booking.NumberOfTickets.normal; i++) {
            const index = event.ticketNumbersSold.normal.indexOf(booking.seatNumbers.normal[i]);
            if (index !== -1) {
                event.ticketNumbersSold.normal.splice(index, 1);
                event.ticketNumbersLeft.normal.push(booking.seatNumbers.normal[i]);
            }
        }

        // Update tickets sold and tickets left
        event.tickets_sold.balcony -= booking.NumberOfTickets.balcony;
        event.tickets_sold.normal -= booking.NumberOfTickets.normal;
        event.ticketsleft.balcony += booking.NumberOfTickets.balcony;
        event.ticketsleft.normal += booking.NumberOfTickets.normal;

        const eventDate = event.date; // Assuming you have the event date stored in the booking
        const currentDate = new Date();
        const differenceInTime = eventDate.getTime() - currentDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convert milliseconds to days

        // Calculate the refund amount based on the difference in days
        let removedAmount = 0;
        if (differenceInDays > 3) {
            removedAmount = 5 * (booking.NumberOfTickets.balcony + booking.NumberOfTickets.normal);
        } else if (differenceInDays >= 1 && differenceInDays <= 3) {
            // Deduct Rs. 10 for each ordinary ticket and Rs. 15 for each balcony ticket
            removedAmount = (10 * booking.NumberOfTickets.normal) + (15 * booking.NumberOfTickets.balcony);
        } else {
            removedAmount = 0.5 * ((event.price.normal * booking.NumberOfTickets.normal) + (event.price.balcony * booking.NumberOfTickets.balcony));
        }

        // If the event date has passed, no refund is provided
        if (differenceInDays < 0) {
            removedAmount = ((event.price.normal * booking.NumberOfTickets.normal) + (event.price.balcony * booking.NumberOfTickets.balcony));
        }
        let totalAmount = (event.price.normal * booking.NumberOfTickets.normal) + (event.price.balcony * booking.NumberOfTickets.balcony);
        let refundAmount = totalAmount - removedAmount;
        if (refundAmount < 0) {
            refundAmount = 0;
        }
        event.extra_Amount += removedAmount;
        savedEvent = await event.save();
        if (!savedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        else {
            console.log("Event updated successfully");
        }
        return res.status(200).json({ message: "Refund amount calculated successfully", refundAmount: refundAmount });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/:user_id/details/:event_id/booking/:ticket_id/worktrack", async (req, res) => {
    try {
        const { user_id, event_id, ticket_id } = req.params;
        const { workDone } = req.body;
        console.log("Worktrack data: ", req.body);

        const user = await User.findOne({ _id: user_id });
        const event = await Events.findOne({ _id: event_id });
        const booking = await Booking.findOne({ _id: ticket_id });

        // Create a new worktrack document
        const newWorktrack = new worktrack({
            name: user.name,
            user_id: user._id,
            event_id: event._id,
            booking_id: booking._id,
            workDone: workDone
        });

        // Save the new worktrack
        const savedWorktrack = await newWorktrack.save();
        console.log("New worktrack saved: ", savedWorktrack);

        if (savedWorktrack) {
            res.status(200).json({ message: "Worktrack created successfully" });
        }
        else {
            res.status(404).json({ message: "Worktrack not found" });
        }
    } catch (error) {
        console.error("Error creating worktrack:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:user_id/worktrack", async (req, res) => {
    let userId = req.params.user_id;
    let user = await User.findOne({ _id: userId });
    if (user.personType !== 'manager') {
        const referer = req.headers.referer || '/';
        return res.send(
            `<script>alert("You are not authorised for this page"); window.location.href = '${referer}';</script>`
        ).status(500);
    }
    const worktracks = await worktrack.find().sort({ createdAt: -1 });
    res.render("../views/worktracker", { title: "Worktrack", worktracks: worktracks });
});

// GET route to display profile details
router.get("/:user_id/profile", getProfile);

// PATCH route to edit profile
router.patch("/:user_id/profile", editProfile);

module.exports = router;