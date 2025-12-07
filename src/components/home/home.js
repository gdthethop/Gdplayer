import CategoriesContainer from '../contaners/thumbnails';
import Header from '../header/header';
import HeroSection from './HeroSection';

function Home(props) {
  // Accept props to make the component dynamic
  return (
    <div className="main" style={{ background: 'black' }}>
      <div className="header">
        <Header />
      </div>
      <HeroSection />
      <div
        style={{
          background: 'black',
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 20, // Ensure content sits above hero fade
          marginTop: '-100px', // Overlap with hero section slightly
        }}
      >
        <div
          className="categories"
          style={{ width: '100%', paddingBottom: '50px' }}
        >
          <CategoriesContainer categories={props.categories} />{' '}
          {/* Pass categories to CategoriesContainer */}
        </div>
      </div>
    </div>
  );
}

export default Home;
