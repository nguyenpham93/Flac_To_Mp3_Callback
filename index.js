const Converter = require('./convert_callback').Converter;

let myConvert = new Converter();
let srcFolder = __dirname + "/flac";
let desFolder = __dirname + "/mp3";


console.time("Time during");
myConvert.runner(srcFolder,desFolder,(err,res)=>{
    console.log(`Convert completed : ${res} files`);
    console.timeEnd('Time during');
});
