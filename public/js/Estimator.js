const flags = []; // Array of flags for each coordinate set
const paintPrice = [100, 125, 75, 75, 75, 75, 75, 100, 100, 100, 100, 75, 75];
const rustWorkPrice = [200, 250, 150, 150, 150, 150, 150, 200, 200, 200, 200, 150, 150];
let activeOverlayIndex = -1; // Index of the currently active overlay

function createOverlayPolygons() {
    const isPaintJob = window.location.hash === '#paintjob' ? true : false;
    // Get the map image element
    const mapImage = document.getElementById('carImage');

    const canvas = document.getElementById('overlayCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to match the map image size
    canvas.width = mapImage.width;
    canvas.height = mapImage.height;

    const coordinates = [
        "128,172,250,172,243,199,243,215,241,236,243,256,241,275,242,297,250,327,229,326,198,327,162,327,128,325,126,304,124,287,120,279,120,236,121,221,126,199", // Hood
        "302,287,304,259,303,215,308,188,341,190,374,192,432,189,454,189,448,205,447,253,446,280,451,312,405,309,366,309,339,309,317,311,305,310,304,296,303,291,338,289,360,288,370,281,371,224,362,214,339,211,327,220,326,242,325,267,329,282,335,290,306,314", // Roof
        "589,252,588,206,582,174,538,174,517,175,467,185,454,189,448,214,446,253,446,283,453,313,493,320,520,326,539,329,582,327,590,295,520,314,503,313,474,309,457,302,453,281,453,258,453,234,456,209,457,198,469,192,490,187,504,185,521,187,525,187,524,210,526,251,526,281,525,315,589,296", //Trunk
        "370,351,345,350,320,354,308,358,291,367,278,374,269,380,257,386,247,395,246,414,243,430,244,449,247,459,250,472,261,475,275,475,292,475,314,474,327,474,346,476,370,475,365,453,363,428,364,410,365,400,362,355,364,374,362,388,360,394,340,394,322,395,304,396,282,396,260,395,266,388,280,380,296,371,317,359,344,356,352,355,364,357,363,416", // Door1
        "433,472,441,448,452,433,473,420,476,415,471,400,464,387,450,372,438,360,434,353,420,351,407,351,393,351,382,351,370,351,367,371,367,395,365,415,364,437,367,455,370,474,404,472,373,395,374,375,373,357,388,355,401,355,410,356,418,357,425,357,430,362,440,368,448,377,455,386,458,394,448,395,437,395,421,395,410,396,391,395,372,394,373,474,424,476", //Door2
        "252,25,279,25,298,24,341,24,368,25,364,52,364,87,368,127,370,148,349,150,325,147,306,141,282,127,264,114,250,106,243,74,245,44,258,103,270,111,280,119,290,124,299,129,314,137,329,143,348,143,365,143,362,125,362,111,361,104,346,103,328,103,309,103,290,103,269,102,258,103,242,49", //Door3
        "368,25,392,25,419,25,434,25,437,42,445,58,453,65,464,74,475,81,474,93,469,106,458,119,450,126,441,137,430,145,419,148,408,149,389,149,369,148,368,124,367,103,362,78,364,61,365,44,376,143,397,142,411,142,427,141,440,129,451,117,458,104,442,105,425,103,408,104,393,104,373,104,364,92", //Door4
        "434,474,442,474,448,457,457,443,471,434,483,431,498,433,509,444,517,459,522,470,526,475,540,476,573,473,576,463,585,458,584,438,576,436,568,435,567,423,568,413,581,414,582,406,573,401,561,398,546,393,530,390,522,385,515,382,503,377,495,371,482,366,469,361,458,357,433,354,434,355,445,360,461,363,474,368,486,373,496,378,504,383,515,390,527,395,510,395,494,395,479,395,469,385,461,377,454,369,435,355,453,376,459,382,464,392,472,402,477,411,473,420,458,430,447,439", // Back Left
        "433,26,445,25,447,41,458,58,471,66,485,70,498,64,506,58,517,49,520,40,520,30,525,26,568,24,575,32,578,41,586,43,584,55,581,62,569,65,568,70,570,86,581,84,583,93,575,96,568,99,554,102,543,107,527,111,517,116,502,123,492,129,480,136,465,141,450,144,432,145,446,140,458,137,469,132,482,127,497,120,510,113,527,104,504,103,480,103,469,114,453,129,447,137,434,145,440,136,447,128,454,120,460,112,469,101,474,92,476,82,469,74,459,69,448,59,443,51", // Back Right
        "250,24,234,25,232,42,219,60,208,67,187,67,170,60,157,39,154,24,128,25,119,39,110,46,112,63,125,64,137,64,144,83,127,84,148,93,165,98,195,98,213,100,232,102,242,104,248,107,244,88,244,75,242,56", // Front Right
        "197,431,218,437,230,451,237,476,253,475,245,457,245,433,244,417,248,394,230,395,207,401,193,399,169,404,136,410,128,414,144,418,138,435,114,435,110,448,112,459,120,460,127,475,154,474,157,456,169,440,182,433", // Front left
        "667,248,666,166,655,163,651,158,643,159,639,163,637,197,610,198,611,303,640,304,637,336,643,342,650,340,655,336,662,334,669,328,669,296,668,276", // Back bumper map
        "18,199,18,171,26,164,32,162,38,157,45,160,48,162,60,163,70,167,69,183,69,209,64,214,64,282,69,289,69,310,69,333,57,336,50,336,42,342,36,338,24,334,19,325,21,260,18,236" // Front Bumper map
    ]


    ctx.fillStyle = isPaintJob ? 'rgba(50, 50, 50, 0.5)' : 'rgba(138, 42, 42, 0.5)';

    // Initialize flags
    coordinates.forEach(() => {
        flags.push(false);
    });

    // Function to draw the red overlay polygon
    function drawOverlay() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < coordinates.length; i++) {
            if (flags[i]) {
                const coords = coordinates[i].split(",").map(coord => parseInt(coord, 10));
                ctx.beginPath();
                ctx.moveTo(coords[0], coords[1]);
                for (let j = 2; j < coords.length; j += 2) {
                    ctx.lineTo(coords[j], coords[j + 1]);
                }
                ctx.closePath(); // Close the path to complete the polygon
                ctx.fill();
            }
        }
        // Calculate the total price for active overlays
        let totalPrice = 0;
        flags.forEach((isActive, index) => {
            if (isActive) {
                totalPrice += isPaintJob ? paintPrice[index] : rustWorkPrice[index];

            }
        });
        const formattedTotalPrice = totalPrice.toFixed(2);

        const repairPrice = parseFloat(formattedTotalPrice);
        const materialPrice = parseFloat((repairPrice / 2).toFixed(2));
        const totalPriceDisplay = parseFloat((repairPrice + materialPrice).toFixed(2));
        // Update the displayed total price
        document.getElementById('price').textContent = `${formattedTotalPrice} `;
        document.getElementById('paintPrice').textContent = repairPrice.toFixed(2);
        document.getElementById('materialPrice').textContent = materialPrice.toFixed(2);
        document.getElementById('totalPrice').textContent = totalPriceDisplay.toFixed(2);

    }

    // Function to toggle the activation of a specific overlay
    window.toggleOverlay = function (index) {
        calculatePrice()
        if (index >= 0 && index < flags.length) {
            flags[index] = !flags[index]; // Toggle the flag
            activeOverlayIndex = flags[index] ? index : -1; // Set activeOverlayIndex
            drawOverlay();
        }
    }

    // Function to activate all overlays
    window.ActivateAllOverlays = function () {
        for (let i = 0; i < flags.length; i++) {
            if (i >= 0 && i < flags.length) {
                flags[i] = true; // Toggle the flag
                activeOverlayIndex = flags[i] ? i : -1; // Set activeOverlayIndex
                drawOverlay();
            }
        }
    }

    // Function to deactivate all overlays
    window.DeactivateAllOverlays = function () {
        for (let i = 0; i < flags.length; i++) {
            if (i >= 0 && i < flags.length) {
                flags[i] = false; // Toggle the flag
                activeOverlayIndex = flags[i] ? i : -1; // Set activeOverlayIndex
                drawOverlay();
            }
        }
    }

    document.getElementById('select-all-button').addEventListener('click', ActivateAllOverlays);
    document.getElementById('deselect-all-button').addEventListener('click', DeactivateAllOverlays);

    // Initially, all overlays are inactive
    drawOverlay();
}



// Store the original image dimensions
const originalWidth = 707; // actual width of your image
const originalHeight = 500; // actual height of your image

// Get the image and map elements
const image = document.getElementById('carImage');
const map = document.getElementById('image-map');

// Update map coordinates when the window is resized
function updateMapCoordinates() {
    const newWidth = image.clientWidth;
    const widthRatio = newWidth / originalWidth;

    // Update each area tag's coordinates

    const areaTags = map.getElementsByTagName('area');
    for (let area of areaTags) {
        const originalCoords = area.getAttribute('coords').split(',');
        const newCoords = originalCoords.map(coord => Math.round(coord * widthRatio)).join(',');
        area.setAttribute('coords', newCoords);
    }
}

// Initial map coordinate update
updateMapCoordinates();

// Update map coordinates when the window is resized
window.addEventListener('resize', function (event) {
    updateMapCoordinates();
    location.reload(true);
});

window.addEventListener('beforeunload', function (event) {
    updateMapCoordinates();
    // Force a full page refresh
    location.reload(true);
});

window.addEventListener('load', () => {
    createOverlayPolygons();
});



// Function to handle keydown event for area elements
function handleKeydown(event, areaIndex) {
    if (event.key === 'Enter') {
        toggleOverlay(areaIndex);
    }
}

// Get all area elements and add event listeners for 'click' and 'keydown' events
const areas = document.querySelectorAll('area');
areas.forEach((area, index) => {
    area.addEventListener('keydown', (event) => handleKeydown(event, index));
});


// Function to handle keydown event for checkbox elements
function handleCheckboxKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        const checkbox = event.target;
        checkbox.checked = !checkbox.checked;
        calculatePrice();
    }
}


areas.forEach((area, index) => {
    area.addEventListener('click', () => toggleOverlay(index));
});

// Function to calculate the price based on selected services
function calculatePrice() {
    const checkboxes = document.querySelectorAll('.form-check-input');
    let totalPrice = 0;

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            totalPrice += parseFloat(checkbox.value);
        }
    });

    document.getElementById('totalPrice').innerText = `${totalPrice.toFixed(2)}`;
}

// Add event listeners to checkboxes
const checkboxes = document.querySelectorAll('.form-check-input');
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', calculatePrice);
    checkbox.addEventListener('keydown', handleCheckboxKeydown);
});

function updateEstimatorUIByHash() {
    createOverlayPolygons();
    const hash = window.location.hash;
    console.log("Current hash:", hash);

    const carImageSection = document.getElementById('imageContainer');
    const mapSection = document.querySelector('map');
    const selectButtons = document.getElementById('select-all-button').parentElement;
    const canvasOverlay = document.getElementById('overlayCanvas');

    const paintDetails = document.getElementById('paintJobPricing');
    const weldingDetails = document.getElementById('weldingPricing');
    const repairsTable = document.getElementById('repairsTable');

    const sectionTitle = document.getElementById('mainTitle');

    if (hash == '#paintjob' || hash == '#rustwork') {
        carImageSection.classList.remove("nodisplay");
        mapSection.classList.remove("nodisplay");
        canvasOverlay.classList.remove("nodisplay");
        selectButtons.classList.remove("nodisplay");

        sectionTitle.innerText = hash == '#paintjob' ? translate('Paint Job Estimation') : translate('Rust Work Estimation');

        paintDetails.classList.remove("nodisplay");
        weldingDetails.classList.add("nodisplay");
        repairsTable.classList.add("nodisplay");
    }
    else {
        carImageSection.classList.add("nodisplay");
        mapSection.classList.add("nodisplay");
        canvasOverlay.classList.add("nodisplay");
        selectButtons.classList.add("nodisplay");
        paintDetails.classList.add("nodisplay");

        sectionTitle.innerText = translate('Repairs Estimate');

        repairsTable.classList.remove("nodisplay");
        weldingDetails.classList.add("nodisplay");

    }
}

// Price estimator
function calculatePrice() {
  const checkboxes = document.querySelectorAll('.form-check-input');
  const totalPriceElement = document.getElementById('totalPrice');
  let totalPrice = 0;
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      totalPrice += parseFloat(checkbox.value);
    }
  });
  totalPriceElement.textContent = `Estimated Price: $${totalPrice.toFixed(2)}`;
}

window.addEventListener('DOMContentLoaded', updateEstimatorUIByHash);
window.addEventListener('hashchange', updateEstimatorUIByHash);