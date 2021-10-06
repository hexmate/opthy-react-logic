"use strict"

import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core';
import { useDefaultSendOptions } from "./utils";
import { Action } from "./Action";

export const Reclaim = (props) => {
    const { data: opthyData, setStatus } = props
    const { library } = useWeb3React();

    defaultSendOptions = useDefaultSendOptions()

    if (!opthyData.iAmOwner) {
        return null
    }

    if (opthyData.phase == 0 && Date.now() < opthyData.expiration) {
        return null
    }

    const reclaim = async () => {
        const contract = new Contract(opthyData.address, opthyData.ABI, library.getSigner(window.ethereum.selectedAddress))
        return contract.reclaim(defaultSendOptions)
    }

    return <Action asyncAction={reclaim} actionLabel="Reclaim" currencyBalance={opthyData.currencyBalance} setStatus={setStatus} />
}
