"use strict"

import { Contract } from '@ethersproject/contracts'
import { formatUnits } from '@ethersproject/units';
import { useWeb3React } from '@web3-react/core';
import { useDefaultSendOptions } from "./utils";
import { Action } from "./Action";

export const Swap = (props) => {
    const { data: opthyData, reverse, setStatus } = props

    const [tokenA, tokenB] = !reverse ? [opthyData.token0, opthyData.token1] : [opthyData.token1, opthyData.token0]

    const { library } = useWeb3React();
    defaultSendOptions = useDefaultSendOptions()

    if (!opthyData.iAmHolder) {
        return null
    }

    if (opthyData.phase > 0) {
        return null
    }

    if (opthyData.expiration <= Date.now()) {
        return null
    }

    const rA = BigInt(tokenA.r)
    const rB = BigInt(tokenB.r)
    let inB = BigInt(tokenB.UserBalance)
    let outA = BigInt(tokenA.balance)
    let changed = true
    while (changed) {
        changed = false

        const inB_ = (outA * rB) / rA
        if (inB_ < inB) {
            inB = inB_
            changed = true
        }

        const outA_ = (inB * rA) / rB
        if (outA_ < outA) {
            outA = outA_
            changed = true
        }
    }

    if (outA == 0) {
        return null
    }

    const swap = async () => {
        const contract = new Contract(opthyData.address, opthyData.ABI, library.getSigner(window.ethereum.selectedAddress))
        if (!reverse) {
            return contract.swap(0, inB, outA, 0, defaultSendOptions)
        } else {
            return contract.swap(inB, 0, 0, outA, defaultSendOptions)
        }

    }

    return <Action
        ERC20={{
            data: tokenB,
            spender: opthyData.address,
            amount: inB
        }}
        asyncAction={swap}

        actionLabel={`Swap ${formatUnits(inB, tokenB.decimals)} ${tokenB.symbol} for ${formatUnits(outA, tokenA.decimals)} ${tokenA.symbol}`}
        currencyBalance={opthyData.currencyBalance}
        setStatus={setStatus}
    />
}