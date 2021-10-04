"use strict"

import { useWeb3React, useEffect } from '@web3-react/core';
import { AddressTranslator } from 'nervos-godwoken-integration';
import useSWR from 'swr';

export const supportedChainIds = () => [4, 71393]

export const useOpthysAddress = () => {
    const { chainId } = useWeb3React()
    if (chainId == 4) {
        return "0x558c1f3ADC1A20E8Be8052840360Edd1020DB88f";
    }
    if (chainId == 71393) {
        return "0x085d9cE0e895D138af16fc0a080fa4159B0233c9";
    }
}

export const isNervos = (chainId) => (Number(chainId) == 71393);

const ERC20ABI = require("../artifacts/IERC20Metadata").abi;
const OPTHYSABI = require("opthy-v0-core/artifacts/Opthys").abi;
export const name2ABI = (contractName) => {
    if (contractName == "ERC20") {
        return ERC20ABI;
    }
    if (contractName == "Opthys") {
        return OPTHYSABI;
    }
}

export const usePolyWeb3React = () => {
    const result = useWeb3React();

    if (result.account) {
        if (isNervos(result.chainId)) {
            const addressTranslator = new AddressTranslator();
            result.polyaccount = addressTranslator.ethAddressToGodwokenShortAddress(result.account);
        } else {
            result.polyaccount = result.account;
        }
    }

    return result
}

export const useERC20Metadata = (ERC20Address) => {
    let { data: name, errName } = useSWR([ERC20Address, 'ERC20', 'name'])
    if (errName || !name) {
        name = ERC20Address;
    }

    let { data: symbol, errSymbol } = useSWR([ERC20Address, 'ERC20', 'symbol'])
    if (errSymbol || !symbol) {
        symbol = ERC20Address.slice(-3);
    }

    let { data: decimals, errDecimals } = useSWR([ERC20Address, 'ERC20', 'decimals'])
    if (errDecimals || !decimals) {
        decimals = 18;
    }

    //Add other metadata here///////////////////////////

    return { name, symbol, decimals }
}