"use strict"

import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'
import { useChainCurrency, useDefaultSendOptions } from "./utils";
import { useState } from 'react';

const maxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

export const Action = (props) => {
    const { ERC20, asyncAction, actionLabel, currencyBalance, setStatus } = props
    const { library } = useWeb3React()
    const currency = useChainCurrency()
    const defaultSendOptions = useDefaultSendOptions()
    const [isApproving, setIsApproving] = useState(false);
    const [isActionating, setIsActionating] = useState(false);

    if (isActionating) {
        return <div>{actionLabel}...</div>
    }

    if (isApproving) {
        return <div>Approving...</div>
    }

    if (BigInt(currencyBalance) == 0) {//find a way to estimate gas
        return <div>Low on {currency}</div>
    }


    if (ERC20) {
        if (BigInt(ERC20.data.UserBalance) < BigInt(ERC20.amount)) {
            return <div>Too low on {ERC20.data.symbol} to {actionLabel}</div>
        }

        if (BigInt(ERC20.data.UserAllowance) < BigInt(ERC20.amount)) {
            const approve = async () => {
                try {
                    setIsApproving(true)
                    const contract = new Contract(ERC20.data.address, ERC20.data.ABI, library.getSigner(window.ethereum.selectedAddress))
                    await contract.approve(ERC20.spender, maxUint256, defaultSendOptions)
                    setStatus("Approved " + ERC20.data.symbol)
                } catch (error) {
                    setStatus("Error")
                    console.log(error);//notify the user in some better way////////////////////
                }
                setIsApproving(false)
            }
            return <button type="button" onClick={approve}>Approve {ERC20.data.symbol} to {actionLabel} </button>
        }
    }

    const actionate = async () => {
        try {
            setIsActionating(true)
            await asyncAction()
            setStatus("Done " + actionLabel)
        } catch (error) {
            setStatus("Error")
            console.log(error);//notify the user in some better way////////////////////
        }
        setIsActionating(false)

    }
    return <button type="button" onClick={actionate}>{actionLabel}</button>
}