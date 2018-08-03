import Web3 from 'web3'

const web3 = (() => {
    if (typeof window.web3 !== 'undefined')
      return new Web3(window.web3.currentProvider);
    else
      return new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/BLxCGrqclQD1mV2W2vfJ"));
  })();
  
export default web3;