export * from './axios.utils';
export * from './socket.utils';
export * from './config';

const convertDate = (mysqlDate) => {
  return mysqlDate.split('T')[0]
}

export { convertDate }