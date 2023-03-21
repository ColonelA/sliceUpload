import Panels from './Panels.tsx'
import Slicing  from './slicing/slicing.tsx'; 
import 'antd/dist/antd.css'
import './styles.css';

function App() {  

  return (
    <div className='index'>
       <Panels>  
          <Slicing/> 
       </Panels>
    </div>
  );
}

export default App;
