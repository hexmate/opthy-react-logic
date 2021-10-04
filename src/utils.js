"use strict"

import { useWeb3React, useEffect } from '@web3-react/core';
import { AddressTranslator } from 'nervos-godwoken-integration';
import { getAddress } from '@ethersproject/address';
import useSWRImmutable from 'swr';

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

const ERC20ABI = require("../assets/artifacts/IERC20Metadata").abi;
const OPTHYSABI = require("opthy-v0-core/artifacts/Opthys").abi;
export const name2ABI = (contractName) => {
    if (contractName == "ERC20") {
        return ERC20ABI;
    }
    if (contractName == "Opthys") {
        return OPTHYSABI;
    }
}

export const zeroAccount = () => "0x0000000000000000000000000000000000000000"

export const usePolyWeb3React = () => {
    const result = useWeb3React();

    if (result.account) {
        if (isNervos(result.chainId)) {
            const addressTranslator = new AddressTranslator();
            polyaccount = addressTranslator.ethAddressToGodwokenShortAddress(result.account);
            result.polyaccount = getAddress(polyaccount);//transform to Checksum Address
        } else {
            result.polyaccount = result.account;
        }
    }

    return result
}

//Grab all ERC20 metadata with this function
export const useERC20Metadata = (ERC20Address) => {
    let { data: name, errName } = useSWRImmutable([ERC20Address, 'ERC20', 'name'])
    if (errName || !name) {
        name = ERC20Address.slice(-5);
    }

    let { data: symbol, errSymbol } = useSWRImmutable([ERC20Address, 'ERC20', 'symbol'])
    if (errSymbol || !symbol) {
        symbol = ERC20Address.slice(-5);
    }

    let { data: decimals, errDecimals } = useSWRImmutable([ERC20Address, 'ERC20', 'decimals'])
    if (errDecimals || !decimals) {
        decimals = 18;
    }

    const { chainId } = useWeb3React()
    isSafe = useERC20IsSafe(chainId, ERC20Address)

    const logo = useERC20Logo(symbol)

    //Add other ERC20 metadata here///////////////////////////

    return { name, symbol, decimals, isSafe, logo }
}

const useERC20IsSafe = (chainId, ERC20Address) => {
    if (chainId == 71393) { //ckETH and ckDAI token addresses
        return ERC20Address == "0x034f40c41Bb7D27965623f7bb136CC44D78be5E7" || ERC20Address == "0xC818545C50a0E2568E031Ef9150849b396992880";
    }
    return false
}

//Return webp images of the files, parcel reference: https://v2.parceljs.org/recipes/image/
import logos from "url:../assets/logos/*.webp"
const useERC20Logo = (symbol) => {
    //remove ck prefix, normalize name
    if (symbol.length >= 5 && symbol.charAt(0) == 'c' && symbol.charAt(1) == 'k' && symbol.charAt(2) == symbol.charAt(2).toUpperCase()) {
        symbol = symbol.slice(2)
    }

    return logos[symbol.toUpperCase()] || logos["unknown"]
}