import React , {  useState , useEffect   } from 'react';
import { Button, Table, Upload  } from 'antd'; 
import '../styles.less';
  
 
const CHUNK_SIZE = 1 * 1024 * 1024; 

 interface FileItem {
    chunk: any;
 }


function Slicing() {      
  const [submitFileName,setFileName]  = useState<string>(); 
  const [submitChunkList,setChunkList] = useState<FileItem[]>([]);



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
  
   
  
 
  const onBeforeUpload = (file: any) => { 
    if (!file) return;
    setFileName(String(file.name));
    const chunkList = splitFile(file)
    setChunkList(chunkList);
    return false
  }   


   
  useEffect(() => { 

 
    if (submitChunkList.length !== 0 ) {
      
    } else { 
       
      
    }




  }, [submitFileName]) 



  return (
    <div className='slicingIndex'>
      <header className='header'> 
         <Upload beforeUpload={onBeforeUpload}>
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
