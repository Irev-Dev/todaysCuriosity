import loadImage from "blueimp-load-image";
import todaysCuriosity from './todays-curiosity';
import george from './george.jpg';


// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // alert('file api works')
} else {
  alert('Oh no, looks like your browser might be a bit old for this app to work. Maybe try the latest Chrome or Firefox.');
}

let curiosity;

const defaultImage = new Image();
defaultImage.src = george;
defaultImage.onload = () => {
  curiosity = new todaysCuriosity(defaultImage);
  imageSetup(defaultImage);
};

document.getElementById('file-input').onchange = function (e) {
  loadImage(
      e.target.files[0],
      imageSetup,
      {maxWidth: 2000} // Options
  );
};

document.getElementById('get-url').onclick = function (e) {
  e.preventDefault();
  const fileUrl = document.getElementById('file-url').value;
  document.getElementById('file-url-error').style.display = "none";

  // Check if url is valid
  if (!domainValid(fileUrl)) {
    document.getElementById('file-url-error').style.display = "block";
  } else {
    fetch(fileUrl)
    .then(response => response.blob())
    .then(blob => {
      loadImage(
        blob,
        imageSetup,
        {maxWidth: 2000} // Options
      );
    })
  }
}

// Initial sliders output value
document.querySelectorAll('.slider').forEach(slider => document.getElementById(`${slider.id}-output`).value = slider.value)

// Valid if url is valid
function domainValid (url) {
  return /^((http|https):\/\/)?(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})/gm.test(url)
}

function imageSetup (img) {
  console.log(img)
  curiosity.baseImage = img;
  curiosity.paintInputImage();
  curiosity.createBrightpixels();

  const {inputCanvas, outputCanvas} = document.getElementById('switch').checked ? curiosity.getReducedPixelBlocks() : curiosity.getReversedPixelBlocks();

  const inputDiv = document.getElementById('input-display');
  inputDiv.appendChild(inputCanvas);
  const outputDiv = document.getElementById('output-display');
  outputDiv.appendChild(outputCanvas);
  
  SetupUpdateEvents(curiosity);
};

function SetupUpdateEvents(curiosity) {
  const updateAfterSliderChange = (event) => {
    const sliderOutputToBeUpdated = document.getElementById(`${event.target.id}-output`);
    sliderOutputToBeUpdated.value = event.target.value; 
    
    const curiosityKeyToUpdate = event.target.dataset.key;
    const percentageKeys = ['reductionRatio', 'xOffset', 'yOffset'];

    if (percentageKeys.includes(curiosityKeyToUpdate)) {
      curiosity[curiosityKeyToUpdate] = event.target.value / 100;  
    } else {
      curiosity[curiosityKeyToUpdate] = event.target.value;  
    }

    document.getElementById('switch').checked ? curiosity.getReducedPixelBlocks() : curiosity.getReversedPixelBlocks();
  };

  const updateAfterSwitchChange = () => {
    document.getElementById('switch').checked ? curiosity.getReducedPixelBlocks() : curiosity.getReversedPixelBlocks();
    const stateText = document.querySelector(".state");
    document.getElementById('switch').checked ? stateText.textContent = 'Reduced' : stateText.textContent = 'Reversed';
  }
  
  const sliders = document.querySelectorAll('.slider');
  sliders.forEach(slider => slider.addEventListener('input', updateAfterSliderChange));
  
  const toggleSwitch = document.getElementById('switch');
  toggleSwitch.addEventListener('input', updateAfterSwitchChange);
}
