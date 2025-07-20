const puppeteer = require('puppeteer');
const path = require('path');
const Booking = require('../models/booking.model');
const User = require('../models/User.model');
const Event = require('../models/event.model');
const sendEmail = require("../utils/email/sendEmail");

const generatepdf = async (req, res, next) => {
    try {
        const ticket_id = await req.params.ticket_id;
        const user_id = await req.params.user_id;
        const event_id = await req.params.event_id;
        const email = await req.params.email;

        console.log(ticket_id);
        console.log(user_id);
        console.log(event_id);
        const booking = await Booking.findOne({ _id: ticket_id });
        const user = await User.findOne({ _id: user_id });
        const event = await Event.findOne({ _id: event_id });
        // Render PDF view using EJS template
        const renderedPdf = await new Promise((resolve, reject) => {
            res.render('../views/pdf', { book: booking, user: user, event: event, title: 'Booking Details' }, (err, rendered) => {
                if (err) reject(err);
                resolve(rendered);
            });
        });

        // Generate PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(renderedPdf, { waitUntil: 'networkidle0' }); // Wait for rendering
        await page.setViewport({ width: 1920, height: 1080 });
        const today = new Date();

        const pdfBuffer = await page.pdf({
            path: `${path.join(__dirname, '../public/pdfs', today.getTime() + ".pdf")}`,
            format: 'A4'
        });

        await browser.close();

        // Serve PDF for download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length
        });
        res.end(pdfBuffer);

        console.log("PDF sending to email", email);

        if (email !== "a@gmail.com") {
            sendEmail(
                email,
                "Successfully Bokked the ticket",
                { name: booking.issuerName },
                "./template/Booking.handlebars",
                pdfBuffer // Pass the PDF buffer here
            );
        }        

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    generatepdf
};