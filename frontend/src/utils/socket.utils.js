import { io } from 'socket.io-client'
import { baseURL } from './config';

const broadcastLocal = new BroadcastChannel('test_channel');


const socketClient = io(baseURL, {
  secure: true,
  autoConnect: false,
})

export {socketClient, broadcastLocal };