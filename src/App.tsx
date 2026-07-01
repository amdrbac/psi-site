import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Psychoanalysis from './components/Psychoanalysis';
import Services from './components/Services';
import Quotes from './components/Quotes';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cursor from './components/Cursor';

export default function App() {
  return (
    <>
      <Cursor />
      <Header />
      <main>
        <Hero />
        <About />
        <Psychoanalysis />
        <Services />
        <Quotes />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
