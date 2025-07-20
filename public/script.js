const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');
const resetForm = document.getElementById('resetForm');

function checkPassword() {
    let password = document.getElementById("password").value;
    let cnfrmPassword = document.getElementById("confirm-password").value;
    let message = document.getElementById("message");
    let submitBtn = document.querySelector('input[type="submit"]');

    if (password.length != 0) {
        if (password === cnfrmPassword) {
            message.textContent = "Password match";
            message.style.background = "#3ae374";
            submitBtn.disabled = false; // Enable the submit button
        } else {
            message.textContent = "Password don't match, Refresh the page and try again";
            message.style.background = "#ff4d4d";
            submitBtn.disabled = true; // Disable the submit button
        }
    } else {
        alert("password can't be empty!")
        message.textContent = "";
        submitBtn.disabled = true; // Disable the submit button if passwords are empty
    }
}

// profile part

function toggleEdit() {
    var profileForm = document.getElementById("profile-form");
    var editProfileForm = document.getElementById("edit-profile-form");
    var editProfileButton = document.getElementById("edit-profile-btn");

    profileForm.classList.add('hidden');
    editProfileForm.classList.remove('hidden');
}

function cancelEdit() {
    var profileForm = document.getElementById("profile-form");
    var editProfileForm = document.getElementById("edit-profile-form");

    editProfileForm.classList.add('hidden');
    profileForm.classList.remove('hidden');
}

function saveProfile() {

    var fullName = document.getElementById("full-name-edit").value;
    var email = document.getElementById("email-edit").value;
    var mobile = document.getElementById("mobile-edit").value;
    var age = document.getElementById("age-edit").value;
    var gender = document.getElementById("gender-edit").value;
    var dobInput = document.getElementById("dob-edit");
    var dob = dobInput.value; // Get the raw value from the input field

    if (dob) { // Check if the date is not empty
        // Parse the date in the required format
        var dobDate = new Date(dob);
        dob = dobDate.toISOString(); // Convert date to ISO string format
    }

    var xhr = new XMLHttpRequest();
    xhr.open("PATCH", window.location.pathname, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {

                window.location.href = window.location.pathname;
            } else {
                console.error("Error updating profile");
            }
        }
    };
    xhr.send(JSON.stringify({
        name: fullName,
        dateOfBirth: dob,
        email: email,
        mobileNumber: mobile,
        age: age,
        gender: gender,
    }));
}

function validateInputs() {
    var name = document.getElementById("Name").value.trim();
    var balconySeats = parseInt(document.getElementById("balconySeats").value);
    var normalSeats = parseInt(document.getElementById("normalSeats").value);
    var errorMessage = document.getElementById("errorMessage");

    if (name === "") {
        errorMessage.innerText = "Please enter your name.";
        errorMessage.style.display = "block";
        return;
    }

    if (isNaN(balconySeats) && isNaN(normalSeats)) {
        errorMessage.innerText = "Please enter valid number of seats.";
        errorMessage.style.display = "block";
        return;
    }

    if (balconySeats < 1 && normalSeats < 1) {
        errorMessage.innerText = "Please select at least 1 seat.";
        errorMessage.style.display = "block";
        return;
    }

    errorMessage.style.display = "none";
    document.getElementById("seatOptions").style.display = "block";
    document.getElementById("bookButton").style.display = "block";
}

function showSeatOptions() {
    var totalSeats = document.getElementById("totalSeats").value;
    // Logic to generate seat options based on totalSeats
    var seatOptionsHTML = "";
    document.getElementById("seatOptions").innerHTML = seatOptionsHTML;
    document.getElementById("seatOptions").style.display = "block";
    document.getElementById("bookButton").style.display = "block";
}

function bookSeats() {
    // Logic to handle booking seats
    // For demonstration purposes, let's assume booking is successful
    document.getElementById("bookingResult").innerText = "Seats booked successfully!";
    document.getElementById("paymentOptions").style.display = "block";
}

function proceedToPayment(event_id, user_id) {
    var name = document.getElementById("Name").value.trim();
    var balconySeats = parseInt(document.getElementById("balconySeats").value);
    var normalSeats = parseInt(document.getElementById("normalSeats").value);

    // Gather selected balcony seats
    var selectedBalconySeats = [];
    var balconyCheckboxes = document.querySelectorAll('.balcony:checked');
    balconyCheckboxes.forEach(function (checkbox) {
        selectedBalconySeats.push(checkbox.id);
    });

    // Gather selected normal seats
    var selectedNormalSeats = [];
    var normalCheckboxes = document.querySelectorAll('.normal:checked');
    normalCheckboxes.forEach(function (checkbox) {
        selectedNormalSeats.push(checkbox.id);
    });

    if (selectedBalconySeats.length !== balconySeats || selectedNormalSeats.length !== normalSeats) {
        alert("Please select the required number of seats.");
        return;
    }
    bookingSection.style.display = 'none';
    paymentSection.style.display = 'block';

}

function makePayment(event_id, user_id) {
    var name = document.getElementById("Name").value.trim();
    var balconySeats = parseInt(document.getElementById("balconySeats").value);
    var normalSeats = parseInt(document.getElementById("normalSeats").value);
    var email = document.getElementById("email").value.trim();

    if (!email || email === NaN || email === null || email === "") {
        email = "a@gmail.com";
    }

    // Gather selected balcony seats
    var selectedBalconySeats = [];
    var balconyCheckboxes = document.querySelectorAll('.balcony:checked');
    balconyCheckboxes.forEach(function (checkbox) {
        selectedBalconySeats.push(checkbox.id);
    });

    // Gather selected normal seats
    var selectedNormalSeats = [];
    var normalCheckboxes = document.querySelectorAll('.normal:checked');
    normalCheckboxes.forEach(function (checkbox) {
        selectedNormalSeats.push(checkbox.id);
    });
    var transactionId = document.getElementById("transactionId").value.trim();
    var MUID = document.getElementById("MUID").value.trim();
    var name = document.getElementById("name").value.trim();
    var number = document.getElementById("number").value.trim();

    // Validation of payment details
    if (transactionId === "" || MUID === "" || name === "" || number === "") {
        alert("Please fill in all payment details.");
        return;
    }
    // Prepare the data to be sent in the POST request
    var data = {
        name: name,
        balconySeats: balconySeats,
        normalSeats: normalSeats,
        selectedBalconySeats: selectedBalconySeats,
        selectedNormalSeats: selectedNormalSeats
    };
    console.log("Booking data: ", data);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", `/index/${user_id}/details/${event_id}/booking`, true); // Using the same URL
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        console.log("Ready state: ", xhr.readyState);
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log("Status: ", xhr.status);
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                var ticket_id = response._id;
                console.log("New booking ID: " + ticket_id);
                console.log("Redirecting to payment page...");

                var data2 = {
                    balconySeats: balconySeats,
                    normalSeats: normalSeats,
                    selectedBalconySeats: selectedBalconySeats,
                    selectedNormalSeats: selectedNormalSeats
                };
                console.log("Data Sent is: ", data2);

                var patchRequest = new XMLHttpRequest();
                patchRequest.open("PATCH", `/index/${user_id}/details/${event_id}/booking/${ticket_id}`, true);
                patchRequest.setRequestHeader("Content-Type", "application/json");
                patchRequest.onreadystatechange = function () {
                    if (patchRequest.readyState === XMLHttpRequest.DONE) {
                        if (patchRequest.status === 200) {
                            window.location.href = `/index/${user_id}/details/${event_id}/booking/${ticket_id}/payment/${email}/download`;
                        } else {
                            console.error("PATCH request failed");
                        }
                    }
                };
                patchRequest.send(JSON.stringify(data2));
            } else {
                console.error("POST request failed");
            }
        }
    };
    xhr.send(JSON.stringify(data));
}