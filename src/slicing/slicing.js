import React , {  useState } from 'react';
import { Button, Table, Upload, message } from 'antd';   
import WorkerBuilder from '../utils/workerBuild'  
import hashWorker from '../utils/hashWorker'
import request from '../utils/request'

import '../styles.less';
  
 
const CHUNK_SIZE = 1 * 1024 * 1024; 

 
function Slicing() {      
  const [submitFileName,setFileName]  = useState (); 
  const [submitChunkList,setChunkList] = useState([]);
  
  const [hashPercentage, setHashPercentage] = useState(0); 
  const [fileHash, setFileHash] = useState("")



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
    const fileChunkList = []; 
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

  
  const getFileSuffix = (fileName = '') => {  
    let arr = fileName.split(".");
    if (arr.length > 0) {
      return arr[arr.length - 1]
    }
    return "";
  }

  
 
  const onBeforeUpload = (file) => { 
    if (!file) return;

    const chunkList = splitFile(file);
    uploadFiles(String(file.name), chunkList);
 
    setFileName(String(file.name))
    setChunkList(chunkList)

    return false
  }   
 
   
  const isExist = async (fileHash, suffix) => { 
     const { data } = await request({
      url: "http://localhost:3001/verFileIsExist",
      headers: {
        "content-type": "application/json"
      },
      data: JSON.stringify({
        fileHash: fileHash,
        suffix: suffix
      })
    })
    return JSON.parse(data);
  }  

  const mergeRequest = (indexHash) => {  
    request({ 
      url: 'http://localhost:3001/merge',
      method: "post",
      headers: {
        "content-type": "application/json"
      }, 
      data: JSON.stringify({
        fileHash: indexHash,
        suffix: getFileSuffix(submitFileName),
        // 用于服务器合并文件
        size: CHUNK_SIZE
      })
    })
  }


   const uploadChunks = (chunks, hash) => {
    const formItems = chunks.map(({ chunk, hash })=> {   
      const formItem = new FormData();
       formItem.append("chunk", chunk);
       formItem.append("hash", hash);
       formItem.append("suffix", getFileSuffix(submitFileName));

       return { formItem  }
    })   
  

    const requestList = formItems.map(({ formItem }, index) => {
      return request({
        url: "http://localhost:3001/upload",
        data: formItem,
        onprogress: e => {
          let list = [...chunks];
          list[index].progress = parseInt(String((e.loaded / e.total) * 100)); 
          setChunkList(list)
        }
      })
    })

  

    Promise.all(requestList).then(() => {  
      setTimeout(() => {
        mergeRequest(hash);
      }, 1000);
    })
   }




  const uploadFiles = async (fileName, chunkList) => {  
    let uploadedChunkIndexList = [];
    const hash = await calculateHash(chunkList);
    setFileHash(String(hash)) 
    const { shouldUpload, uploadedChunkList } = await isExist(hash, getFileSuffix(fileName));

    if (!shouldUpload) {
       return message.success('Already uploaded')
    }
        

    if (uploadedChunkList && uploadedChunkList.length > 0) {
      uploadedChunkIndexList = uploadedChunkList.map(item => {
        const arr = item.split("-");
        return parseInt(arr[arr.length - 1])
      })
     }
  
    const chunks = chunkList.map(({ chunk },index) => ({ 
      chunk: chunk,
      hash: `${hash}-${index}`,
      progress: 0,
    })).filter(item2 => {
      const arr = item2.hash.split("-")
      return uploadedChunkIndexList.indexOf(parseInt(arr[arr.length - 1])) === -1;
    }) 

    setChunkList(chunks)      
    uploadChunks(chunks, hash)
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
