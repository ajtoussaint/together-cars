//const axios = require("axios");
import axios from "axios";

export default axios.create({
    withCredentials: true,
    baseURL: process.env.NODE_ENV === 'production' ?
    "https://togethercars.dev:5000":
    "http://localhost:5000/" 

  })

