import './App.css';
import Header from './components/header/header';
import VideoCard from './components/videocard/card';
import CategoriesContainer from './components/contaners/thumbnails';

function App() {
  return (
    <div className="App">
      <div className="header"><Header/></div>
      <div className="video-card"><VideoCard/></div>
      <div style={{background:'black', display: "flex",
    alignContent: "center",
    justifyContent: "center"}}>
      <div className="categories" 
      style={{marginTop:'100px', width:"100%" }}><CategoriesContainer/></div>
      </div>
    </div>
  );
}

export default App;
