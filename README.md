# Flac_to_mp3 using callback function
 <h3>Yêu cầu :</h3>
 - Convert file định dạng flac sang mp3 sử dụng Callback f
 - Trả về thư mục file mp3 có cấu trúc giống thư mục flac
 - Khi convert những files nào bị lỗi hoặc không đúng định dạng sẽ được xử lý riêng và log vào log.txt
 - Những files nào đã convert thì sẽ không convert lại
 - Convert xong sẽ hiển thị execute time, tối ưu chương trình
 <h3>Chạy thử ứng dụng</h3></br>
 <pre>
 git clone https://github.com/nguyenpham93/Flac_To_Mp3_Callback.git
 cd Flac_To_Mp3_Callback
 npm install
 node index.js
 </pre>
 <h3>Các kỹ thuật sử dụng</h3>
 - Dùng module ffmpeg.js để convert flac to mp3 (nếu file đã tồn tại thì không c) : 
 <pre>spawn('ffmpeg', ['-n', '-i', inputFile, '-ab', '320k', '-map_metadata', '0', '-id3v2_version', '3', outputFile]);</pre>
 - Callback function  
 - Child-process 
 - Module shelljs : Dùng tạo subfolder 
 <h3>1/ convert_callback.js</h3>
 - getFiles(src,done) : đọc toàn bộ files trong thư mục src (không chứa folder)
 - getFlacArray(files,done) : kiểm tra và trả về mảng files flac
 - getMp3Array(files,done) : Đổi từ mảng có đuôi .Flac sang mảng có đuôi .Mp3
 - flacToMp3(input,output,done) : convert file (nếu file bị lỗi hoặc đã tồn tại sẽ ghi vào file log.txt)
 - Loop(arrayFlac,arrMp3,src,des,done) : chạy vòng lặp qua từng file trong mảng arrayFlac và tiến hành gọi hàm flacToMp3() để convert.
 - runner(srcFolder,desFolder) : hàm chạy toàn bộ chương trình, 2 tham số : đầu vào và đầu ra
 </br>
 
 <h3>2/ index.js</h3>
 - Tạo object và chạy hàm convert.runner(src,des,callback); 
