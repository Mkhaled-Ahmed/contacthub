// !==============  Start Global Variables
let contactNameInput = document.getElementById("contactName");
let contactPhoneInput = document.getElementById("contactPhone");
let contactEmailInput = document.getElementById("contactEmail");
let contactAddressInput = document.getElementById("contactAddress");
let contactGroupInput = document.getElementById("contactGroup");
let contactNotesInput = document.getElementById("contactNotes");
let contactFavoriteInput = document.getElementById("contactFavorite");
let contactEmergencyInput = document.getElementById("contactEmergency");
let searchInput = document.getElementById("searchInput");
let totalValue = document.getElementById("total-value");
let favValue = document.getElementById("fav-value");
let emValue = document.getElementById("em-value");

let uploadedAvatarBase64 = "";


let currentIndex = 0;
let contactList = [];
let isEditing = false;

const gradients = [
    "linear-gradient(to right bottom, oklch(0.585 0.233 277.117), oklch(0.541 0.281 293.009))",
    "linear-gradient(to right bottom, oklch(0.769 0.188 70.08), oklch(0.646 0.222 41.116))",
    "linear-gradient(to right bottom, oklch(0.667 0.295 322.15), oklch(0.592 0.249 0.584))",
    "linear-gradient(to right bottom, oklch(0.72 0.21 25), oklch(0.62 0.26 5))",
    "linear-gradient(to right bottom, oklch(0.78 0.18 150), oklch(0.65 0.24 130))",
    "linear-gradient(to right bottom, oklch(0.7 0.2 260), oklch(0.58 0.27 280))",
    "linear-gradient(to right bottom, oklch(0.74 0.19 310), oklch(0.62 0.25 330))",
    "linear-gradient(to right bottom, oklch(0.8 0.22 70), oklch(0.68 0.28 50))"
];


//Load Contact data from localStorage if available
if (localStorage.getItem("contactsContainer")) {
    contactList = JSON.parse(localStorage.getItem("contactsContainer"));
    displayData();
    updateTotalCount();
    updateFavoritesSection();
    updateEmergencySection();
}

//Load Images 
avatarInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            uploadedAvatarBase64 = e.target.result;
            avatarPreview.innerHTML = `<img src="${uploadedAvatarBase64}" class="preview-img"/>`;
        };
        reader.readAsDataURL(this.files[0]);
    }
});

// Function to add a new contact
function addContact() {

    //  Check if name is empty
    if (contactNameInput.value.trim() == "") {
        Swal.fire({
            title: "Missing Name",
            text: "Please enter a name for the contact!",
            icon: "error",
        });
        return; // Prevent adding empty contact
    }

    //  Check if name is empty
    if (contactPhoneInput.value == "") {
        Swal.fire({
            title: "Missing Phone",
            text: "Please enter a phone number!",
            icon: "error",
        });
        return; // Prevent adding empty contact
    }


    for (let i = 0; i < contactList.length; i++) {
        if (contactPhoneInput.value === contactList[i].phone) {
            Swal.fire({
                title: "Duplicate Phone Number",
                text: `A contact with this phone number already exists: ${contactList[i].name}`,
                icon: "error",
            });
            return;
        }
    }

    //  Continue only if all validations pass
    if (validationName() && validationPhone() && validationEmail()) {

        let contact = {
            name: contactNameInput.value.trim(),
            phone: contactPhoneInput.value,
            email: contactEmailInput.value,
            address: contactAddressInput.value,
            group: contactGroupInput.value,
            notes: contactNotesInput.value,
            fav: contactFavoriteInput.checked ? "yes" : "no",
            emergency: contactEmergencyInput.checked ? "yes" : "no",
            avatar: uploadedAvatarBase64 || ""
        };

        contactList.push(contact);
        localStorage.setItem("contactsContainer", JSON.stringify(contactList));

        let modalElement = document.getElementById("contactModal");
        let modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        Swal.fire({
            title: "Added",
            text: "Contact has been added successfully",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
        });

        updateFavoritesSection();
        updateEmergencySection();
        displayData();
        updateTotalCount();
        clearForm();
        contactNameInput.classList.remove("is-valid");
        contactPhoneInput.classList.remove("is-valid");
        contactEmailInput.classList.remove("is-valid");
        isEditing = false;

    }

}

function displayData() {
    var contactItems = "";
    for (let i = 0; i < contactList.length; i++) {
        contactItems += createCols(i);
    }

    document.getElementById("rowData").innerHTML = contactItems;

    // Show/hide empty state
    if (contactList.length > 0) {
        document.getElementById("emptyState").style.display = "none";
    } else {
        document.getElementById("emptyState").style.display = "block";
    }
}

function searchData() {
    let term = searchInput.value.toLowerCase();

    // If empty → show all
    if (term.trim() == "") {
        displayData();
        return;
    }

    let contactItems = "";

    for (let i = 0; i < contactList.length; i++) {
        let c = contactList[i];

        // Check name, phone, email, group
        if (
            c.name.toLowerCase().includes(term) ||
            c.phone.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.group.toLowerCase().includes(term)
        ) {
            contactItems += createCols(i);
        }
    }

    document.getElementById("rowData").innerHTML = contactItems;
}

function getAvatarLetters(name) {
    let parts = name.split(" ");

    let firstLetter = parts[0].charAt(0).toUpperCase();
    let lastLetter = parts[parts.length - 1].charAt(0).toUpperCase();

    return firstLetter + lastLetter;
}

function getGradientForName(name) {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    let index = Math.abs(hash % gradients.length);

    return gradients[index];
}

function getGroupBadge(group) {
    switch (group.toLowerCase()) {
        case "family": return "badge-family";
        case "friends": return "badge-friends";
        case "work": return "badge-work";
        case "school": return "badge-school";
        default: return "badge-other";
    }
}

function createCols(i) {
    let contact = contactList[i];

    return `
        <div class="col-12 col-lg-6">
            <div class="contact-card bg-white">

                <!-- Header -->
                <div class="header d-flex align-items-start gap-3">

                    <!-- Avatar -->
                    <div class="position-relative flex-shrink-0">
                        <div class="avatar d-flex justify-content-center align-items-center text-white fw-bold"
                        style="background: ${contact.avatar ? "none" : getGradientForName(contact.name)}">

                        ${contact.avatar
            ? `<img src="${contact.avatar}" class="avatar-img">`
            : getAvatarLetters(contact.name)
        }

                        </div>


                        <!-- Emergency Icon -->
                        <div class="position-absolute rounded-circle em-icon d-flex align-items-center justify-content-center"
                            style="opacity: ${contact.emergency == 'yes' ? 1 : 0};">
                            <i class="text-white fa fa-heart-pulse"></i>
                        </div>

                        <!-- Favorite Icon -->
                        <div class="position-absolute rounded-circle f-icon d-flex align-items-center justify-content-center"
                            style="opacity: ${contact.fav == 'yes' ? 1 : 0};">
                            <i class="text-white fa fa-star"></i>
                        </div>
                    </div>

                    <div class="flex-grow-1">
                        <h5 class="name m-0">${contact.name}</h5>

                        <div class="d-flex align-items-center gap-2 text-secondary mt-1">
                            <div class="icon-circle text-primary">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <span class="small">${contact.phone}</span>
                        </div>
                    </div>
                </div>

                <!-- Contact Details -->
                <div class="details">

                    <!-- Email (only if exists) -->
                    ${contact.email ? `
                        <div class="d-flex align-items-center gap-2 mb-2 email-item">
                            <div class="icon-circle bg-purple bg-opacity-10 text-purple">
                                <i class="fa-solid fa-envelope"></i>
                            </div>
                            <span class="text-muted small">${contact.email}</span>
                        </div>
                    ` : ""}

                    <!-- Address (only if exists) -->
                    ${contact.address ? `
                        <div class="d-flex align-items-center gap-2 address-item">
                            <div class="icon-circle bg-success bg-green text-green">
                                <i class="fa-solid fa-location-dot"></i>
                            </div>
                            <span class="text-muted small">${contact.address}</span>
                        </div>
                    ` : ""}
                </div>

                <!-- Tags -->
                <div class="tags mb-1 gap-2">
                    ${contact.group
            ? `<span class="badge rounded-2 ${getGroupBadge(contact.group)}">${contact.group}</span>`
            : ""
        }

                    ${contact.emergency === "yes"
            ? `<span class="badge bg-danger text-white rounded-2">Emergency</span>`
            : ""
        }
                </div>



                <!-- Footer Buttons -->
                <div class="contact-footer d-flex justify-content-between align-items-center">

                    <div class="d-flex gap-2">

                        <a href="tel:${contact.phone}" class="footer-btn footer-btn-phone-bg">
                            <i class="text-green fa-solid fa-phone"></i>
                        </a>

                        ${contact.email ? `
                            <a href="mailto:${contact.email}" class="footer-btn footer-btn-email-bg email-footer">
                                <i class="text-purple fa-solid fa-envelope"></i>
                            </a>
                        ` : ""}
                    </div>

                    <div class="d-flex gap-2">

                        <button onclick="toggleFavorite(${i})" class="footer-btn btn ${contact.fav === 'yes' ? 'toogle-fav-bg' : 'toogle-fav-regular-bg'}">
                            <i class="${contact.fav === 'yes' ? 'fa-solid fa-star toogle-fav-color' : 'fa-regular fa-star toogle-fav-regular-color'}"></i>
                        </button>

                        <button onclick="toggleEmergency(${i})" class="footer-btn btn ${contact.emergency === 'yes' ? 'toogle-em-bg' : 'toogle-em-regular-bg'} ">
                            <i class="${contact.emergency === 'yes' ? 'fa fa-heart-pulse toogle-em-color' : 'fa-regular fa-heart toogle-em-regular-color'}"></i>
                        </button>

                        <button onclick="setUpdateInfo(${i})"
                            class="footer-btn btn toogle-edit-bg" data-bs-toggle="modal" data-bs-target="#contactModal">
                            <i class="text-muted fa-solid fa-pen toogle-edit-color"></i>
                        </button>

                        <button onclick="deleteContact(${i})" class="footer-btn btn toogle-del-bg">
                            <i class="text-muted fa-solid fa-trash toogle-del-color"></i>
                        </button>

                    </div>

                </div>

            </div>
        </div>
    `;
}

function toggleFavorite(index) {
    let contact = contactList[index];

    // Toggle the value
    contact.fav = (contact.fav === "yes") ? "no" : "yes";

    // Save changes
    localStorage.setItem("contactsContainer", JSON.stringify(contactList));

    // Redraw all contacts so icons update
    displayData();
    updateFavoritesSection();
    updateEmergencySection();
}

function toggleEmergency(index) {
    let contact = contactList[index];

    // Toggle the value
    contact.emergency = (contact.emergency === "yes") ? "no" : "yes";

    // Save changes
    localStorage.setItem("contactsContainer", JSON.stringify(contactList));

    // Redraw all contacts so icons update
    displayData();
    updateFavoritesSection();
    updateEmergencySection();
}

function trimName(name) {
    if (name.length <= 18) {
        return name;
    }
    return name.substring(0, 18) + "...";
}

function updateFavoritesSection() {
    let favContacts = [];
    let favCardBody = document.querySelector(".fav-card .card-body");

    // Filter manually
    for (let i = 0; i < contactList.length; i++) {
        if (contactList[i].fav === "yes") {
            favContacts.push(contactList[i]);
        }
    }

    // Update Counter
    favValue.innerHTML = favContacts.length;

    // If no favorites
    if (favContacts.length === 0) {
        favCardBody.innerHTML = `<p class="empty-text">No favorites yet</p>`;
        return;
    }

    // Build HTML using normal loop
    let html = "";

    for (let i = 0; i < favContacts.length; i++) {
        let c = favContacts[i];

        html += `
            <div class="mini-contact d-flex align-items-center justify-content-between">
                <div class="left d-flex align-items-center gap-2">
                    <div class="mini-avatar"
                        style="background: ${c.avatar ? "none" : getGradientForName(c.name)}">

                        ${c.avatar
                ? `<img src="${c.avatar}" class="mini-avatar-img">`
                : getAvatarLetters(c.name)
            }

                    </div>
                    <div>
                        <p class="mini-name">${trimName(c.name)}</p>
                        <p class="mini-phone">${c.phone}</p>
                    </div>
                </div>
                <a href="tel:${c.phone}" class="call-mini">
                    <i class="fa fa-phone"></i>
                </a>
            </div>
        `;
    }

    favCardBody.innerHTML = html;
}

function updateEmergencySection() {
    let emContacts = [];
    let emCardBody = document.querySelector(".emergency-card .card-body");

    // Filter manually
    for (let i = 0; i < contactList.length; i++) {
        if (contactList[i].emergency === "yes") {
            emContacts.push(contactList[i]);
        }
    }

    // Update counter
    emValue.innerHTML = emContacts.length;

    // If empty
    if (emContacts.length === 0) {
        emCardBody.innerHTML = `<p class="empty-text">No emergency contacts</p>`;
        return;
    }

    // Build HTML manually
    let html = "";

    for (let i = 0; i < emContacts.length; i++) {
        let c = emContacts[i];

        html += `
            <div class="mini-contact d-flex align-items-center justify-content-between">
                <div class="left d-flex align-items-center gap-2">
                    <div class="mini-avatar"
                        style="background: ${c.avatar ? "none" : getGradientForName(c.name)}">

                        ${c.avatar
                ? `<img src="${c.avatar}" class="mini-avatar-img">`
                : getAvatarLetters(c.name)
            }

                    </div>
                    <div>
                        <p class="mini-name">${trimName(c.name)}</p>
                        <p class="mini-phone">${c.phone}</p>
                    </div>
                </div>
                <a href="tel:${c.phone}" class="call-mini">
                    <i class="fa fa-phone"></i>
                </a>
            </div>
        `;
    }

    emCardBody.innerHTML = html;
}

function deleteContact(index) {
    Swal.fire({
        title: "Delete Contact?",
        text: "Are you sure you want to delete Mohamed Khaled Ahmed Mohamed? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DC2626",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            contactList.splice(index, 1);
            localStorage.setItem("contactsContainer", JSON.stringify(contactList));
            displayData();
            Swal.fire({
                title: "Deleted!",
                text: "Contact has been deleted.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500
            });
            updateTotalCount();
            updateFavoritesSection();
            updateEmergencySection();
        }
    });

}

function setUpdateInfo(index) {
    currentIndex = index;
    isEditing = true;

    contactNameInput.value = contactList[index].name;
    contactPhoneInput.value = contactList[index].phone;
    contactEmailInput.value = contactList[index].email;
    contactAddressInput.value = contactList[index].address;
    contactGroupInput.value = contactList[index].group;
    contactNotesInput.value = contactList[index].notes;

    contactFavoriteInput.checked = contactList[index].fav == "yes";
    contactEmergencyInput.checked = contactList[index].emergency == "yes";
}

function updateData() {

    if (contactNameInput.value.trim() == "") {
        Swal.fire({
            title: "Missing Name",
            text: "Please enter a name for the contact!",
            icon: "error",
        });
        return;
    }

    if (validationName() && validationPhone() && validationEmail()) {

        let contact = {
            name: contactNameInput.value.trim(),
            phone: contactPhoneInput.value,
            email: contactEmailInput.value,
            address: contactAddressInput.value,
            group: contactGroupInput.value,
            notes: contactNotesInput.value,
            fav: contactFavoriteInput.checked ? "yes" : "no",
            emergency: contactEmergencyInput.checked ? "yes" : "no",
            avatar: avatarInput.src || ""
        };

        contactList.splice(currentIndex, 1, contact);

        localStorage.setItem("contactsContainer", JSON.stringify(contactList));

        displayData();

        let modalElement = document.getElementById("contactModal");
        let modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        clearForm();


        contactNameInput.classList.remove("is-valid");
        contactPhoneInput.classList.remove("is-valid");
        contactEmailInput.classList.remove("is-valid");
        Swal.fire({
            title: "Updated",
            text: "Contact updated successfully",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
        });
        updateTotalCount();
        updateFavoritesSection();
        updateEmergencySection();
    }
}

function submitContact() {
    if (isEditing) {
        updateData();
        isEditing = false;
    } else {
        addContact();
    }
}

function validationName() {
    let regex = /^[\p{L} ]{3,50}$/u;
    let text = contactNameInput.value;
    let msgName = document.getElementById("msgName");

    if (regex.test(text)) {
        contactNameInput.classList.add("is-valid");
        contactNameInput.classList.remove("is-invalid");
        msgName.classList.add("d-none");
        return true;
    }
    else {
        contactNameInput.classList.add("is-invalid");
        contactNameInput.classList.remove("is-valid");
        msgName.classList.remove("d-none");
        return false;
    }
}

function validationPhone() {
    let regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    let text = contactPhoneInput.value;
    let msgPhone = document.getElementById("msgPhone");

    if (regex.test(text)) {
        contactPhoneInput.classList.add("is-valid");
        contactPhoneInput.classList.remove("is-invalid");
        msgPhone.classList.add("d-none");
        return true;
    }
    else {
        contactPhoneInput.classList.add("is-invalid");
        contactPhoneInput.classList.remove("is-valid");
        msgPhone.classList.remove("d-none");
        return false;
    }
}

function validationEmail() {
    let regex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;
    let text = contactEmailInput.value.trim();
    let msgEmail = document.getElementById("msgEmail");

    if (text === "") {
        contactEmailInput.classList.remove("is-invalid");
        contactEmailInput.classList.remove("is-valid");
        msgEmail.classList.add("d-none");
        return true;
    }

    if (regex.test(text)) {
        contactEmailInput.classList.add("is-valid");
        contactEmailInput.classList.remove("is-invalid");
        msgEmail.classList.add("d-none");
        return true;
    } else {
        contactEmailInput.classList.add("is-invalid");
        contactEmailInput.classList.remove("is-valid");
        msgEmail.classList.remove("d-none");
        return false;
    }
}


function updateTotalCount() {
    totalValue.innerHTML = contactList.length;
}


function clearForm() {
    contactNameInput.value = null;
    contactPhoneInput.value = null;
    contactEmailInput.value = null;
    contactAddressInput.value = null;
    contactGroupInput.value = null;
    contactNotesInput.value = null;
    contactFavoriteInput.checked = false;
    contactEmergencyInput.checked = false;

}