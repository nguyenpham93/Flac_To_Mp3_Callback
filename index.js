const Converter = require('./convert_callback').Converter;

let myConvert = new Converter();
let srcFolder = __dirname + "/flac";
let desFolder = __dirname + "/mp3";
myConvert.runner(srcFolder,desFolder);