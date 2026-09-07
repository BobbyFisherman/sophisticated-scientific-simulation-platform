import { HashRouter, Routes, Route } from "react-router-dom";
import { SystemProvider } from "./engine/store";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Observatory from "./pages/Observatory";
import Simulation from "./pages/Simulation";
import Method from "./pages/Method";
import HabitableZones from "./pages/science/HabitableZones";
import Temperature from "./pages/science/Temperature";
import Atmospheres from "./pages/science/Atmospheres";
import Similarity from "./pages/science/Similarity";
import Worlds from "./pages/Worlds";
import Data from "./pages/Data";
import Glossary from "./pages/Glossary";
import About from "./pages/About";

export default function App() {
  return (
    <SystemProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/observatory" element={<Observatory />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/method" element={<Method />} />
            <Route path="/science/habitable-zones" element={<HabitableZones />} />
            <Route path="/science/temperature" element={<Temperature />} />
            <Route path="/science/atmospheres" element={<Atmospheres />} />
            <Route path="/science/similarity" element={<Similarity />} />
            <Route path="/worlds" element={<Worlds />} />
            <Route path="/data" element={<Data />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </HashRouter>
    </SystemProvider>
  );
}
