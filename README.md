# Flac_to_mp3 using callback function
 <h3>Requirement :</h3>
 - Convert file with flac extension to mp3 using Callback function  
 - Return destination folder with same structure of source f
 - Files error or existed will be written to log.txt
 - Do not convert if files exist  
 - After convert completed display time duration
 <h3>RUN DEMO</h3></br>
 <pre>
 
 git clone https://github.com/nguyenpham93/Flac_To_Mp3_Callback.git
 
 cd Flac_To_Mp3_Callback
 
 npm install
 
 Mac OSX : brew install ffmpeg 
 Or 
 Linux : sudo apt-get install ffmpeg 
 
 node index.js
 </pre>
 <h3>Module uses :</h3>
 - Use module ffmpeg.js to convert flac to mp3  : 
 <pre>spawn('ffmpeg', ['-n', '-i', inputFile, '-ab', '320k', '-map_metadata', '0', '-id3v2_version', '3', outputFile]);</pre>
 - Callback function  
 - Child-process 
 - Module shelljs : create s 
 <h3>1/ convert_callback.js</h3>
 - getFiles(src,done) : return array contains all files of source folder (not contain folder)
 - getFlacArray(files,done) : pass through source array, checking and return files with flac extension array
 - getMp3Array(files,done) : change files with flac extension mp3 extension       
 - flacToMp3(input,output,done) : convert file flac to mp3(In case file already exist, file will not be converted by default and be written to file log.txt)
 - Loop(arrayFlac,arrMp3,src,des,options,done) : use loop to pass through flac files array and converting
 - runner(srcFolder,desFolder,options) : main function to run application
 </br>
 
 <h3>2/ index.js</h3>
 - Run convert.runner(src,des[,options]) to convert<br/>
   + src: <String> path to source folder<br/>
   + des : <String> path to destination folder<br/>
   + options : <Object> <br/>
     + 'flag': <code>'-y'</code>  if files exist replace it. By default, <code> '-n'</code> not replace file and exit converting<br/>
     + 'limits' : allow convert files with limitation
