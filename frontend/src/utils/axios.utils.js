import axios from 'axios';
import { baseURL } from './config';


const axiosAuth = axios.create({
  baseURL
})

axiosAuth.interceptors.request.use(config => {
  let token = JSON.parse(localStorage.getItem('user')).token
  config.headers.Authorization = `Bearer ${token}`
  
  return config;
}, (error) => {
  return Promise.reject(error)
})

const axiosInstance = axios.create({
  baseURL
})


export { axiosAuth, axiosInstance }