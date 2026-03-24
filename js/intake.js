
/* =============================================
   Triad Energy — intake.js
   All site JavaScript lives here.
   ============================================= */

'use strict';

/* ================================================
   SHARED STATE
   ================================================ */
let currentLanguage = 'en';

/* ================================================
   LANGUAGE SWITCHING
   (used on both index.html and intakeform.html)
   ================================================ */
function setLanguage(lang, e) {
    currentLanguage = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    e.currentTarget.classList.add('active');
    e.currentTarget.setAttribute('aria-pressed', 'true');

    document.querySelectorAll('[data-en]').forEach(el => {
        const val = el.getAttribute('data-' + lang);
        if (val === null) return;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = val;
        } else if (el.tagName === 'OPTION') {
            el.textContent = val;
        } else if (el.children.length === 0) {
            el.textContent = val;
        } else {
            el.innerHTML = val;
        }
    });
}

/* ================================================
   STICKY HEADER  (index.html only)
   ================================================ */
(function initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const update = () => header.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

/* ================================================
   MOBILE NAV TOGGLE  (index.html only)
   ================================================ */
(function initMobileNav() {
    const btn   = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
    });

    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });
})();

/* ================================================
   SMOOTH SCROLL  (index.html only)
   ================================================ */
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();

/* ================================================
   SCROLL REVEAL  (index.html only)
   ================================================ */
(function initScrollReveal() {
    const targets = document.querySelectorAll('.service-card, .about-visual, .about-text, .contact-card');
    if (!targets.length) return;

    const style = document.createElement('style');
    style.textContent = `
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .55s ease, transform .55s ease; }
        .reveal.visible { opacity: 1; transform: none; }
    `;
    document.head.appendChild(style);

    targets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    targets.forEach(el => observer.observe(el));
})();

/* ================================================
   INTAKE FORM  (intakeform.html only)
   ================================================ */
let uploadedFiles = [];
let cameraStream  = null;

/* ---- Client Type Toggle ---- */
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

/* ---- File Handling ---- */
function handleFiles(files) {
    for (const file of files) {
        if (file.size / 1024 > 1000) {
            alert(currentLanguage === 'en'
                ? `"${file.name}" is too large. Please upload files under 1 MB.`
                : `"${file.name}" es demasiado grande. Suba archivos menores a 1 MB.`);
            continue;
        }
        uploadedFiles.push(file);
    }
    renderFileList();
}

function renderFileList() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    if (uploadedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    const heading = currentLanguage === 'en' ? 'Uploaded Files:' : 'Archivos Subidos:';
    container.innerHTML = `<p style="font-weight:700;font-size:.9rem;color:#162d48;margin-bottom:.75rem;">${heading}</p>`;

    uploadedFiles.forEach((file, idx) => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.setAttribute('role', 'listitem');
        item.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${getFileIcon(file.type)}</span>
                <span>${file.name}</span>
            </div>
            <button type="button" class="remove-file" onclick="removeFile(${idx})" aria-label="Remove ${file.name}">
                ${currentLanguage === 'en' ? 'Remove' : 'Eliminar'}
            </button>`;
        container.appendChild(item);
    });
}

function getFileIcon(type) {
    if (type.includes('image'))                              return '🖼️';
    if (type.includes('pdf'))                               return '📕';
    if (type.includes('document') || type.includes('word')) return '📄';
    return '📎';
}

function removeFile(idx) {
    uploadedFiles.splice(idx, 1);
    renderFileList();
}

/* ---- Camera ---- */
async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        const preview = document.getElementById('cameraPreview');
        preview.srcObject = cameraStream;
        document.getElementById('cameraOverlay').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (err) {
        alert(currentLanguage === 'en'
            ? 'Unable to access camera: ' + err.message
            : 'No se puede acceder a la cámara: ' + err.message);
    }
}

function capturePhoto() {
    const preview = document.getElementById('cameraPreview');
    const canvas  = document.createElement('canvas');
    canvas.width  = preview.videoWidth;
    canvas.height = preview.videoHeight;
    canvas.getContext('2d').drawImage(preview, 0, 0);

    canvas.toBlob(blob => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        if (file.size / 1024 > 1000) {
            alert(currentLanguage === 'en'
                ? 'Photo is too large (over 1 MB). Try again in lower light or move closer.'
                : 'La foto es demasiado grande (más de 1 MB). Intente con menos luz o acérquese.');
            stopCamera();
            return;
        }
        uploadedFiles.push(file);
        renderFileList();
        stopCamera();
    }, 'image/jpeg', 0.85);
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    document.getElementById('cameraOverlay').style.display = 'none';
    document.body.style.overflow = '';
}

/* ---- Form Submit ---- */
async function handleSubmit(e) {
    e.preventDefault();

    const form      = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const successEl = document.getElementById('successMessage');
    const errorEl   = document.getElementById('errorMessage');

    submitBtn.disabled    = true;
    submitBtn.textContent = currentLanguage === 'en' ? 'Sending…' : 'Enviando…';
    successEl.hidden = true;
    errorEl.hidden   = true;

    const formData = new FormData(form);
    uploadedFiles.forEach(file => formData.append('attachment[]', file));

    try {
        const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
            successEl.hidden = false;
            successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            form.reset();
            uploadedFiles = [];
            renderFileList();
            selectClientType('personal');
            setTimeout(() => { successEl.hidden = true; }, 6000);
        } else {
            throw new Error(data.message || 'Submission failed');
        }
    } catch (err) {
        console.error(err);
        errorEl.hidden = false;
        setTimeout(() => { errorEl.hidden = true; }, 6000);
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = currentLanguage === 'en' ? 'Submit Information' : 'Enviar Información';
    }
}

/* ---- DOMContentLoaded: wire up intake form listeners ---- */
document.addEventListener('DOMContentLoaded', () => {
    const fileInput  = document.getElementById('fileInput');
    const intakeForm = document.getElementById('intakeForm');

    if (fileInput) {
        fileInput.addEventListener('change', e => {
            handleFiles(e.target.files);
            e.target.value = '';
        });
    }

    if (intakeForm) {
        intakeForm.addEventListener('submit', handleSubmit);
    }
});
