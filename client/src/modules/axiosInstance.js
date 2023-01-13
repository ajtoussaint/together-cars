const axios = require("axios");

const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: "http://localhost:5000/"
  })

  module.exports = axiosInstance