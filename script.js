// quick load check
console.log("script.js loaded");

// ------------------- DISEASE DATABASE -------------------
const diseases = {
  "rust": {
    image: "images/rust.jpg",
    name: "Rust Disease",
    precautions: ["Avoid overhead irrigation", "Use resistant crop varieties"],
    preventions: ["Apply fungicides", "Remove infected leaves"]
  },
  "blight": {
    image: "images/blight.jpg",
    name: "Blight",
    precautions: ["Do not overcrowd plants", "Ensure proper drainage"],
    preventions: ["Use disease-free seeds", "Rotate crops regularly"]
  },
  "powdery": {
    image: "images/powdery.jpg",
    name: "Powdery Mildew",
    precautions: ["Avoid excess nitrogen fertilizer", "Provide air circulation"],
    preventions: ["Use sulfur spray", "Remove infected areas"]
  },
  "leafspot": {
    image: "images/leafspot.jpg",
    name: "Leaf Spot",
    precautions: ["Keep leaves dry", "Avoid working with wet plants"],
    preventions: ["Use copper-based fungicides", "Destroy infected debris"]
  }
};

// ------------------- UTIL / UI -------------------
function hideAll() {
  document.querySelectorAll('.card').forEach(div => div.style.display = 'none');
}
function showHome() {
  hideAll();
  document.getElementById('welcome').style.display = 'block';
}
function showUpload() {
  hideAll();
  document.getElementById('upload').style.display = 'block';
}
function showReference() {
  hideAll();
  document.getElementById('reference').style.display = 'block';
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  Object.keys(diseases).forEach(key => {
    const img = document.createElement('img');
    img.src = diseases[key].image;
    img.alt = diseases[key].name;
    img.onclick = () => showDiseaseInfo(key);
    gallery.appendChild(img);
  });
}

// ------------------- OPTIONS SCREEN -------------------
let selectedMode = null;
const startBtn = document.getElementById('startBtn');
const continueBtn = document.getElementById('continueBtn');
const cancelBtn = document.getElementById('cancelBtn');
const selectedHint = document.getElementById('selectedHint');

if (!startBtn) console.error("startBtn not found");
if (!continueBtn) console.error("continueBtn not found");

startBtn && startBtn.addEventListener('click', () => {
  hideAll();
  selectedMode = null;
  selectedHint.innerText = '';
  document.getElementById('options').style.display = 'block';
});

// option buttons
document.querySelectorAll('.opt-btn').forEach(b => {
  b.addEventListener('click', () => {
    const mode = b.getAttribute('data-mode');
    selectedMode = mode;
    if (mode === 'camera') selectedHint.innerText = 'Camera selected — will open live camera on Continue.';
    else if (mode === 'upload') selectedHint.innerText = 'Upload selected — will show file input on Continue.';
    else if (mode === 'reference') selectedHint.innerText = 'Reference selected — will open the reference gallery on Continue.';
  });
});

continueBtn && continueBtn.addEventListener('click', () => {
  if (!selectedMode) selectedMode = 'upload'; // default
  if (selectedMode === 'camera') {
    showUpload();
    openCamera();
  } else if (selectedMode === 'upload') {
    showUpload();
  } else if (selectedMode === 'reference') {
    showReference();
  }
});

cancelBtn && cancelBtn.addEventListener('click', showHome);

// ------------------- UPLOAD & CAMERA -------------------
document.getElementById('openCameraBtn').addEventListener('click', openCamera);
document.getElementById('detectBtn').addEventListener('click', detectDisease);
document.getElementById('openRefBtn').addEventListener('click', showReference);
document.getElementById('homeFromUpload').addEventListener('click', showHome);
document.getElementById('homeFromRef').addEventListener('click', showHome);
document.getElementById('homeFromResult').addEventListener('click', showHome);
document.getElementById('newPhotoBtn').addEventListener('click', showUpload);

// Detect from file input
function detectDisease() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files && fileInput.files[0];
  if (!file) { alert("Please upload or capture a photo!"); return; }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imageSrc = e.target.result;
    document.getElementById('resultImg').src = imageSrc;

    // naive name-based detection (placeholder)
    let detected = "rust";
    Object.keys(diseases).forEach(key => {
      if (file.name.toLowerCase().includes(key)) detected = key;
    });
    showDiseaseInfo(detected);
  };
  reader.readAsDataURL(file);
}

// Camera opening
function openCamera() {
  const video = document.getElementById("cameraView");
  const canvas = document.getElementById("cameraCanvas");
  const previewBox = document.getElementById("previewBox");

  previewBox.innerHTML = "";
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera not available on this browser/device.");
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.style.display = "block";

      const captureButton = document.createElement("button");
      captureButton.textContent = "📸 Capture Photo";
      captureButton.className = "btn";
      previewBox.appendChild(captureButton);

      captureButton.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");

        // stop camera
        stream.getTracks().forEach(track => track.stop());
        video.style.display = "none";

        // show preview
        const img = document.createElement("img");
        img.src = imageData;
        previewBox.innerHTML = "";
        previewBox.appendChild(img);

        // show fake detection for demo
        document.getElementById('resultImg').src = imageData;
        showDiseaseInfo('rust');
      };
    }).catch(err => {
      alert("Camera access denied or not available. Use HTTPS/localhost and allow camera permission.");
      console.error("Camera error:", err);
    });
}
 
// ------------------- DISPLAY -------------------
function showDiseaseInfo(key) {
  hideAll();
  const d = diseases[key] || Object.values(diseases)[0];
  document.getElementById('result').style.display = 'block';
  document.getElementById('resultImg').src = d.image || document.getElementById('resultImg').src;
  document.getElementById('diseaseName').innerText = d.name || 'Unknown';
  document.getElementById('precautions').innerHTML = (d.precautions || []).map(i => <li>${i}</li>).join('');
  document.getElementById('preventions').innerHTML = (d.preventions || []).map(i => <li>${i}</li>).join('');
}

// show home by default
showHome();