import React , {  useState , useMemo } from 'react';
import { Button, Table, Upload, message, Progress } from 'antd';   
import WorkerBuilder from '../utils/workerBuild'  
import hashWorker from '../utils/hashWorker'
import request from '../utils/request' 
import typeResult from '../utils/fileType'
import '../styles.less'; 

//curNum：当前数据，totalNum：总数据，isHasPercentStr：是否返回%字符
function getPercent(curNum, totalNum, isHasPercentStr) {
    curNum = parseFloat(curNum);
    totalNum = parseFloat(totalNum);
    if (isNaN(curNum) || isNaN(totalNum)) {
              return '-';
    }
 
    return isHasPercentStr ?  totalNum <= 0 ? '0%' : (Math.round(curNum / totalNum * 10000) / 100.00 + '%') : totalNum <= 0 ? 0 : (Math.round(curNum / totalNum * 10000) / 100.00);
  }
  
 
const CHUNK_SIZE = 1 * 1024 * 1024; 

 
function Slicing() {      
  const [submitChunkList,setChunkList] = useState([]);
  
  
  const columns = [
    {
      title: '进度',
      dataIndex: 'address',
      key: 'address',  
      render: (text, operas) => {    
      const { chunks = [] } = operas;
      const progressNum = chunks.filter(o => o.progress === 100).length
      return <Progress steps={chunks.length} percent={chunks.length === progressNum ? 100 : getPercent(chunks.length, progressNum)  } />
      }
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
        const { hash } = e.data;
 
        if (hash) {
           resolve(hash)
        }
      }

    })
 }


 
  const onBeforeUpload = async (file) => { 
    if (!file) return;
    const { ext: suffixType } = await typeResult(file)  
    const chunkList = splitFile(file);      
    uploadFiles(suffixType, chunkList);
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

  const mergeRequest = (indexHash, indexFileType) => {    
    request({ 
      url: 'http://localhost:3001/merge',
      method: "post",
      headers: {
        "content-type": "application/json"
      }, 
      data: JSON.stringify({
        fileHash: indexHash,
        suffix: indexFileType,
        // 用于服务器合并文件
        size: CHUNK_SIZE
      })
    })
  }


   const uploadChunks = (chunks, hash, indexFileType) => {
    const formItems = chunks.map(({ chunk, hash })=> {   
      const formItem = new FormData();
       formItem.append("chunk", chunk);
       formItem.append("hash", hash);
       formItem.append("suffix", indexFileType);

       return { formItem  }
    })   
  
 
     const listItem = submitChunkList.find(o => o.hash === hash) || {};
     const listItemIndex = submitChunkList.length === 0 ? 0 : submitChunkList.findIndex(o => o.hash === hash);
     const requestList = formItems.map(({ formItem }, index) => {  
      return request({
        url: "http://localhost:3001/upload",
        data: formItem,
        onprogress: e => {
          let list = [...chunks];
          list[index].progress = parseInt(String((e.loaded / e.total) * 100));   
          submitChunkList[listItemIndex] = {...listItem, chunks: list , hash: hash } 
          setChunkList(submitChunkList)
        }
      })
    })

  

    Promise.all(requestList).then(() => {  
      setTimeout(() => {
        mergeRequest(hash, indexFileType);
      }, 1000);
    })
   }




  const uploadFiles = async (indexFileType, chunkList) => {  
    let uploadedChunkIndexList = [];
    const hash = await calculateHash(chunkList);
 
    const { shouldUpload, uploadedChunkList } = await isExist(hash, indexFileType);

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

    setChunkList([...submitChunkList, { hash: hash, chunks: chunks }])      
    uploadChunks(chunks, hash, indexFileType)
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
        <Table dataSource={submitChunkList} columns={columns}  />
      </main>
    </div>
  );
}

export default Slicing;
