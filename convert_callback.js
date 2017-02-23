const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const spawn = require('child_process').spawn;

exports.Converter = class{

constructor(){
    this.count = 0;
}
/** 
* @param src : đường dẫn thư mục gốc cần convert
*/
//TODO : đọc và trả về mảng chứa toàn bộ files trong thư mục gốc
getFiles(src,done){
    let results = [];
    fs.readdir(src,(err,files)=>{
        if(err) return done(err);
        let pending = files.length;
        if(!pending) return done(null,results);
        files.forEach((file)=>{
            file = path.resolve(src,file);
            fs.stat(file,(err,stats)=>{
                if(stats && stats.isDirectory()){
                    this.getFiles(file,(err,res)=>{
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

/**
* @param files : mảng chứa toàn bộ files trong thư mục gốc
*/
//TODO : Kiểm tra và return về mảng Flac
getFlacArray(files,srcFolder,done){
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

/**
* @param files : mảng chứa files flac
*/
//TODO: trả về mảng chứa đường dẫn output
getMp3Array(files,done){
    let results = [];
    if(!files.length) return done(null,results);
    files.forEach((file)=>{
        file = file.replace('.flac','.mp3');
        results.push(file);
    });
    done(null,results);
}

/**
* @param inputFile : đường dẫn file flac cần convert
* @param outputArr : đường dẫn file mp3 output ra
*/
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

/**
* @param inputArr : mảng chứa path files flac
* @param outputArr : mảng chứa path files mp3
* @param srcFolder : thư mục chứa file flac
* @param desFolder : thư mục chứa file đã convert sang mp3
*/
//TODO: Sử dụng vòng lặp để convert từng file trong mảng
Loop(inputArr,outputArr,srcFolder,desFolder,done){
    let pending = inputArr.length;
    let donefiles = 0;
    if(!pending) return done(null,donefiles); 
        let tempFlac = inputArr.slice(0);
        let tempMp3 = outputArr.slice(0);
        tempFlac.forEach((file,index)=>{
            let inputFile = srcFolder + '/' + file;
            let outputFile = desFolder + '/' + tempMp3[index];
            // Giới hạn convert tối đa 5 files
            if(this.count < 2){
                this.count++;
                inputArr.shift();
                outputArr.shift();
                this.flacToMp3(inputFile,outputFile,(error,res)=>{
                    if(error){
                        fs.writeFile(__dirname + "/log.txt",`${error} \n`,{'flag':'a'},(err)=>{
                            if(err) throw err;
                        });
                    }
                    this.count--;
                    donefiles++;
                    if(!inputArr.length){
                        if(!--pending) return done(null,donefiles);         
                    }else{
                       this.Loop(inputArr,outputArr,srcFolder,desFolder,(err,res)=>{
                            donefiles += res;
                            if(!--pending) return done(null,donefiles); 
                        }); 
                    }
                });
            }else{
                if(!--pending) return done(null,donefiles); 
            }
        });
}

/**
* @param srcFolder : thư mục chứa file flac
* @param desFolder : thư mục chứa file đã convert sang mp3
*/
//TODO : run application
runner(srcFolder,desFolder,done){
    console.log('Converting ...');
    this.getFiles(srcFolder,(err,res)=>{
        this.getFlacArray(res,srcFolder,(err,res)=>{
            let arrFlac = res;
            this.getMp3Array(arrFlac,(err,res)=>{
                let arrMp3 = res;
                this.Loop(arrFlac,arrMp3,srcFolder,desFolder,(err,res)=>{
                    done(null,res);
                });
            });
        });
    });
}
} 






