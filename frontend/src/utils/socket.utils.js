import { io } from 'socket.io-client'
import { baseURL } from './config';


const socketClient = io(baseURL, {
  autoConnect: false
})

export {socketClient, baseURL };