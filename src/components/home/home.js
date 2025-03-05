import CategoriesContainer from "../contaners/thumbnails";
import Header from "../header/header";

function Home(props) { // Accept props to make the component dynamic
  return (
    <div className="main" style={{background:'black'}}>
      <div className="header"><Header/></div>
      <div style={{background:'black', display: "flex", alignContent: "center", justifyContent: "center"}}>
        <div className="categories" style={{marginTop:'100px', width:"100%" }}>
          <CategoriesContainer categories={props.categories}/> {/* Pass categories to CategoriesContainer */}
        </div>
      </div>
    </div>
  );
}

export default Home;
