const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const spawn = require('child_process').spawn;

exports.Converter = class{

constructor(){
    this.count = 0;
    this.defaultOptions = {
        'limits' : 5,
        'flag' : '-n'
    };
    this.totalPercent = 0;
    this.percentPerFile = 0;
    this.totalFiles = 0;
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
flacToMp3(inputFile,outputFile,options,done) {
    let tempdir = outputFile.replace("/" + path.basename(outputFile),'');
    // shell dùng tao subfolder
    shell.mkdir('-p',tempdir);
    let converter = spawn('ffmpeg', [options.flag, '-i', inputFile, '-ab', '320k', '-map_metadata', '0', '-id3v2_version', '3', outputFile]);
    converter.on('close', (code) => {
        if (code === 0) {
            done(null,inputFile);
        }else {
            done(`File ${inputFile} already exist or caught error!!`,inputFile);
        }
    });
}

calPercent(){
    this.totalPercent += this.percentPerFile; 
    let per = this.totalPercent;
    return per.toFixed(2);
}

calPercentPerFile(total){
    return 100/total;
}
/**
* @param inputArr : mảng chứa path files flac
* @param outputArr : mảng chứa path files mp3
* @param srcFolder : thư mục chứa file flac
* @param desFolder : thư mục chứa file đã convert sang mp3
*/
//TODO: Sử dụng vòng lặp để convert từng file trong mảng
Loop(inputArr,outputArr,srcFolder,desFolder,options,done){
    let pending = inputArr.length;
    let donefiles = 0;
    let errorfiles = 0;
    if(!pending) return done(errorfiles,donefiles); 
    let tempFlac = inputArr.slice(0);
    let tempMp3 = outputArr.slice(0);
    tempFlac.forEach((file,index)=>{
        let inputFile = srcFolder + '/' + file;
        let outputFile = desFolder + '/' + tempMp3[index];
        // Giới hạn convert tối đa số files dựa vào tham số option limits
        if(this.count < options.limits){
            this.count++;
            inputArr.shift();
            outputArr.shift();
            this.flacToMp3(inputFile,outputFile,options,(error,res)=>{
                if(error){
                    fs.writeFile(__dirname + "/log.txt",`${error} \n`,{'flag':'a'},(err)=>{
                        errorfiles++;
                    });
                }
                // Tính phần trăm hoàn thành
                let curPercent = this.calPercent();
                console.log(`${res} done \n ${curPercent}% completed`);
                this.count--;
                donefiles++;
                if(!inputArr.length){
                    if(!--pending) return done(errorfiles,donefiles);         
                }else{
                    this.Loop(inputArr,outputArr,srcFolder,desFolder,options,(err,res)=>{
                        donefiles += res;
                        if(!--pending) return done(errorfiles,donefiles); 
                    }); 
                }
            });
        }else{
            if(!--pending) return done(errorfiles,donefiles); 
        }
    });
}

/**
* @param srcFolder : thư mục chứa file flac
* @param desFolder : thư mục chứa file đã convert sang mp3
*/
//TODO : run application
runner(srcFolder,desFolder,options){
    console.time("Time during");
    console.log('Converting ...');
    if(!options) options = this.defaultOptions;
    if(!options.limits) options.limits = this.defaultOptions.limits;
    if(!options.flag) options.flag = this.defaultOptions.flag;
    this.getFiles(srcFolder,(err,res)=>{
        this.getFlacArray(res,srcFolder,(err,res)=>{
            let arrFlac = res;
            this.percentPerFile = this.calPercentPerFile(arrFlac.length);
            this.totalFiles = arrFlac.length;
            console.log(`Total files : ${this.totalFiles}`);
            this.getMp3Array(arrFlac,(err,res)=>{
                let arrMp3 = res;
                this.Loop(arrFlac,arrMp3,srcFolder,desFolder,options,(err,res)=>{
                    let complete = res - err;
                    console.log(`Convert completed : ${complete} files`);
                    console.log(`Error files : ${err} files`);
                    console.timeEnd('Time during');
                });
            });
        });
    });
}
} 






