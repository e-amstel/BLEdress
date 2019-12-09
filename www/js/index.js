 //   Licensed to Apache Software Foundation
 //   Startup: cordova build/run android
    
    // Application object.
	var app = {}
    
        // Connected device.
        app.device = null;
        
        //define rgb int
        var rgb;
        var redLed = 50;
        var greenLed = 0;
        var blueLed = 0;

        var state = 0;

    //CAMERA open device camera and take picture, save picture
        app.takePhoto = function(){
            var options = {
                quality: 49, //below 50 to avoid memory error on ios
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA,
                mediaType: Camera.MediaType.PICTURE,
                encodingType: Camera.EncodingType.JPEG,
                cameraDirection: Camera.Direction.BACK, //quirk in android makes that it usually ends up facing front anyway
                saveToPhotoAlbum: true,
                correctOrientation: true //Corrects Android orientation quirks
            // orientation: 'portrait'
            }
            navigator.camera.getPicture(app.success, app.fail, options); //getting the picture & activate success or fail functions
        };        
        app.success = function(imgURI){ 
            console.log("the force is with you");
            app.drawPhoto(imgURI);
          //  console.log(imgURI);
        };
        app.fail = function(){
            console.log("nope");
        };
    //draws photo on canvas, called by takePhoto
        app.drawPhoto = function(takenPhoto){
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
          //  app.resizeCanvas(canvas); //optional 
            var photo = new Image;
            photo.onload = function(){
            //ctx.drawImage(photo,0,0,600, 400 * photo.height / photo.width); // om relatieve hoogte te tekenen
            ctx.drawImage(photo,0,0, canvas.width, canvas.height);
            //checks
            console.log("photo been drew");
            //update  de kleur
            state = 3;
            app.colorChange();
            };
            photo.src = takenPhoto;
        };

    //resets canvas to default color blue
        app.colorReset = function(){
            var c = document.getElementById("canvas");
            var ctx = c.getContext("2d");
            ctx.fillStyle = "rgb(0,0,255)"; //blue
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            state = 1;
            app.colorChange();
        };
        app.colorOff = function(){
            var c = document.getElementById("canvas");
            var ctx = c.getContext("2d");
            ctx.fillStyle = "rgb(0,0,0)"; //black
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            state = 2;
            app.colorChange();
        };
    //triggers find average colour of the current image on the canvas
    //updates led values to reflect average value
    //called by colorChange function
        app.updateColor = function(){
            var
                fac = new FastAverageColor(),
                container = document.querySelector('.app-body'), //container that holds canvas (not relevant for fac functionality)
                color = fac.getColor(canvas);
            container.style.backgroundColor = color.rgb; //changes container colour to reflect output
            document.getElementById("canvastext").innerHTML = color.rgb;
            container.style.color = color.isDark ? '#fff' : '#000'; //changes the font colour to readable
            //console.log(color.rgb);
            rgb = color.rgb; //sets default rgb var to fac output
            rgb = rgb.replace(/[^\d,]/g, '').split(','); 	//split rgb in r g b 
            redLed = rgb[0]; //changes vars to the rgb array values
            greenLed = rgb[1];
            blueLed = rgb[2];
            // if (container.style.color = color.isDark){
            //     redLed = Math.floor(redLed/2);
            //     greenLed = Math.floor(greenLed/2);
            //     blueLed = Math.floor(blueLed/2);
            // }
            console.log(rgb);
        };
        // updates the colour and sends it to arduino
        app.colorChange = function()
        {	
            app.updateColor(); //chooses the average colour of the image currently on the canvas
            app.device && app.device.writeDataArray(new Uint8Array([state, redLed, greenLed, blueLed]), '0000ffe1-0000-1000-8000-00805f9b34fb');
        };
//0000ffe1-0000-1000-8000-00805f9b34fb
        app.showMessage = function(info)
        {
            document.getElementById('info').innerHTML = info
        };
    
        // Called when BLE and other native functions are available.
        app.onDeviceReady = function()
        {
            app.showMessage('Touch the connect button to begin.');
            console.log(navigator.camera);
            
        };
    
        app.connect = function()
        {
            evothings.arduinoble.close();
            evothings.arduinoble.connect(
                'HMSoft', // Name of the module.
                function(device)
                {
                    
                    app.device = device;
                    app.showMessage('Connected!');
                    app.colorReset();
                },
                function(errorCode)
                {
                    app.showMessage('Connect error: ' + errorCode + '.');
                });
        };
    
        document.addEventListener(
            'deviceready',
            function() { evothings.scriptsLoaded(app.onDeviceReady) },
            false);