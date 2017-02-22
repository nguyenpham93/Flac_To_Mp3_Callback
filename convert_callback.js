const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const spawn = require('child_process').spawn;

let srcFolder = __dirname + '/' + 'flac';
let desFolder = __dirname + '/' + 'mp3';
let count = 0;

exports.Converter = class{

/** 
* @param src : đường dẫn thư mục flac
*
*/
//TODO : Function read folder => return array flac
getFiles(src,done){
    console.log('Converting ...');
    let results = [];
    fs.readdir(src,(err,files)=>{
        if(err) return done(err);
        let pending = files.length;
        if(!pending) return done(null,results);
        files.forEach((file)=>{
            file = path.resolve(src,file);
            fs.stat(file,(err,stats)=>{
                if(stats && stats.isDirectory()){
                    getFiles(file,(err,res)=>{
                        results= results.concat(res);
                        if(!--pending) done(null,results);
                    });
                }else{
                    results.push(file);
                    if(!--pending) done(null,results);                        
                }
            });
        });
    });
} 

//TODO : Kiểm tra và return về mảng Flac
getFlacArray(files,done){
    let results = [];
    if(!files.length) return done(null,results);
    files.forEach((file)=>{
        if(path.extname(file) === '.flac'){
            file = file.replace(srcFolder + '/','');
            results.push(file);
        }
    });
    done(null,results);
}

//TODO: Get desFolder mp3 array 
getMp3Array(files,done){
    let results = [];
    if(!files.length) return done(null,results);
    files.forEach((file)=>{
        file = file.replace('.flac','.mp3');
        results.push(file);
    });
    done(null,results);
}

//TODO : Convert single file Flac to Mp3
flacToMp3(inputFile,outputFile,done) {
    let tempdir = outputFile.replace("/" + path.basename(outputFile),'');
    // shell dùng tao subfolder
    shell.mkdir('-p',tempdir);
    let converter = spawn('ffmpeg', ['-n', '-i', inputFile, '-ab', '320k', '-map_metadata', '0', '-id3v2_version', '3', outputFile]);
    converter.on('close', (code) => {
        if (code === 0) {
            done(null,outputFile);
        }else {
            done(`File ${inputFile} already exist or caught error!!`);
        }
    });
}

//TODO: Sử dụng vòng lặp để convert từng file trong mảng
Loop(inputArr,outputArr,srcFolder,desFolder,done){
    let pending = inputArr.length;
    let filesDone = 0;
    if(inputArr.length > 0){
        let tempFlac = inputArr.slice(0);
        let tempMp3 = outputArr.slice(0);
        tempFlac.forEach((file,index)=>{
            let inputFile = srcFolder + '/' + file;
            let outputFile = desFolder + '/' + tempMp3[index];
            if(count < 2){
                count++;
                inputArr.shift();
                outputArr.shift();
                this.flacToMp3(inputFile,outputFile,(error,res)=>{
                    if(error){
                        fs.writeFile(__dirname + "/log.txt",error,(err)=>{
                            if(err) throw err;
                        });
                    }
                    count--;
                    filesDone++;
                    if(!--pending) done(null,filesDone);  
                    this.Loop(inputArr,outputArr,srcFolder,desFolder,(err,res)=>{
                        filesDone += res;
                        pending -= res;
                        if(!pending) return done(null,filesDone);
                    });  
                });
            }
        });
    }else{
        done(null,filesDone);
    }
}

//TODO : run application
runner(srcFolder,desFolder){
    console.time("time convert:");
    this.getFiles(srcFolder,(err,res)=>{
        this.getFlacArray(res,(err,res)=>{
            let arrFlac = res;
            this.getMp3Array(arrFlac,(err,res)=>{
                let arrMp3 = res;
                this.Loop(arrFlac,arrMp3,srcFolder,desFolder,(err,res)=>{
                    console.log(`Đã convert xong : ${res} files`);
                    console.timeEnd('time convert:');
                });
            });
        });
    });
}
} 






