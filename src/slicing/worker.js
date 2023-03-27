import SparkMD5 from 'spark-md5'



const workerCode = () => {
      
    onmessage = (e = {}) => {  
      const { data } = e 
      const { file, CHUNK_SIZE} = data;
      let blobSlice = File.prototype.slice || File.prototype.mozSlice|| File.prototype.webkitSlice;
      let chunks = Math.ceil(file.size / CHUNK_SIZE); 
      // let spark = new SparkMD5.ArrayBuffer();
      let currentChunk = 0; 
      let fileReader = new FileReader();


     const workerResult = `Received from main${CHUNK_SIZE}` ;  
   

     fileReader.onload = function (e) {
      //  const chunk = e.target.result;
      //  spark.append(chunk);
       currentChunk++;
      
       if (currentChunk < chunks) {
         loadNext();
       } else {
        //  let fileHash = spark.end();
        //  console.info('finished computed hash', fileHash);
         // 此处为重点，计算完成后，仍然通过postMessage通知主线程
         postMessage({ fileHash: 1111, fileReader })
       }
      };
      
 
      function loadNext() {
       let start = currentChunk * CHUNK_SIZE;
       let  end = ((start +CHUNK_SIZE) >= file.size) ? file.size: start + CHUNK_SIZE;
       let chunk = blobSlice.call(file, start, end);
       fileReader.readAsArrayBuffer(chunk);
      }
      loadNext();
 
  
    // postMessage(workerResult);    
     
  
  
  }
};
 
let code = workerCode.toString();
code = code.substring(code.indexOf("{")+1, code.lastIndexOf("}"));

const blob = new Blob([code], {type: "application/javascript"});
const worker_script = URL.createObjectURL(blob);
 
 
export default worker_script;
 