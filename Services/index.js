import express from 'express'
import path from "path"; 
import fse from "fs-extra";
import multiparty from "multiparty";
import bodyParser from "body-parser";
 
const app = express(); 
const __dirname = path.resolve(path.dirname('')); 
const UPLOAD_FILES_DIR = path.resolve(__dirname, "./filelist") 
const jsonParser = bodyParser.json({ extended: false });

 
// 跨域请求设置
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next()
})  


app.post('/upload',  async (req, res) => {  
  const multipart = new multiparty.Form();
  multipart.parse(req, async (err, fields, files) => { 
    if (err) return;
     
  
   console.log( '服务端查看接口', fields, files  );
 
    
    



  })
   
  
})

  


app.listen(3001 , () => { 
    console.log('listen:3001');
})