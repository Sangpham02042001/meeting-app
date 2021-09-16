import axios from 'axios';
import { baseURL } from './config';


const axiosInstance = axios.create({
  baseURL
})


export { axiosInstance }