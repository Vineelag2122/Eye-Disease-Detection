document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const spinner = document.getElementById('spinner');
    const btnText = analyzeBtn.querySelector('span');
    const resultCard = document.getElementById('resultCard');
    const resultLabel = document.getElementById('resultLabel');
    const confidenceValue = document.getElementById('confidenceValue');
    const progressBar = document.getElementById('progressBar');

    // Drag & Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadArea.classList.add('dragover');
    }

    function unhighlight(e) {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                showPreview(file);
            } else {
                alert('Please upload an image file.');
            }
        }
    }

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadArea.style.display = 'none';
            previewContainer.style.display = 'block';
            analyzeBtn.disabled = false;
            resultCard.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }

    removeBtn.addEventListener('click', () => {
        fileInput.value = '';
        previewContainer.style.display = 'none';
        uploadArea.style.display = 'block';
        analyzeBtn.disabled = true;
        resultCard.style.display = 'none';
    });

    analyzeBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // Loading State
        analyzeBtn.disabled = true;
        btnText.textContent = 'Analyzing...';
        spinner.style.display = 'inline-block';
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                showResult(data);
            } else {
                alert(data.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the server.');
        } finally {
            // Reset Button
            analyzeBtn.disabled = false;
            btnText.textContent = 'Analyze Image';
            spinner.style.display = 'none';
        }
    });

    function showResult(data) {
        resultCard.style.display = 'block';
        
        // Format class name (e.g., "diabetic_retinopathy" -> "Diabetic Retinopathy")
        const formattedClass = data.class.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        resultLabel.textContent = formattedClass;
        
        // Format confidence
        const confidencePercent = Math.round(data.confidence * 100);
        confidenceValue.textContent = `${confidencePercent}%`;
        
        // Animate progress bar
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = `${confidencePercent}%`;
        }, 100);

        // Color coding based on result
        const diagnosisDiv = document.querySelector('.diagnosis h3');
        if (data.class === 'normal') {
            diagnosisDiv.style.background = 'linear-gradient(to right, #10b981, #34d399)';
            diagnosisDiv.style.webkitBackgroundClip = 'text';
            diagnosisDiv.style.webkitTextFillColor = 'transparent';
        } else {
            diagnosisDiv.style.background = 'linear-gradient(to right, #ef4444, #f87171)';
            diagnosisDiv.style.webkitBackgroundClip = 'text';
            diagnosisDiv.style.webkitTextFillColor = 'transparent';
        }
    }
});
