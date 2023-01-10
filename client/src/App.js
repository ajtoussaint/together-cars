import './App.css';
import React, { Component } from 'react';
import { Routes, Route, Link, Outlet} from "react-router-dom";
import axios from 'axios';

import Red from "./components/red-test.component";
import Blue from './components/blue-test.component';
import Home from "./components/home.component"


export default class App extends Component {
  constructor(props){
    super(props);
    this.state={
      loggedIn: false,
      username: null
    }

    this.updateUser = this.updateUser.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
  }

  updateUser( username ){
    console.log("Updating User")
    this.setState( state => ({
      loggedIn: state.loggedIn,
      username: username
    }));
  }

  componentDidMount(){
    this.getCurrentUser();
  }

  getCurrentUser(){
    console.log("getting current user...");
    axios.get("http://localhost:5000/user").then( res => {
      if(res.data){
        console.log("Got user: " , res.data);
        this.setState({
          loggedIn: true,
          username: res.data
        })
      }else{
        console.log("no current user");
        this.setState({
          loggedIn: false,
          username: null
        })
      }
        

    })
  }

  render(){
    return (
      <div>
        <h1>
          { this.state.username || "Testing..." }
        </h1>
        <Routes>
          <Route path="/" element={<Navbar />}>
            <Route index element={<Home updateUser={this.updateUser}/>} />
            <Route path="/red" element={<Red user={this.state.username}/>} />
            <Route path="/blue" element={<Blue />} />
          </Route>
        </Routes>
      </div>
    );
  }
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
