import axios from 'axios';
import React, { Component } from 'react';
//import axios from 'axios';

export default class Home extends Component{
    constructor(props){
        super(props);

        this.state={
            username:"",
            password:""
        }
    }

    render(){
        return(
            <div> 
                <Login updateUser={this.props.updateUser}/>
                <Register />
            </div>
        )
    }
}

class Login extends Component{
    constructor(props){
        super(props);

        this.state={
            username:"",
            password:""
        }

        this.handleLogin = this.handleLogin.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleLogin(e){
        e.preventDefault();
        console.log("Handling login...");
        axios.post("http://localhost:5000/login", {
            username: this.state.username,
            password: this.state.password
        })
        .then(res => {
            //res .data contains the response of the "/login" post route
            console.log("login res: " + res.data.favorite);
            if (res.status === 200){
                //Pass a function from App.js into here so that the higher level state can be updated
                console.log("Yay!");
                this.props.updateUser(res.data.username);
            }
        })
    }

    render(){
        return(
            <div>
                <h1>Login</h1>
                <form>
                    <label htmlFor='username'>
                        Username:
                        <input 
                         type='text'
                         name='username'
                         id='usernameLogin'
                         value={this.state.username}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <label htmlFor='password'>
                        Password:
                        <input 
                         type='password'
                         name='password'
                         id='passwordLogin'
                         value={this.state.password}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <button type='submit' onClick={this.handleLogin}>Login</button>
                </form>
            </div>
        )
    }
}

class Register extends Component{
    constructor(props){
        super(props);

        this.state={
            username:"",
            password:"",
            confirmPassword:""
        }

        this.handleRegister = this.handleRegister.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleRegister(e){
        e.preventDefault();
        console.log("Hanling Register...");
        axios.post("http://localhost:5000/register", {
            username: this.state.username,
            password: this.state.password,
            confirmPassword:this.state.confirmPassword
        })
        .then( res => {
            if(res.status === 200){
                console.log(res.data);
            }
        })
    }

    render(){
        return(
            <div>
                <h1>Register</h1>
                <form>
                    <label htmlFor='username'>
                        Username:
                        <input 
                         type='text'
                         name='username'
                         id='usernameRegister'
                         value={this.state.username}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <label htmlFor='password'>
                        Password:
                        <input 
                         type='password'
                         name='password'
                         id='passwordRegister'
                         value={this.state.password}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <label htmlFor='confirmPassword'>
                        Confirm Password:
                        <input 
                         type='password'
                         name='confirmPassword'
                         id='confirmPassword'
                         value={this.state.confirmPassword}
                         onChange={this.handleChange}/>
                    </label>
                    <br></br>
                    <button type='submit' onClick={this.handleRegister}>Register</button>
                </form>
            </div>
        )
    }
}
