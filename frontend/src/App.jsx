import Hero from "./section/Hero";
import Navbar from "./components/Navbar";
import About from "./section/About";
import SeePort from "./section/SeePort";
import Contact from "./section/Contact";
import Footer from "./section/Footer";
const App = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <SeePort />
      <About />
      <Contact />
      <Footer />
    </>
  )
}

export default App