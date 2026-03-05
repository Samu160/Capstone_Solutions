let uploadedFiles = [];
let cameraStream = null;
let currentLanguage = 'en';

function getCurrentLanguage() {
    return currentLanguage;
}

/* Change Language */
function setLanguage(lang, e) {
    currentLanguage = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');

    document.querySelectorAll('[data-en]').forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = el.getAttribute('data-' + lang);
        } else {
            el.textContent = el.getAttribute('data-' + lang);
        }
    });
}

/* Client Type Selection */
function selectClientType(type) {
    const personalInfo = document.getElementById('personalInfo');
    const businessInfo = document.getElementById('businessInfo');
    const personalBtn = document.getElementById('personalBtn');
    const businessBtn = document.getElementById('businessBtn');
    const clientTypeInput = document.getElementById('clientTypeInput');

    if (type === 'personal') {
        personalInfo.style.display = 'block';
        businessInfo.style.display = 'none';
        personalBtn.classList.add('active');
        businessBtn.classList.remove('active');
        document.querySelectorAll('#personalInfo input[data-required="true"]').forEach(i => i.required = true);
        document.querySelectorAll('#businessInfo input').forEach(i => i.required = false);
    } else {
        personalInfo.style.display = 'none';
        businessInfo.style.display = 'block';
        personalBtn.classList.remove('active');
        businessBtn.classList.add('active');
        document.querySelectorAll('#businessInfo input[data-required="true"]').forEach(i => i.required = true);
        document.querySelectorAll('#personalInfo input').forEach(i => i.required = false);
    }

    clientTypeInput.value = type;
}

/* File Input Handler */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('fileInput').addEventListener('change', function (e) {
        handleFiles(e.target.files);
    });
});

function handleFiles(files) {
    for (let file of files) {
        // Web3Forms supports up to 1MB per file
        const fileSizeKB = file.size / 1024;
        if (fileSizeKB > 1000) {
            alert(currentLanguage === 'en'
                ? `"${file.name}" is too large. Please upload files under 1MB.`
                : `"${file.name}" es demasiado grande. Suba archivos menores a 1MB.`);
            continue;
        }
        uploadedFiles.push(file);
    }
    displayUploadedFiles();
}

/* Fullscreen Camera */
async function startCamera() {
    try {
        const overlay = document.getElementById('cameraOverlay');
        const preview = document.getElementById('cameraPreview');

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });

        preview.srcObject = cameraStream;
        overlay.style.display = 'flex';

        // Lock to landscape-ish on mobile by preventing scroll
        document.body.style.overflow = 'hidden';
    } catch (err) {
        alert(currentLanguage === 'en'
            ? 'Unable to access camera: ' + err.message
            : 'No se puede acceder a la cámara: ' + err.message);
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
        const fileSizeKB = file.size / 1024;
        if (fileSizeKB > 1000) {
            alert(currentLanguage === 'en'
                ? 'Photo is too large (over 1MB). Try again in lower light or move closer.'
                : 'La foto es demasiado grande (más de 1MB). Intente con menos luz o acérquese.');
            stopCamera();
            return;
        }
        uploadedFiles.push(file);
        displayUploadedFiles();
        stopCamera();
    }, 'image/jpeg', 0.85);
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    document.getElementById('cameraOverlay').style.display = 'none';
    document.body.style.overflow = '';
}

/* Uploaded Files UI */
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');

    if (uploadedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `<h3 style="margin-bottom: 0.5rem;">${currentLanguage === 'en' ? 'Uploaded Files:' : 'Archivos Subidos:'}</h3>`;

    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${getFileIcon(file.type)}</span>
                <span>${file.name}</span>
            </div>
            <button type="button" class="remove-file" onclick="removeFile(${index})">
                ${currentLanguage === 'en' ? 'Remove' : 'Eliminar'}
            </button>
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

/* File attachment */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('intakeForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = currentLanguage === 'en' ? 'Sending...' : 'Enviando...';

        const formData = new FormData(this);

        uploadedFiles.forEach(file => {
            formData.append('attachment[]', file);
        });

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('successMessage').style.display = 'block';
                this.reset();
                uploadedFiles = [];
                displayUploadedFiles();
                selectClientType('personal');

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
            submitBtn.textContent = currentLanguage === 'en' ? 'Submit Information' : 'Enviar Información';
        }
    });
});