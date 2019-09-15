let net;
// Limiting the Training class to 5
const MAX_CLASS = 5;

// Retrieve the webcam instance
const webcamElement = document.getElementById('webcam-input');

// Create KNN Classifier instance
const classifier = knnClassifier.create();

let numberOfActiveClasses = 2;

// Color hex codes for dynamically assigning the Train button and Progress bar
var colors = ['#2baa5e', '#c95ac5', '#EF880A', '#11598E', '#8EC640', '#029548', '#F8EC31', '#1875BC', '#FCBE2E', '#26B673', '#20A9E1', '#E5E5E5'];

async function app() {
    console.log('Loading mobilenet..');

    // Load the model.
    net = await mobilenet.load();
    console.log('Successfully loaded model');
    $('#wait').modal('hide');

    await setupWebcam();

    // Reads an image from the webcam and associates it with a specific class index.
    const addExample = classId => {
        // Get the intermediate activation of MobileNet 'conv_preds' and pass that to the KNN classifier.
        const activation = net.infer(webcamElement, 'conv_preds');

        // Pass the intermediate activation to the classifier.
        classifier.addExample(activation, classId);
    };

    // When clicking a button, add an example for that class.
    document.getElementById('btn-class-1').addEventListener('click', () => addExample(1));
    document.getElementById('btn-class-2').addEventListener('click', () => addExample(2));
    document.getElementById('btn-class-3').addEventListener('click', () => addExample(3));
    document.getElementById('btn-class-4').addEventListener('click', () => addExample(4));
    document.getElementById('btn-class-5').addEventListener('click', () => addExample(5));

    while (true) {
        if (classifier.getNumClasses() > 0) {
            // Get the activation from mobilenet from the webcam.
            const activation = net.infer(webcamElement, 'conv_preds');
            // Get the most likely class and confidences from the classifier module.
            const result = await classifier.predictClass(activation, MAX_CLASS);
            
            con = result.confidences;
            $.each(result.confidences, function(index, element) {
                $('#progress-bar-class-'+index).width((element*100) + '%');
                $('#progress-bar-class-'+index).text((element*100) + '%');
            });
        }

        await tf.nextFrame();
    }
}

async function setupWebcam() {
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                    video: true
                },
                stream => {
                    webcamElement.srcObject = stream;
                    webcamElement.addEventListener('loadeddata', () => resolve(), false);
                },
                error => reject());
        } else {
            reject();
        }
    });
}

$('#wait').modal('show');
app();

$(document).ready(function () {
    $('.btn-train').each(function (index, valve) {
        $(this).css('background-color', colors[index]);
        $(this).css('border-color', colors[index]);
    });
    $('.progress-bar').each(function (index, valve) {
        $(this).css('background-color', colors[index]);
    });

    // $('.class-train-section').on('click', '.btn-train', function (event) {
    // $(this).html('Training...');
    // });
    $('.btn-train').on('click', function (event) {
        samples = $(this).closest('.card-body').find('.samples')[0];
        c = samples.textContent;c++;
        samples.textContent = c;
    });

    $('.btn-add-class').on('click', function (event) {
        numberOfActiveClasses++;
        if (numberOfActiveClasses <= 5) {
            document.querySelector('.class-train-section').querySelector('.d-none').classList.remove('d-none');
            document.querySelector('.output-section').querySelector('.d-none').classList.remove('d-none');
        } else {
            allert('Sorry! Only 5 classes can be trained');
        }
    });

    $('.class-title').on('change', function (event) {
        val = $(this).val();
        $('#' + $(this).data('output-id')).html(val);
    });
});