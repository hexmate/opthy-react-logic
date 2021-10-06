"use strict"

import { Contract } from '@ethersproject/contracts'
import { useChainCurrency, usePolyWeb3React, useDefaultSendOptions } from "./utils";
import { useState } from 'react';
import useSWR from 'swr';

const maxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

export const Action = (props) => {
    const { ERC20, asyncAction, actionLabel } = props
    const { account, polyaccount, library } = usePolyWeb3React()
    const currency = useChainCurrency()
    const defaultSendOptions = useDefaultSendOptions()
    const { data: currencyBalance, errCurrencyBalance } = useSWR(["getBalance", account, "latest"])
    const { data: balance, errBalance } = useSWR(ERC20 ? [ERC20.metadata.address, 'ERC20', 'balanceOf', polyaccount] : [" "])
    const { data: allowance, errAllowance } = useSWR(ERC20 ? [ERC20.metadata.address, 'ERC20', 'allowance', polyaccount, ERC20.spender] : [" "])
    const [isApproving, setIsApproving] = useState(false);
    const [isActionating, setIsActionating] = useState(false);
    const [isDone, setIsDone] = useState(false);


    if (isDone) {
        return <div>Done</div>
    }

    if (isActionating) {
        return <div>{actionLabel}...</div>
    }

    if (isApproving) {
        return <div>Approving...</div>
    }


    if (errCurrencyBalance) {
        console.log(errCurrencyBalance)
        return null // <div>error</div>
    }

    if (!currencyBalance) {
        return <div>Loading...</div>
    }

    if (BigInt(currencyBalance) == 0) {//find a way to estimate gas
        return <div>Low on {currency}</div>
    }


    if (ERC20) {
        if (errBalance) {
            console.log(errBalance)
            return null // <div>error</div>
        }

        if (errAllowance) {
            console.log(errAllowance)
            return null // <div>error</div>
        }


        if (!balance || !allowance) {
            return <div>Loading...</div>
        }

        if (BigInt(balance) < BigInt(ERC20.amount)) {
            return <div>Low on {ERC20.metadata.symbol}</div>
        }

        if (BigInt(allowance) < BigInt(ERC20.amount)) {
            const approve = async () => {
                try {
                    setIsApproving(true)
                    const contract = new Contract(ERC20.metadata.address, ERC20.metadata.ABI, library.getSigner(window.ethereum.selectedAddress))
                    await contract.approve(ERC20.spender, maxUint256, defaultSendOptions)
                } catch (error) {
                    console.log(error);//notify the user in some way////////////////////
                }
                setIsApproving(false)
            }
            return <button type="button" onClick={approve}>Approve</button>
        }
    }

    const actionate = async () => {
        try {
            setIsActionating(true)
            await asyncAction()
        } catch (error) {
            console.log(error);//notify the user in some way////////////////////
            //In case of error should not say done!!////////////////////////////////////////////////////////////////////////
        }
        setIsActionating(false)
        setIsDone(true)
    }
    return <button type="button" onClick={actionate}>{actionLabel}</button>
}