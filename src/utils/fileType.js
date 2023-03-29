function _check(Buffer, headers) {
 const options = {
    offset: 0
  };
  for (const [index, header] of headers.entries()) { 
    if (header !== Buffer[index + options.offset]) {
      return false;
    }
  }
  return true;
};


function handleChange(file) {  

 return new Promise(resolve => { 
  const reader = new FileReader(); 
  reader.onload = () => {
    const type = typeResult(reader.result); 
    resolve(type)
  };
  reader.readAsArrayBuffer(file); 
 })
};


function typeResult(arrayBuffer) {  
  const Buffer = new Uint8Array(arrayBuffer);
  const check = (header, options) => _check(Buffer, header);
  if (check([0xFF, 0xD8, 0xFF])) {
    return {
      ext: 'jpg',
      mime: 'image/jpeg'
    };
  }
  if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return {
      ext: 'png',
      mime: 'image/png'
    };
  };
  if (check([0x50, 0x4B, 0x3, 0x4])) {
		return {
      ext: 'zip',
      mime: 'application/zip',
    };
  }

  return undefined
};

  
export default handleChange