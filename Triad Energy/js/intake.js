let uploadedFiles = [];
let cameraStream = null;
let currentLanguage = 'en';

function getCurrentLanguage(){
    return currentLanguage;
}

/*Change Language and CSS of Button*/
function setLanguage(lang, e) {
    currentLanguage = lang;

    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn =>{
        btn.classList.remove('active')
    });

    e.currentTarget.classList.add('active');

    const langChange = document.querySelectorAll('[data-en]');
    
    langChange.forEach(el => {
        el.textContent = el.getAttribute('data-' + lang);
    });
}
/*End Change Language and CSS of Button*/

/* File Input Handlers */
document.getElementById('fileInput').addEventListener('change', function (e) {
    handleFiles(e.target.files);
});

document.getElementById('scanInput').addEventListener('change', function (e) {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    for (let file of files) {
        uploadedFiles.push(file);
    }
    displayUploadedFiles();
}

/*Camera Feature*/
async function startCamera() {
    try {
        const preview = document.getElementById('cameraPreview');
        const controls = document.getElementById('cameraControls');

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        preview.srcObject = cameraStream;
        preview.style.display = 'block';
        controls.style.display = 'block';
    } catch (err) {
        alert('Unable to access camera: ' + err.message);
    }
}

function capturePhoto() {
    const preview = document.getElementById('cameraPreview');
    const canvas = document.createElement('canvas');

    canvas.width = preview.videoWidth;
    canvas.height = preview.videoHeight;

    canvas.getContext('2d').drawImage(preview, 0, 0);

    canvas.toBlob(blob => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        uploadedFiles.push(file);
        displayUploadedFiles();
        stopCamera();
    }, 'image/jpeg');
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    document.getElementById('cameraPreview').style.display = 'none';
    document.getElementById('cameraControls').style.display = 'none';
}

/* Uploaded Files UI */
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    container.innerHTML = '<h3 style="margin-bottom: 0.5rem;">Uploaded Files:</h3>';

    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${getFileIcon(file.type)}</span>
                <span>${file.name}</span>
            </div>
            <button type="button" class="remove-file" onclick="removeFile(${index})">Remove</button>
        `;

        container.appendChild(fileItem);
    });
}

function getFileIcon(type) {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    if (type.includes('document') || type.includes('word')) return '📄';
    return '📎';
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayUploadedFiles();
}

/*Form Submission - Web3Forms*/
document.getElementById('intakeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = currentLanguage === 'en' ? 'Sending...': 'Enviando...';

    const formData = new FormData(this);

    // Add uploaded files to FormData
    uploadedFiles.forEach((file) => {
        formData.append('attachments[]', file);
    });

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Display success message
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('intakeForm').reset();
            uploadedFiles = [];
            displayUploadedFiles();

            setTimeout(() => {
                document.getElementById('successMessage').style.display = 'none';
            }, 5000);
        } else {
            throw new Error(data.message || 'Submission failed');
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').style.display = 'block';
        setTimeout(() => {
            document.getElementById('errorMessage').style.display = 'none';
        }, 5000);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent =
            currentLanguage === 'en' ? 'Submit Information' : 'Enviar Información';
    }
});