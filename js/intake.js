// Tracks the language status of the page.
let currentLanguage = 'en';

/*
 * Set Language Method
 * Switches the page language between English and Spanish.
 * It updates the current Language variable to remember the lanugage status,
 * removes the style from the language not selectd and places it to the selected langugae,
 * loops through all the elemnts with data-en/es and swaps to the respective langugae selected.
 */
function setLanguage(lang, e) {
    currentLanguage = lang;

    var buttons = document.querySelectorAll('.lang-btn');

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
        buttons[i].setAttribute('aria-pressed', 'false');
    }

    e.currentTarget.classList.add('active');
    e.currentTarget.setAttribute('aria-pressed', 'true');

    var elements = document.querySelectorAll('[data-en]');

    for (var j = 0; j < elements.length; j++) {
        var el = elements[j];
        var value = el.getAttribute('data-' + lang);

        if (value === null) {
            continue;
        }

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = value;
        } else if (el.tagName === 'OPTION') {
            el.textContent = value;
        } else if (el.children.length === 0) {
            el.textContent = value;
        } else {
            el.innerHTML = value;
        }
    }
}

/*
 * Sticky Header
 * Changse the top navigation bar background after the user scropss past 30px
 * It watches for the user scroll and adds or removes the "scrolled" style on the header.
 */
(function initStickyHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function updateHeader() {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateHeader);

    updateHeader();
})();

/*
 * Mobile navigatio
 * Handles the mobile menu for mobile display.
 * When the buttn is clickled, it shows or hides the hamburger menu.
 * 
 */
(function initMobileNav() {
    var btn = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');

    if (!btn || !links) return;

    btn.addEventListener('click', function () {
        if (links.classList.contains('open')) {
            links.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        } else {
            links.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });

    var navLinks = links.querySelectorAll('a');

    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function () {
            links.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    }
})();

/*
 * Smooth Screen Scroll
 * When a navigation link is clicked, it scrolls ot that section with a smooth animcation.
 * 
 */
(function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');

    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            var target = document.querySelector(targetId);

            if (!target) return;

            e.preventDefault();

            var position = target.getBoundingClientRect().top + window.scrollY - 72;

            window.scrollTo({
                top: position,
                behavior: 'smooth'
            });
        });
    }
})();

/**
 * Scroll animation 
 * Adds scroll animation to elements in the page.
 * When the user scrolls into the view, they smoothly fade and move up.
 * Elements only animate once
 * 
 */
(function initScrollReveal() {
    var targets = document.querySelectorAll('.service-card, .about-visual, .about-text, .contact-card');

    if (targets.length === 0) return;

    var style = document.createElement('style');
    style.textContent =
        '.reveal { opacity: 0; transform: translateY(20px); transition: opacity .5s ease, transform .5s ease; }' +
        '.reveal.visible { opacity: 1; transform: none; }';

    document.head.appendChild(style);

    for (var i = 0; i < targets.length; i++) {
        targets[i].classList.add('reveal');
    }

    var observer = new IntersectionObserver(function (entries) {
        for (var j = 0; j < entries.length; j++) {
            var entry = entries[j];

            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        }
    }, { threshold: 0.1 });

    for (var k = 0; k < targets.length; k++) {
        observer.observe(targets[k]);
    }
})();

// Holds the files of photos uploaded
let uploadedFiles = [];

// Hold the status of the camera
let cameraStream  = null;

/*
 * Select Client Type
 * Toggles the intake form between the Personal and Business information
 * Changes the form based on the selected client type, personal or business.
 * When client type is selected it hides the fields and shows the other fields
 */
function selectClientType(type) {
    const personalInfo = document.getElementById('personalInfo');
    const businessInfo = document.getElementById('businessInfo');
    const personalBtn  = document.getElementById('personalBtn');
    const businessBtn  = document.getElementById('businessBtn');
    const clientInput  = document.getElementById('clientTypeInput');
    if (!personalInfo || !businessInfo) return;

    if (type === 'personal') {
        personalInfo.style.display = '';
        businessInfo.style.display = 'none';
        personalBtn.classList.add('active');
        personalBtn.setAttribute('aria-pressed', 'true');
        businessBtn.classList.remove('active');
        businessBtn.setAttribute('aria-pressed', 'false');
        document.querySelectorAll('#personalInfo input[data-required="true"]').forEach(i => i.required = true);
        document.querySelectorAll('#businessInfo input').forEach(i => i.required = false);
    } else {
        personalInfo.style.display = 'none';
        businessInfo.style.display = '';
        businessBtn.classList.add('active');
        businessBtn.setAttribute('aria-pressed', 'true');
        personalBtn.classList.remove('active');
        personalBtn.setAttribute('aria-pressed', 'false');
        document.querySelectorAll('#businessInfo input[data-required="true"]').forEach(i => i.required = true);
        document.querySelectorAll('#personalInfo input').forEach(i => i.required = false);
    }
    clientInput.value = type;
}

/*
 * File Handler
 * Validates that the file uploaded or picture taken is not bigger than 1MB.
 * Displays an error message if it is.
 */
function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i];

        if (file.size / 1024 > 1000) {
            if (currentLanguage === 'en') {
                alert('"' + file.name + '" is too large. Please upload files under 1 MB.');
            } else {
                alert('"' + file.name + '" es demasiado grande. Suba archivos menores a 1 MB.');
            }
            continue;
        }
        uploadedFiles.push(file);
    }
    renderFileList();
}

/*
 * Render File List
 * Chcks the array uploadedFiles to see if there are any in there.
 * Then displays the list of the uploaded files to the user.
 * 
 */
function renderFileList() {
    var container = document.getElementById('uploadedFiles');
    if (!container) return;

    if (uploadedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    var heading;
    if (currentLanguage === 'en') {
        heading = 'Uploaded Files:';
    } else {
        heading = 'Archivos Subidos:';
    }

    container.innerHTML = '<p style="font-weight:700;font-size:.88rem;color:#0b1c30;margin-bottom:.75rem;">' 
        + heading + 
        '</p>';

    for (var i = 0; i < uploadedFiles.length; i++) {
        var file = uploadedFiles[i];

        var item = document.createElement('div');
        item.className = 'file-item';
        item.setAttribute('role', 'listitem');

        var buttonText;
        if (currentLanguage === 'en') {
            buttonText = 'Remove';
        } else {
            buttonText = 'Eliminar';
        }

        item.innerHTML =
            '<div class="file-info">' +
                '<span style="font-size:.85rem;color:#5a6a7e;">' + file.name + '</span>' +
            '</div>' +
            '<button type="button" class="remove-file" onclick="removeFile(' + i + ')" aria-label="Remove ' + file.name + '">' +
                buttonText +
            '</button>';

        container.appendChild(item);
    }
}

/*
 * Remove file
 * Removes the a file at the given index or button that the user has selected.
 */
function removeFile(idx) {
    uploadedFiles.splice(idx, 1);
    renderFileList();
}

/*
 * Start Camera
 * Ask the browers for camera access, save the camera stream in cameraStream
 * and  places the camera view on the screen.
 * It asks for the rearview camera and takes over the whole screen until exited.
 */
async function startCamera() {
    try {
        var videoSettings = {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        };

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: videoSettings
        });

        var preview = document.getElementById('cameraPreview');
        var overlay = document.getElementById('cameraOverlay');

        preview.srcObject = cameraStream;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (err) {
        if (currentLanguage === 'en') {
            alert('Unable to access camera: ' + err.message);
        } else {
            alert('No se puede acceder a la camara: ' + err.message);
        }
    }
}

/*
 * Capture Picture
 * 
 * Takes an image of the current stream.
 * Then the image is converted into a JPEG file and timestamped.
 * IF the file is larger than 1MB the user is given an error message and removes the file.
 */
function capturePhoto() {
    var preview = document.getElementById('cameraPreview');
    var canvas = document.createElement('canvas');

    canvas.width = preview.videoWidth;
    canvas.height = preview.videoHeight;

    var context = canvas.getContext('2d');
    context.drawImage(preview, 0, 0);

    canvas.toBlob(function(blob) {
        var fileName = 'photo_' + Date.now() + '.jpg';
        var file = new File([blob], fileName, { type: 'image/jpeg' });

        if (file.size / 1024 > 1000) {
            if (currentLanguage === 'en') {
                alert('Photo is too large (over 1 MB). Try again in lower light or move closer.');
            } else {
                alert('La foto es demasiado grande (mas de 1 MB). Intente con menos luz o acerquese.');
            }

            stopCamera();
            return;
        }

        uploadedFiles.push(file);
        renderFileList();
        stopCamera();
    }, 'image/jpeg', 0.85);
}

/*
 * Stop Camera
 * Turns the camera off and closes the camera view.
 * Clears the saved camera stream.
 * Hides the camera overlay and allows for the page to scrolls again.
 */
function stopCamera() {
    if (cameraStream) {
        var tracks = cameraStream.getTracks();

        for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
        }

        cameraStream = null;
    }

    var overlay = document.getElementById('cameraOverlay');
    overlay.style.display = 'none';

    document.body.style.overflow = '';
}

/*
 * Sumbit Function
 * Handles the intake form submission.
 * Stops the page from refreshing and displays a sending message.
 * Collects the form data and file. Then sends it to web3forms.
 * If succesful it shows a sucess message if not a fail message.
 */
async function handleSubmit(e) {
    e.preventDefault();

    var form = e.target;
    var submitBtn = form.querySelector('.submit-btn');
    var successEl = document.getElementById('successMessage');
    var errorEl = document.getElementById('errorMessage');

    submitBtn.disabled = true;

    if (currentLanguage === 'en') {
        submitBtn.textContent = 'Sending...';
    } else {
        submitBtn.textContent = 'Enviando...';
    }

    if (successEl) {
        successEl.hidden = true;
    }

    if (errorEl) {
        errorEl.hidden = true;
    }

    var formData = new FormData(form);

    for (var i = 0; i < uploadedFiles.length; i++) {
        formData.append('attachment[]', uploadedFiles[i]);
    }

    try {
        var response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        var data = await response.json();

        if (data.success) {
            window.location.href = "thankyou.html";
        

        } else {
            throw new Error(data.message || 'Submission failed');
        }

    } catch (err) {
        console.log(err);

        if (errorEl) {
            errorEl.hidden = false;

            setTimeout(function () {
                errorEl.hidden = true;
            }, 6000);
        }

    } finally {
        submitBtn.disabled = false;

        if (currentLanguage === 'en') {
            submitBtn.textContent = 'Submit Information';
        } else {
            submitBtn.textContent = 'Enviar Informacion';
        }
    }
}

/*
 * DOMContentLoaded listener
 * This runs after the page finishes loading.
 * When the user selects a file it adds to files to the handlefile fuction
 * When the form is submitted it runds the handleSumbit fucntion.
 */
document.addEventListener('DOMContentLoaded', function () {
    var fileInput = document.getElementById('fileInput');
    var intakeForm = document.getElementById('intakeForm');

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            handleFiles(e.target.files);
            e.target.value = '';
        });
    }

    if (intakeForm) {
        intakeForm.addEventListener('submit', handleSubmit);
    }
});