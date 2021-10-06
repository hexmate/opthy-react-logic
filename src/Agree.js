"use strict"

import { Contract } from '@ethersproject/contracts'
import { formatUnits } from '@ethersproject/units';
import { useWeb3React } from '@web3-react/core';
import { useDefaultSendOptions } from "./utils";
import { Action } from "./Action";

export const Agree = (props) => {
    const { data: opthyData, setStatus } = props
    const { library } = useWeb3React();
    defaultSendOptions = useDefaultSendOptions()

    if (opthyData.phase == 0) {
        return null
    }


    //CHECK DISABLED HERE AND IN THE CONTRACT TO SIMPLIFY APP TESTING WITH A SINGLE ACCOUNT///////////////////////////////////////////////////////
    // if (opthyData.iAmSeller) {
    //     return null
    // }

    amount = BigInt(opthyData.token0.r) - BigInt(opthyData.token0.balance)

    if (amount <= 0) {
        return null
    }

    let actionLabel = "";
    if (Number(opthyData.seller) > 0) {//I'm buying this opthy, amount is the fee
        actionLabel = `Buy this opthy for ${formatUnits(amount, opthyData.token0.decimals)} ${opthyData.token0.symbol}`
    } else {//The other is offering to buy if I provide this opthy, amount is the initial liquidity
        const fee = BigInt(opthyData.token0.balance)
        actionLabel = `Sell this opthy and gain ${formatUnits(fee, opthyData.token0.decimals)} ${opthyData.token0.symbol}`
    }

    const agree = async () => {
        const contract = new Contract(opthyData.address, opthyData.ABI, library.getSigner(window.ethereum.selectedAddress))
        return contract.agree(amount, opthyData.phase, defaultSendOptions)
    }

    return <Action
        ERC20={{
            data: opthyData.token0,
            spender: opthyData.address,
            amount: amount
        }}
        asyncAction={agree}

        actionLabel={actionLabel}
        currencyBalance={opthyData.currencyBalance}
        setStatus={setStatus}
    />
}