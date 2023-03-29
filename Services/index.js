
const express = require('express') 
const path = require("path");
const fse =  require("fs-extra");
const bodyParser = require("body-parser"); 
const multiparty =require("multiparty");
 
const app = express(); 
const _dirname = path.resolve(path.dirname('')); 
const UPLOAD_FILES_DIR = path.resolve(_dirname, "./fileList") 
const jsonParser = bodyParser.json({ extended: false });

 
// 跨域请求设置
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next()
})  

app.post('/upload', async (req, res) => {
  const multipart = new multiparty.Form();
  multipart.parse(req, async (err, fields, files) => {
    if (err) return;
    const [chunk] = files.chunk;
    const [hash] = fields.hash;
  
    const chunksDir = path.resolve(UPLOAD_FILES_DIR, hash.split("-")[0]);
    if (!fse.existsSync(chunksDir)) {
      await fse.mkdirs(chunksDir);
    }
    await fse.move(chunk.path, `${chunksDir}/${hash}`);
  })
  res.status(200).send("received file chunk")
})


const pipeStream = (path, writeStream) =>
new Promise(resolve => {
  const readStream = fse.createReadStream(path);
  readStream.on("end", () => {
    fse.unlinkSync(path);
    resolve();
  });
  readStream.pipe(writeStream);
});

const mergeChunk = async (filePath, fileHash, size) => {
  const chunksDir = path.resolve(UPLOAD_FILES_DIR, fileHash);
  const chunkPaths = await fse.readdir(chunksDir);
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunksDir, chunkPath),
         fse.createWriteStream(filePath, {
          start: index * size,
          end: (index + 1) * size
        })
      )
    )
  );
  fse.rmdirSync(chunksDir);
};


app.post('/merge', jsonParser, async (req, res) => {
  const { fileHash, suffix, size } = req.body;
  const filePath = path.resolve(UPLOAD_FILES_DIR, `${fileHash}.${suffix}`);    
  await mergeChunk(filePath, fileHash, size);
  res.send({
    code: 200,
    message: "success"
  });
})  

 
const getUploadedChunkList = async (fileHash) => {
  const isExist = fse.existsSync(path.resolve(UPLOAD_FILES_DIR, fileHash))
  if (isExist) {
    return await fse.readdir(path.resolve(UPLOAD_FILES_DIR, fileHash))
  }
  return []
}

app.post('/verFileIsExist', jsonParser, async (req, res) => {
  const { fileHash, suffix } = req.body;
  const filePath = path.resolve(UPLOAD_FILES_DIR, `${fileHash}.${suffix}`);  
  if (fse.existsSync(filePath)) {
    res.send({
      code: 200,
      shouldUpload: false
    })
    return;
  }
  const list = await getUploadedChunkList(fileHash);
  if (list.length > 0) {
    res.send({
      code: 200,
      shouldUpload: true,
      uploadedChunkList: list
    })
    return;
  }
  res.send({
    code: 200,
    shouldUpload: true,
    uploadedChunkList: []
  })
})

app.listen(3001 , () => { 
    console.log('listen:3001');
})