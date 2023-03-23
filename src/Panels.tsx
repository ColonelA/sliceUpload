import React from 'react'; 
import './styles.less'
 
interface Props { 
  children: React.ReactNode
}


function Panels(props: Props) { 
  const { children } = props
  return (
    <div className='panels'>
      {children}
    </div>
  );
}

export default Panels;
