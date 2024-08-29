var currentimg = document.getElementById("currentImage");
// var binaryimg = document.getElementById("binaryImage");
var processedimg = document.getElementById("processedImage");
var ws = new WebSocket("ws://" + location.host + "/stream");

ws.onopen = function() {
    console.log("connection was established");
    // ws.send("next");
};

// Any server-side updates are notified via a json object 
ws.onmessage = function(event) {
    console.log(`Received message: ${event.data}`);

    // Parse the JSON data
    const data = JSON.parse(event.data);

    // Update the form fields with the values from the JSON data
    const productsDetectedField = document.getElementById('products-detected');
    const promptResponseField = document.getElementById('prompt-response');

    if (data.products_found !== undefined) {
        console.log(`Products Found`);
        productsDetectedField.value = data.products_found;
    }

    if (data.prompt_response !== undefined) {
        promptResponseField.value = data.prompt_response;
    }
};

// // Once an image has been refreshed this code will fire and request another 
// currentimg.onload = function() {
//   ws.send("next");
// }

// Function to send a message to the server with the requested image frame
// function sendWs(msgType) {
//   if (ws.readyState === WebSocket.OPEN) {
//     ws.send(JSON.stringify({ type: msgType }));
//   } else {
//     console.error("WebSocket connection is closed.");
//   }
// }


//Establish WebSocket connection for the current images
var currentImageSocket = new WebSocket("ws://" + location.host + "/currentimage");

// Handle incoming "current" images
currentImageSocket.onmessage = function(event) {
  if (event.data instanceof Blob) {
      // // Get the existing image element by its ID
      const currentimg = document.getElementById('currentImage');
      
      // Create an object URL from the Blob and set it as the src of the image
      currentimg.src = URL.createObjectURL(event.data);

      // Optionally, manage memory by revoking the object URL once the image is loaded
      currentimg.onload = () => {
          URL.revokeObjectURL(currentimg.src); // Clean up the object URL to release memory
          currentImageSocket.send("next");
      };
  }
}

currentImageSocket.onopen = function() {
  console.log("connection was established for current images");
  currentImageSocket.send("next");
};

// // Once an image has been refreshed this code will fire and request another 
// binaryimg.onload = function() {
//   URL.revokeObjectURL(binaryimg.src); // Clean up the object URL to release memory
//   processedImageSocket.send("next");
// }

// Establish WebSocket connection for processed images
var processedImageSocket = new WebSocket("ws://" + location.host + "/processedimage");

processedImageSocket.onmessage = function(event) {
  if (event.data instanceof Blob) {
      // Get the existing image element by its ID
      const processedimg = document.getElementById('processedImage');
      
      // Create an object URL from the Blob and set it as the src of the image
      processedimg.src = URL.createObjectURL(event.data);

      // Optionally, manage memory by revoking the object URL once the image is loaded
      processedimg.onload = () => {
          URL.revokeObjectURL(processedimg.src); // Clean up the object URL to release memory
          processedImageSocket.send("next");
      };
  }
}

processedImageSocket.onopen = function() {
  console.log("connection was established for processed images");
  processedImageSocket.send("next");
};

// // Once an image has been refreshed this code will fire and request another 
// processedImageSocket.onload = function() {
//   ws.send("next");
// }

document.addEventListener('DOMContentLoaded', function () {
    const presetsDropdown = document.getElementById('presets');
    const localEndpointInput = document.getElementById('local-endpoint');
    const cloudEndpointInput = document.getElementById('cloud-endpoint');
    const resizeWidthInput = document.getElementById('resize-width');
    const resizeHeightInput = document.getElementById('resize-height');
    const waitTimeInput = document.getElementById('wait-time');
    const convertGrayCheckbox = document.getElementById('convert-gray');
    const processLocallyCheckbox = document.getElementById('process-locally');
    const processRemotelyCheckbox = document.getElementById('process-remotely');
    const sendToHubCheckbox = document.getElementById('send-to-hub');

    // Check if any of the elements are not found
    if (!presetsDropdown) console.error('Element with ID "presets" not found.');
    if (!localEndpointInput) console.error('Element with ID "local-endpoint" not found.');
    if (!cloudEndpointInput) console.error('Element with ID "cloud-endpoint" not found.');
    if (!resizeWidthInput) console.error('Element with ID "resize-width" not found.');
    if (!waitTimeInput) console.error('Element with ID "wait-time" not found.');
    if (!resizeHeightInput) console.error('Element with ID "resize-height" not found.');
    if (!convertGrayCheckbox) console.error('Element with ID "convert-gray" not found.');
    if (!processLocallyCheckbox) console.error('Element with ID "process-locally" not found.');
    if (!processRemotelyCheckbox) console.error('Element with ID "process-remotely" not found.');
    if (!sendToHubCheckbox) console.error('Element with ID "send-to-hub" not found.');

    if (presetsDropdown) {
        presetsDropdown.addEventListener('change', function () {
            const selectedPreset = presetsDropdown.value;

            // Set values based on the selected preset
            switch (selectedPreset) {
                case 'llama-llava':
                    localEndpointInput.value = 'http://image-classifier-service:80/image';
                    cloudEndpointInput.value = 'http://192.168.2.21:7071/api/AnalyzeImage/llama';
                    resizeWidthInput.value = 672; // Must match model input-layer
                    resizeHeightInput.value = 672; 
                    waitTimeInput.value = 5; // No external hosts for such models
                    convertGrayCheckbox.checked = false;
                    processLocallyCheckbox.checked = false;
                    processRemotelyCheckbox.checked = true;
                    sendToHubCheckbox.checked = false;
                    break;
                
                case 'gpt-4o':
                    localEndpointInput.value = 'http://image-classifier-service:80/image';
                    cloudEndpointInput.value = 'http://192.168.2.21:7071/api/AnalyzeImage/OpenAI';
                    resizeWidthInput.value = 672; 
                    resizeHeightInput.value = 672; 
                    waitTimeInput.value = 3; // Costs are high for these models currently
                    convertGrayCheckbox.checked = false;
                    processLocallyCheckbox.checked = true;
                    processRemotelyCheckbox.checked = false;
                    sendToHubCheckbox.checked = false;
                    break;
                
                case 'product-detection':
                    localEndpointInput.value = 'http://image-classifier-service:80/image';
                    cloudEndpointInput.value = 'http://192.168.2.21:7071/api/AnalyzeImage/Azure';
                    resizeWidthInput.value = ''; // Use original image size
                    resizeHeightInput.value = ''; 
                    waitTimeInput.value = 3; // The product detection API costs circa £3.893/1K transactions
                    convertGrayCheckbox.checked = false;
                    processLocallyCheckbox.checked = false;
                    processRemotelyCheckbox.checked = true;
                    sendToHubCheckbox.checked = false;
                    break;
                
                case 'edge':
                    localEndpointInput.value = 'http://object-detection-service:80/image';
                    cloudEndpointInput.value = '';
                    resizeWidthInput.value = '1280'; // Use original image size
                    resizeHeightInput.value = '720'; 
                    waitTimeInput.value = 0.1; // No costs
                    processLocallyCheckbox.checked = true;
                    processRemotelyCheckbox.checked = false;
                    sendToHubCheckbox.checked = false;
                    break;
            }
        });
    }

    // Set the default value to edge
    presetsDropdown.value = 'edge';  // Set this to the value you want to select
    // Trigger the 'change' event to load form data from this selection
    const event = new Event('change');
    presetsDropdown.dispatchEvent(event);

    // Add event listeners to play/pause buttons
    const updateButton = document.getElementById('update-button');

    updateButton.addEventListener('click', function () {
        // Serialize the form data into a JSON object
        const formData = {
            localEndpoint: localEndpointInput.value,
            cloudEndpoint: cloudEndpointInput.value,
            resizeWidth: resizeWidthInput.value,
            resizeHeight: resizeHeightInput.value,
            waitTime: waitTimeInput.value,
            convertGray: convertGrayCheckbox.checked,
            processLocally: processLocallyCheckbox.checked,
            processRemotely: processRemotelyCheckbox.checked,
            sendToHub: sendToHubCheckbox.checked
        };

        const jsonData = JSON.stringify(formData, null, 2); // Pretty print with 2 spaces
        ws.send(jsonData)
    });

});
