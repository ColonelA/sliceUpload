import React , {  useState , useEffect   } from 'react';
import { Button, Table, Upload } from 'antd';   
import WorkerBuilder from '../utils/workerBuild'  
import hashWorker from '../utils/hashWorker'
// import workerScript from './worker.js';

import '../styles.less';
  
 
const CHUNK_SIZE = 1 * 1024 * 1024; 

 interface FileItem {
    chunk: any;
 }
  
function Slicing() {      
  const [submitFileName,setFileName]  = useState<string>(); 
  const [submitChunkList,setChunkList] = useState<FileItem[]>([]);
  
  const [hashPercentage, setHashPercentage] = useState(0); 
  const [fileHash, setFileHash] = useState<string>("")



  const dataSource = [
    {
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    },
    {
      key: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
    },
  ];
  
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '住址',
      dataIndex: 'address',
      key: 'address',
    },
  ];  


  const splitFile = (file, size = CHUNK_SIZE) => {   
    const fileChunkList:FileItem[] = []; 
    let curChunkIndex = 0;  
     

    while (curChunkIndex <= file.size) {   
      const chunk = file.slice(curChunkIndex, curChunkIndex + size); 
      fileChunkList.push({ chunk: chunk, })
      curChunkIndex += size;
    };     
 
    return fileChunkList;
  };
  
    
 const calculateHash = (chunkList) => {
    return new Promise(resolve => { 
      const worker = new WorkerBuilder(hashWorker)
  
      worker.postMessage({ chunkList: chunkList })
 
      worker.onmessage = e => {
        const { percentage, hash } = e.data;
        setHashPercentage(percentage);
        if (hash) {
           resolve(hash)
        }
      }

 


    })
 }

  
  const getFileSuffix = (fileName) => {
    let arr = fileName.split(".");
    if (arr.length > 0) {
      return arr[arr.length - 1]
    }
    return "";
  }

  
 
  const onBeforeUpload = (file: any) => { 
    if (!file) return;

    const chunkList:FileItem[] = splitFile(file);
    uploadFiles(String(file.name), chunkList);
 
    setFileName(String(file.name))
    setChunkList(chunkList)

    return false
  }   
 
   
  const isExist = async (fileHash, suffix) => { 
    // const { data } = await request({
    //   url: "http://localhost:3001/isExist",
    //   headers: {
    //     "content-type": "application/json"
    //   },
    //   data: JSON.stringify({
    //     fileHash: fileHash,
    //     suffix: suffix
    //   })
    // })


     return JSON.parse('{}')
  }


  const uploadFiles = async (fileName, chunkList) => {  

    const hash: string | unknown = await calculateHash(chunkList);
    setFileHash(String(hash))
 
    const { shouldUpload, uploadedChunkList } = await isExist(hash, getFileSuffix(fileName));

     

    


     
  }  
  



  


  return (
    <div className='slicingIndex'>
      <header className='header'> 
         <Upload 
           showUploadList={false}
           beforeUpload={onBeforeUpload} 
          >
           <Button type="primary">Upload files</Button>
         </Upload>

      </header> 
      <main className='main'>  

        <Table dataSource={dataSource} columns={columns} />

      </main>
    </div>
  );
}

export default Slicing;
