import Panels from './Panels.tsx'
import Slicing  from './slicing/slicing.js'; 
import './styles.less';

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
