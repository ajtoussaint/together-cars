import React, { Component } from 'react';
//import axios from 'axios';

export default class Home extends Component{
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
        console.log(this.state);
    }



    render(){
        return(
            <div> 
                <Login />
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
        console.log(this.state);
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
        console.log(this.state);
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
