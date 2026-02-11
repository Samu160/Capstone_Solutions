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
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = el.getAttribute('data-' + lang);
        } else {
            el.textContent = el.getAttribute('data-' + lang);
        }
    });
}
/*End Change Language and CSS of Button*/

/* Client Type Selection */
function selectClientType(type) {
    const personalInfo = document.getElementById('personalInfo');
    const businessInfo = document.getElementById('businessInfo');
    const personalBtn = document.getElementById('personalBtn');
    const businessBtn = document.getElementById('businessBtn');
    
    if (type === 'personal') {
        personalInfo.style.display = 'block';
        businessInfo.style.display = 'none';
        personalBtn.classList.add('active');
        businessBtn.classList.remove('active');
        
        // Make personal fields required, business fields optional
        document.querySelectorAll('#personalInfo input[data-required="true"]').forEach(input => {
            input.required = true;
        });
        document.querySelectorAll('#businessInfo input').forEach(input => {
            input.required = false;
        });
    } else {
        personalInfo.style.display = 'none';
        businessInfo.style.display = 'block';
        personalBtn.classList.remove('active');
        businessBtn.classList.add('active');
        
        // Make business fields required, personal fields optional
        document.querySelectorAll('#businessInfo input[data-required="true"]').forEach(input => {
            input.required = true;
        });
        document.querySelectorAll('#personalInfo input').forEach(input => {
            input.required = false;
        });
    }
}

/* File Input Handlers */
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fileInput').addEventListener('change', function (e) {
        handleFiles(e.target.files);
    });

    document.getElementById('scanInput').addEventListener('change', function (e) {
        handleFiles(e.target.files);
    });
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
    
    if (uploadedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `<h3 style="margin-bottom: 0.5rem;" data-en="Uploaded Files:" data-es="Archivos Subidos:">${currentLanguage === 'en' ? 'Uploaded Files:' : 'Archivos Subidos:'}</h3>`;

    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${getFileIcon(file.type)}</span>
                <span>${file.name}</span>
            </div>
            <button type="button" class="remove-file" onclick="removeFile(${index})" data-en="Remove" data-es="Eliminar">${currentLanguage === 'en' ? 'Remove' : 'Eliminar'}</button>
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
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('intakeForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = currentLanguage === 'en' ? 'Sending...' : 'Enviando...';

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
                
                // Reset to personal view
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
            submitBtn.textContent =
                currentLanguage === 'en' ? 'Submit Information' : 'Enviar Información';
        }
    });
});