const User = require("../models/User.model");
const sendEmail = require("../utils/email/sendEmail");
const https = require("https");
const qs = require("querystring");
const Event = require("../models/event.model");

const {
  addSalesMan,
  addAccountant
} = require("../services/auth.service");
const booking = require("../models/booking.model");

// Controller function to direct to the appropriate page
const pageDirector = async (req, res, next) => {
  try {
    const result = await Event.find().sort({ date: -1 });
    const book = await booking.find().sort({ createdAt: -1 });
    const user = await User.findById(req.params.user_id); // Await the findById() function call
    if (user) {
      if (user.personType === "manager") {
        const User_all = await User.find();
        res.render("../views/manager", {Event2:result, Events: result, user: User_all, booking: book, title: "Manager" });
      }
      else if (user.personType === "vendor") {
        res.render("../views/vendor", {Event2:result, Events: result, user: user, booking: book, title: "SalesMan" });
      }
      else if (user.personType === "accountant") {
        res.render("../views/accountant", {Event2:result, Events: result, user: user, booking: book, title: "Accountant" });
      }
      else {
        res.render("../views/customer", {Event2:result, Events: result, booking: book, user: user, title: "Customer" });
      }
    }
    else {
      const referer = req.headers.referer || '/';
      return res.send(
        `<script>alert("Unable to detect User Type. Kindly try again later or contact Admin"); window.location.href = '${referer}';</script>`
      ).status(404);
    }
  } catch (error) {
    console.log(error);
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert("Unable to detect User Type. Kindly try again later or contact Admin"); window.location.href = '${referer}';</script>`
    ).status(404);
  }
};

const getSearchResults = async (req, res, next) => {
  try {
    const searchText = req.query.searchText;
    const book = await booking.find().sort({ createdAt: -1 });
    const isDate = !isNaN(Date.parse(searchText)); // Check if searchText is a valid date

    // Constructing the query object dynamically based on user input
    const query = {
      $or: [
        { title: { $regex: searchText, $options: "i" } }, // Search by title
        { brief: { $regex: searchText, $options: "i" } }, // Search by brief
        { details: { $regex: searchText, $options: "i" } }, // Search by details
        { Performer: { $regex: searchText, $options: "i" } }, // Search by performer
        { Guests: { $regex: searchText, $options: "i" } }, // Search by guest
        { Organisers: { $regex: searchText, $options: "i" } }, // Search by organiser
        { Auditorium: { $regex: searchText, $options: "i" } }, // Search by auditorium
        { Location: { $regex: searchText, $options: "i" } }, // Search by location
      ],
    };

    // If searchText is a valid date, add date search condition to the query
    if (isDate) {
      query.$or.push({ date: new Date(searchText) });
    }

    // Execute the query against the Event model
    const searchResults = await Event.find(query).limit(20);
    try {
      const result = await Event.find().sort({ date: -1 });
      const user = await User.findById(req.params.user_id);
      if (user) {
        if (user.personType === "manager") {
          const User_all = await User.find();
          res.render("../views/manager", {Event2:result, Events: searchResults, booking: book, user: User_all, title: "Manager" });
        }
        else if (user.personType === "vendor") {
          res.render("../views/vendor", {Event2:result, Events: searchResults, booking: book, user: user, title: "SalesMan" });
        }
        else if (user.personType === "accountant") {
          res.render("../views/vendor", {Event2:result, Events: searchResults, booking: book, user: user, title: "SalesMan" });
        }
        else {
          res.render("../views/customer", {Event2:result, Events: searchResults, booking: book, user: user, title: "Customer" });
        }
      }
      else {
        const referer = req.headers.referer || '/';
        return res.send(
          `<script>alert("Unable to detect User Type. Kindly try again later or contact Admin"); window.location.href = '${referer}';</script>`
        ).status(404);
      }
    } catch (error) {
      console.log(error);
      const referer = req.headers.referer || '/';
      return res.send(
        `<script>alert("Unable to detect User Type. Kindly try again later or contact Admin"); window.location.href = '${referer}';</script>`
      ).status(404);
    }
  } catch (error) {
    console.log(error);
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert("Unable to search on the current data"); window.location.href = '${referer}';</script>`
    ).status(500);
  }
};

const getEventDetails = async (req, res, next) => {
  try {
    const result = await Event.findOne({ _id: req.params.event_id });
    res.render('../views/details2', { Events: result, titles: 'Details' });
  } catch (error) {
    console.log(error);
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert("Unable to load all the data please try again later or Contact Administrator"); window.location.href = '${referer}';</script>`
    ).status(500);
  }
};

// Controller function to display profile details
const getProfile = (req, res) => {
  const id = req.params.user_id;
  User.findById(id)
    .then((result) => {
      const formattedDate = result.dateOfBirth.toISOString().split("T")[0];
      res.render("../views/profile", { user: result, formattedDate: formattedDate, title: "Profile" });
    })
    .catch((err) => {
      console.log(err);
      const referer = req.headers.referer || '/';
      return res.send(
        `<script>alert("Unable to Load the Profile, Try again Later"); window.location.href = '${referer}';</script>`
      ).status(500);
    });
};

// Controller function to edit profile
const editProfile = (req, res) => {
  const id = req.params.user_id;
  const newData = req.body;
  console.log("Received request to update profile:", id, newData);

  User.findByIdAndUpdate(id, newData, { new: true })
    .then((updatedProfile) => {
      // sendEmail(
      //   updatedProfile.email,
      //   "Successfully Edited Your Profile",
      //   { name: updatedProfile.name },
      //   "./template/EditProfile.handlebars"
      // );
      res.json(updatedProfile);
    })
    .catch((err) => {
      console.log(err);
      const referer = req.headers.referer || '/';
      return res.send(
        `<script>alert("Unable to Edit the Profile, Try again Later"); window.location.href = '${referer}';</script>`
      ).status(500);
    });
};

const getaddvendor = async (req, res, next) => {
  try {
    const userId = req.params.user_id;
    let user = await User.findOne({ _id: userId });
    if (user.personType !== 'manager') {
      const referer = req.headers.referer || '/';
      return res.send(
        `<script>alert("You are not authorised for this page"); window.location.href = '${referer}';</script>`
      ).status(500);
    }
    res.render("../views/addvendor", { userId: userId, title: "Add SalesPerson" });
  }
  catch (error) {
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert("Error in getting SalesPerson Adder Page"); window.location.href = '${referer}';</script>`
    ).status(401);
  }
};

const postaddvendor = async (req, res, next) => {
  try {
    await addSalesMan(req.body);
    const userId = req.params.user_id; // Extract user_id from request parameters
    const redirectUrl = `/index/${userId}`; // Construct redirect URL
    const alertMessage = "Successfully Added the SalesPerson";
    const script = `<script>alert("${alertMessage}"); window.location.href = "${redirectUrl}";</script>`;
    return res.send(script).status(200);
  } catch (error) {
    console.error(error);
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert('${error.message}'); window.location.href = '${referer}';</script>`
    ).status(401);
  }
};

const getaddAccountant = async (req, res, next) => {
  try {
    const userId = req.params.user_id;
    let user = await User.findOne({ _id: userId });
    if (user.personType !== 'manager') {
      const referer = req.headers.referer || '/';
      return res.send(
        `<script>alert("You are not authorised for this page"); window.location.href = '${referer}';</script>`
      ).status(500);
    }
    res.render("../views/addAccountant", { userId: userId, title: "Add Accountant" });
  }
  catch (error) {
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert("Error in getting Accountant Adder Page"); window.location.href = '${referer}';</script>`
    ).status(401);
  }
};

const postaddAccountant = async (req, res, next) => {
  try {
    await addAccountant(req.body);
    const userId = req.params.user_id; // Extract user_id from request parameters
    const redirectUrl = `/index/${userId}`; // Construct redirect URL
    const alertMessage = "Successfully Added the Accountant";
    const script = `<script>alert("${alertMessage}"); window.location.href = "${redirectUrl}";</script>`;
    return res.send(script).status(200);
  } catch (error) {
    console.error(error);
    const referer = req.headers.referer || '/';
    return res.send(
      `<script>alert('${error.message}'); window.location.href = '${referer}';</script>`
    ).status(401);
  }
};

const addNewEvent = async (req, res, next) => {
  try {
    // Parse the input data
    const {
      title,
      brief,
      length,
      details,
      date,
      time,
      guests,
      performer,
      organiser,
      // auditorium,
      // location,
      price_balcony,
      price_normal,
      vip_tickets_balcony,
      vip_tickets_normal,
      vendor_comission,
    } = req.body;

    let length_new = parseInt(length);
    length_new = length_new ? length_new + 1 : 0;

    // Split guests, performer, organiser inputs into arrays if provided
    const guestsArray = guests ? guests.split(',').map(guest => guest.trim()) : [];
    const performerArray = performer ? performer.split(',').map(performer => performer.trim()) : [];
    const organiserArray = organiser ? organiser.split(',').map(organiser => organiser.trim()) : [];

    // Calculate the number of VIP tickets if provided
    const totalVIPBalconyTickets = vip_tickets_balcony ? vip_tickets_balcony.split(',').length : 0;
    const totalVIPNormalTickets = vip_tickets_normal ? vip_tickets_normal.split(',').length : 0;

    const vip_tickets_normal_array = vip_tickets_normal ? vip_tickets_normal.split(',') : [];
    const vip_tickets_balcony_array = vip_tickets_balcony ? vip_tickets_balcony.split(',') : [];

    // Convert date and time inputs into a single Date object
    const eventDate = new Date(`${date}T${time}`);
    const eventEndDate = new Date(eventDate.getTime() + (parseInt(length_new) * 60 * 60 * 1000)); // Calculate end time of the event

    const clashingEvent = await Event.findOne({
      $or: [
        {
          $and: [
            { date: { $lte: eventDate } }, // Start time is less than eventDate
            { $expr: { $gt: [{ $add: ['$date', { $multiply: ['$length', 60 * 60 * 1000] }] }, eventDate] } } // End time is greater than eventDate
          ]
        },
        {
          $and: [
            { date: { $lt: eventEndDate } }, // Start time is less than eventEndDate
            { $expr: { $gte: [{ $add: ['$date', { $multiply: ['$length', 60 * 60 * 1000] }] }, eventEndDate] } } // End time is greater than eventEndDate
          ]
        },
        {
          $and: [
            { date: { $gte: eventDate } }, // Start time is greater than eventDate
            { $expr: { $lte: [{ $add: ['$date', { $multiply: ['$length', 60 * 60 * 1000] }] }, eventEndDate] } } // End time is less than eventEndDate
          ]
        }
      ]
    });

    if (clashingEvent) {
      const referer = req.headers.referer || '/';
      return res.send(
        `<script>alert("Time is Clashing with another Events Time. Kindly enter a new time."); window.location.href = '${referer}';</script>`
      ).status(500);
    }

    // Calculate the ticket numbers left and tickets left for balcony and normal
    const ticketNumbersLeft = { balcony: [], normal: [] };
    const ticketsLeft = { balcony: 0, normal: 0 };
    for (let i = 1; i <= 100; i++) {
      if (i <= 30) {
        if (!vip_tickets_balcony || vip_tickets_balcony_array.indexOf(i.toString()) == -1) {
          ticketNumbersLeft.balcony.push(i);
          ticketsLeft.balcony++;
        }
      } else {
        if (!vip_tickets_normal || vip_tickets_normal_array.indexOf(i.toString()) == -1) {
          ticketNumbersLeft.normal.push(i);
          ticketsLeft.normal++;
        }
      }
    }

    const userId = [];

    // Create the event object
    const event = new Event({
      title: title,
      brief: brief,
      details: details,
      date: eventDate,
      Performer: performerArray,
      Guests: guestsArray,
      Organisers: organiserArray,
      // Auditorium: auditorium,
      // Location: location,
      length: length_new,
      price: { balcony: price_balcony, normal: price_normal },
      vip_tickets: { balcony: totalVIPBalconyTickets, normal: totalVIPNormalTickets },
      tickets_sold: { balcony: 0, normal: 0 },
      ticketsleft: ticketsLeft,
      vendor_id: { balcony: [], normal: [] },
      vendor_tickets: { balcony: [], normal: [] },
      vendor_comission: vendor_comission,
      ticketNumbersLeft: ticketNumbersLeft,
      ticketNumbersSold: { balcony: [], normal: [] },
      userId: userId,
      expen_Stage_Management: 0,
      expen_Sound_Engineer: 0,
      expen_Light_Engineer: 0,
      expen_Catering: 0,
      expen_Security: 0,
      expen_Marketing: 0,
      expen_Cleaning: 0,
      expen_Other: 0,
      expen_Performner: [],
    });

    // Save the event
    await event.save();

    // Redirect to the previous page with a success message
    const user_Id = req.params.user_id; // Extract user_id from request parameters
    const redirectUrl = `/index/${user_Id}`; // Construct redirect URL
    const alertMessage = "Successfully Added the Event";
    const script = `<script>alert("${alertMessage}"); window.location.href = "${redirectUrl}";</script>`;
    return res.send(script).status(200);
  } catch (error) {
    console.error(error);
    // Redirect to the previous page with an error message
    return res.send(
      `<script>alert('${error.message}'); window.location.href = '${referer}';</script>`
    ).status(401);
  }
};

module.exports = {
  pageDirector,
  getSearchResults,
  getEventDetails,
  getProfile,
  editProfile,
  getaddvendor,
  postaddvendor,
  getaddAccountant,
  postaddAccountant,
  addNewEvent
};