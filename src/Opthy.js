"use strict"

import { formatUnits, formatEther } from '@ethersproject/units';
import { useERC20Metadata, usePolyWeb3React, ZeroAccount, name2ABI } from "./utils";
import { useState } from 'react';
import useSWR from 'swr';
import { Agree } from "./Agree";
import { Swap } from "./Swap";
import { Reclaim } from "./Reclaim";


export const Opthy = (props) => {
    const { data, mutate } = useUnpackedOpthy(props.data, props.mutateOpthy)
    const [status, _setStatus] = useState(null);
    const setStatus = (message) => {
        _setStatus(message);
        mutate()
        setTimeout(function () {
            _setStatus(null);
        }, 5000);
    }

    const { address, lastEdit, phase, duration, owner, iAmOwner, holder, iAmHolder, seller, iAmSeller, price, currencyBalance, token0, token1 } = data
    return (
        <div>
            <h3> Opthy {address} </h3>
            <div>lastEdit: {lastEdit.toLocaleString()}</div>
            {data.expiration ? <div>expiration: {data.expiration.toLocaleString()} </div> : null}
            <div>phase: {phase}</div>
            <div>duration: {duration}</div>
            <div>owner: {owner}</div>
            <div>iAmOwner: {String(iAmOwner)}</div>
            <div>holder: {holder}</div>
            <div>iAmHolder: {String(iAmHolder)}</div>
            <div>seller: {seller}</div>
            <div>iAmSeller: {String(iAmSeller)}</div>
            <div>price: {price}</div>
            <div>currencyBalance: {formatEther(currencyBalance)}</div>


            <h4> Token 0 </h4>
            <div> address: {token0.address} </div>
            <div> name: {token0.name} </div>
            <div> symbol: {token0.symbol} </div>
            <div> isWhitelisted: {String(token0.isWhitelisted)} </div>
            <div> logo: {token0.logo} </div>
            <div> balance: {formatUnits(token0.balance, token0.decimals)}</div>
            <div> r: {formatUnits(token0.r, token0.decimals)}</div>
            {data.fee ? <div>fee: {formatUnits(token0.fee, token0.decimals)} </div> : null}
            {data.initialLiquidity ? <div>initialLiquidity: {formatUnits(token0.initialLiquidity, token0.decimals)} </div> : null}
            <div> User Balance: {formatUnits(token0.UserBalance, token0.decimals)}</div>
            <div> User Allowance: {formatUnits(token0.UserAllowance, token0.decimals)}</div>


            <h4> Token 1 </h4>
            <div> address: {token1.address} </div>
            <div> name: {token1.name} </div>
            <div> symbol: {token1.symbol} </div>
            <div> isWhitelisted: {String(token1.isWhitelisted)} </div>
            <div> logo: {token1.logo} </div>
            <div> balance: {formatUnits(token1.balance, token1.decimals)}</div>
            <div> r: {formatUnits(token1.r, token1.decimals)}</div>
            <div> User Balance: {formatUnits(token1.UserBalance, token1.decimals)}</div>
            <div> User Allowance: {formatUnits(token1.UserAllowance, token1.decimals)}</div>

            {status ? <div> Status: {status} </div> : null}

            <Agree data={data} setStatus={setStatus} />
            <Swap data={data} setStatus={setStatus} />
            <Swap data={data} reverse={true} setStatus={setStatus} />
            <Reclaim data={data} setStatus={setStatus} />
        </div>
    )
}
const doNothing = async () => {
    console.log("No-op")
}

const useUnpackedOpthy = (opthy, mutateOpthy) => {
    //phase during hagglig it's a positive serial number, after agreement becomes constant zero
    //duration is expressed in seconds
    //expiration is expressed in seconds since unix epoch,
    //when phase > 0 (during haggling) expiration is the creation-timestamp/last-modified-timestamp
    //when phase == 0 (after agreement) expiration contains the timestamp at which the opthy expires (agreement-timestamp + duration)
    result = {}
    const { account, polyaccount } = usePolyWeb3React() //polyaccount is different from account due to how nervos works
    const { opthy: contractAddress, phase, duration, holder, seller, expiration, token0: token0_, token1: token1_, balance0, balance1, r0, r1 } = opthy
    result.address = contractAddress;
    result.phase = phase;
    result.duration = duration;
    result.owner = seller != ZeroAccount ? seller : holder;
    result.iAmOwner = (result.owner == polyaccount)
    result.holder = holder;
    result.iAmHolder = (holder == polyaccount);
    result.seller = seller;
    result.iAmSeller = (seller == polyaccount);
    if (phase > 0) {
        result.lastEdit = new Date(expiration * 1000);
    } else {
        result.lastEdit = new Date((expiration - duration) * 1000);
        result.expiration = new Date(expiration * 1000);
    }
    let {
        data: currencyBalance,
        mutate: mutateCurrencyBalance,
        error: currencyBalanceError
    } = useSWR(["getBalance", account, "latest"])
    if (currencyBalanceError || !currencyBalance) {
        currencyBalance = 0
    }
    result.currencyBalance = currencyBalance

    // result.token0
    token0 = useERC20Metadata(token0_);
    token0.address = token0_;
    token0.balance = balance0;
    token0.r = r0;
    // token.initialLiquidity and token.fee are defined only if opthy is in haggling
    if (phase > 0) {
        if (Number(seller) > 0) {
            token0.initialLiquidity = balance0;
            token0.fee = r0 - balance0;
        } else {
            token0.initialLiquidity = r0 - balance0;
            token0.fee = balance0;
        }
    }
    let {
        data: token0UserBalance,
        mutate: mutateToken0UserBalance,
        error: token0UserBalanceError
    } = useSWR([token0.address, 'ERC20', 'balanceOf', polyaccount])
    if (token0UserBalanceError || !token0UserBalance) {
        token0UserBalance = 0
    }
    token0.UserBalance = token0UserBalance
    let {
        data: token0UserAllowance,
        mutate: mutateToken0UserAllowance,
        error: token0UserAllowanceError
    } = useSWR([token0.address, 'ERC20', 'allowance', polyaccount, result.address])
    if (token0UserAllowanceError || !token0UserAllowance) {
        token0UserAllowance = 0
    }
    token0.UserAllowance = token0UserAllowance
    result.token0 = token0

    // result.token1
    token1 = useERC20Metadata(token1_);
    token1.address = token1_;
    token1.balance = balance1;
    token1.r = r1;
    let {
        data: token1UserBalance,
        mutate: mutateToken1UserBalance,
        error: token1UserBalanceError
    } = useSWR([token1.address, 'ERC20', 'balanceOf', polyaccount])
    if (token1UserBalanceError || !token1UserBalance) {
        token1UserBalance = 0
    }
    token1.UserBalance = token1UserBalance
    let {
        data: token1UserAllowance,
        mutate: mutateToken1UserAllowance,
        error: token1UserAllowanceError
    } = useSWR([token1.address, 'ERC20', 'allowance', polyaccount, result.address])
    if (token1UserAllowanceError || !token1UserAllowance) {
        token1UserAllowance = 0
    }
    token1.UserAllowance = token1UserAllowance
    result.token1 = token1;

    result.price = Number(formatUnits(result.token0.r, result.token0.decimals)) / Number(formatUnits(result.token1.r, result.token1.decimals))

    result.ABI = name2ABI("Opthy")

    mutate = () => {
        mutateCurrencyBalance()
        mutateToken0UserBalance()
        mutateToken0UserAllowance()
        mutateToken1UserBalance()
        mutateToken1UserAllowance()
        mutateOpthy()
    }

    return { data: result, mutate }
}