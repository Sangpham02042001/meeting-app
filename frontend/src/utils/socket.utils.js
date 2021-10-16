import { io } from 'socket.io-client'
import { baseURL } from './config';

const broadcastLocal = new BroadcastChannel('test_channel');
const socketClient = io(baseURL, {
  autoConnect: false
})

export {socketClient, broadcastLocal };