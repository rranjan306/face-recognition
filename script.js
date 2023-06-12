const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

function getLabeledFaceDescriptions() {
  const labels = ["deepak"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpeg`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

async function startWebcam() {
  navigator.mediaDevices.getUserMedia({video: true}).then(async (stream) => {
    video.srcObject = stream;
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]);

    //recognizeFace();
  });
}

async function snapshot() {
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  let imageData = canvas.toDataURL("image/png");
  let img = new Image();
  img.src = imageData;
  processImage(img);
}

async function processImage(image) {
  let detectedFace = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceExpressions().withFaceDescriptor();
  console.log(detectedFace);
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  const displaySize = { width: canvas.width, height: canvas.height };
  const resizedDetections = faceapi.resizeResults(detectedFace, displaySize);
  const result = faceMatcher.findBestMatch(resizedDetections.descriptor);
  if (!result) {
    throw new Error(`no faces detected`);
  }

  if(result._label === 'unknown') {
    const h1 = document.createElement('h1');
    h1.innerHTML = `Unauthorized user! try after some time`;
    document.body.append(h1);
  }

  if(result._label !== 'unknown') {
    const h1 = document.createElement('h1');
    h1.innerHTML = `Welcome ${result._label}`;
    document.body.append(h1);
  }
  console.log('result', result);
}

// async function recognizeFace() {
//   const displaySize = { width: video.width, height: video.height };
//   faceapi.matchDimensions(canvas, displaySize);
//   setInterval(async () => {
//     const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
//     const resizedDetections = faceapi.resizeResults(detections, displaySize);
//     canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
//     faceapi.draw.drawDetections(canvas, resizedDetections);
//     faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
//     faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
//   }, 100);
//   // video.addEventListener('play', async () => {
//   //   const canvas = faceapi.createCanvasFromMedia(video)
//   //   document.body.append(canvas)
//   //   const displaySize = { width: video.width, height: video.height }
//   //   faceapi.matchDimensions(canvas, displaySize)
//   //   setInterval(async () => {
//   //     const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
//   //     const resizedDetections = faceapi.resizeResults(detections, displaySize)
//   //     canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
//   //     faceapi.draw.drawDetections(canvas, resizedDetections)
//   //     faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
//   //     faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
//   //   }, 100)
//   // });
// }