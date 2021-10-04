"use strict"

import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { Web3Provider } from '@ethersproject/providers'
import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { PolyjuiceHttpProvider } from "@polyjuice-provider/web3";
import { SWRConfig } from 'swr'
import { isNervos, name2ABI, supportedChainIds } from "./utils";
import { Opthys } from "./Opthys";


export const App = () => {
  const getLibrary = (defaultProvider) => {
    if (!defaultProvider || isNervos(defaultProvider.chainId)) {
      //ignore defaultProvider and use polyjuiceConfig
      const polyjuiceConfig = {
        //abiItems: [],//////////////////////////////////////////////////////////////////////////////
        web3Url: 'https://godwoken-testnet-web3-rpc.ckbapp.dev',
      };
      return new Web3Provider(new PolyjuiceHttpProvider(polyjuiceConfig.web3Url, polyjuiceConfig));
    }
    return new Web3Provider(defaultProvider)
  }

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <SWRProvider />
    </Web3ReactProvider>
  )
}


export const SWRProvider = () => {
  const { activate, active, library } = useWeb3React();

  const onClick = () => {
    activate(new InjectedConnector({ supportedChainIds: supportedChainIds() }))
  }

  const fetcher = (arg1, ...args) => {
    console.log(arg1, ...args)////////////////////////////////////////////////////////////////////
    //arg1 is an address, so it's a contract call
    if (isAddress(arg1)) {
      const [address, contractName, method, ...params] = [arg1, ...args]
      const contract = new Contract(address, name2ABI(contractName), library.getSigner(window.ethereum.selectedAddress))
      return contract[method](...params)
    }
    //arg1 is a method, so it's a eth call
    return library[arg1](...args)
  }

  // const { polyaccount } = usePolyWeb3React() //polyaccount is different from account due to how nervos works
  return (
    <SWRConfig value={{ fetcher }}>
      {active ? (
        //Keep only opthy that has phase == 0
        // <Opthys filter={(o) => (o.phase == 0)} propsFactory={propsFactory} />
        //Keep only opthy avaiable for buy that are not from this account
        // <Opthys filter={(o) => (o.holder == ZeroAccount && o.seller != polyaccount)} propsFactory={propsFactory} />

        <Opthys propsFactory={propsFactory} />
      ) : (
        <button type="button" onClick={onClick}>
          Connect Metamask
        </button>
      )}
    </SWRConfig>
  )
}


const propsFactory = (o) => {
  return { actionLabel: "test", onClick: () => { console.log("Callback from Opthy", o) } }
}

