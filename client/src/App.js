import './App.css';
import { Routes, Route, Link, Outlet} from "react-router-dom";

import Red from "./components/red-test.component";
import Blue from './components/blue-test.component';
import Home from "./components/home.component"


export default function App() {
  return (
    <div>
      <h1>
        Testing...
      </h1>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<Home />} />
          <Route path="/red" element={<Red />} />
          <Route path="/blue" element={<Blue />} />
        </Route>
      </Routes>
    </div>
  );
}


function Navbar(){
  return(
    <div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/red">Red</Link>
        </li>
        <li>
          <Link to="/blue">Blue</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
