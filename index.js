const Convert = require('./convert_callback').Converter;

let myConvert = new Convert();
let srcFolder = __dirname + '/flac';
let desFolder = __dirname + '/mp3';
myConvert.runner(srcFolder,desFolder,{'limits' : 10}); 
