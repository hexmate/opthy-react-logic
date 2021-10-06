"use strict"

import { useWeb3React } from '@web3-react/core';
import { AddressTranslator } from 'nervos-godwoken-integration';
import { getAddress } from '@ethersproject/address';
import useSWRImmutable from 'swr';

export const NervosChainId = 71393;
export const RinkebyChainId = 4;

export const supportedChainIds = () => [RinkebyChainId, NervosChainId]

export const useChainCurrency = () => {
    const { chainId } = useWeb3React()
    if (chainId == NervosChainId) {
        return "CKB"
    }
    if (chainId == RinkebyChainId) {
        return "ETH"
    }
}

export const useDefaultSendOptions = () => {
    const { chainId } = useWeb3React()
    if (chainId == NervosChainId) {
        return {
            gasLimit: 0x54d30,
            gasPrice: 0x0,
            value: 0x0,
        }
    }
    if (chainId == RinkebyChainId) {
        return {};
    }
}

export const useOpthysAddress = () => {
    const { chainId } = useWeb3React()
    if (chainId == NervosChainId) {
        return "0x3Cb3bDF756266fbCA2b7485787A94761d67100B3";
    }
    if (chainId == RinkebyChainId) {
        return "0xAF0331D79697335305da49943B52Caafaf2A06A4";
    }
}

export const isNervos = (chainId) => (Number(chainId) == NervosChainId);

const ERC20ABI = require("../assets/artifacts/IERC20Metadata").abi;
const OPTHYABI = require("opthy-v0-core/artifacts/Opthy").abi;
const OPTHYSABI = require("opthy-v0-core/artifacts/Opthys").abi;
export const name2ABI = (contractName) => {
    if (contractName == "ERC20") {
        return ERC20ABI;
    }
    if (contractName == "Opthy") {
        return OPTHYABI;
    }
    if (contractName == "Opthys") {
        return OPTHYSABI;
    }
}

export const ZeroAccount = "0x0000000000000000000000000000000000000000"

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
    let { data: name, nameError } = useSWRImmutable([ERC20Address, 'ERC20', 'name'])
    if (nameError || !name) {
        name = ERC20Address.slice(-5);
    }

    let { data: symbol, symbolError } = useSWRImmutable([ERC20Address, 'ERC20', 'symbol'])
    if (symbolError || !symbol) {
        symbol = ERC20Address.slice(-5);
    }

    let { data: decimals, decimalsError } = useSWRImmutable([ERC20Address, 'ERC20', 'decimals'])
    if (decimalsError || !decimals) {
        decimals = 18;
    }

    const whitelist = useERC20TOKENSWhitelist()
    const isWhitelisted = whitelist ? whitelist.has(ERC20Address) : false;

    const logo = useERC20Logo(symbol)

    const ABI = ERC20ABI

    //Add other ERC20 metadata here///////////////////////////

    return { name, symbol, decimals, isWhitelisted, logo, ABI }
}

export const useERC20TOKENSWhitelist = () => {
    const { chainId } = useWeb3React()
    if (chainId == NervosChainId) {
        return new Set([
            "0x034f40c41Bb7D27965623f7bb136CC44D78be5E7", // ckETH
            "0xC818545C50a0E2568E031Ef9150849b396992880", // ckDAI
            "0x1b98136005d568B23b7328F279948648992e1fD2", // ckUSDC
            "0xEabAe0083967F2360848efC65C9c967135e80EE4", // ckUSDC
        ])
    }
    if (chainId == RinkebyChainId) {
        return new Set();
    }
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