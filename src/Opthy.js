"use strict"

import { formatUnits } from '@ethersproject/units';
import { useERC20Metadata } from "./utils";

export const Opthy = (props) => {
    const data = useUnpackedOpthy(props.data)
    const { address, lastEdit, phase, duration, holder, seller, token0, token1 } = data
    return (
        <div>
            <h3> Opthy {address} </h3>
            <div>lastEdit: {lastEdit.toLocaleString()}</div>
            {data.expiration ? <div>expiration: {data.expiration.toLocaleString()} </div> : null}
            <div>phase: {phase}</div>
            <div>duration: {duration}</div>
            <div>holder: {holder}</div>
            <div>seller: {seller}</div>

            <h4> Token 0 </h4>
            <div> address: {token0.address} </div>
            <div> name: {token0.name} </div>
            <div> symbol: {token0.symbol} </div>
            <div> balance: {formatUnits(token0.balance, token0.decimals)}</div>
            <div> r: {formatUnits(token0.r, token0.decimals)}</div>
            {data.fee ? <div>fee: {formatUnits(token0.fee, token0.decimals)} </div> : null}
            {data.initialLiquidity ? <div>initialLiquidity: {formatUnits(token0.initialLiquidity, token0.decimals)} </div> : null}

            <h4> Token 1 </h4>
            <div> address: {token1.address} </div>
            <div> name: {token1.name} </div>
            <div> symbol: {token1.symbol} </div>
            <div> balance: {formatUnits(token1.balance, token1.decimals)}</div>
            <div> r: {formatUnits(token1.r, token1.decimals)}</div>

            {props.actionLabel ? <button type="button" onClick={props.onClick}>{props.actionLabel}</button> : null}
        </div>
    )

    return null
}

const useUnpackedOpthy = (opthy) => {
    //phase during hagglig it's a positive serial number, after agreement becomes constant zero
    //duration is expressed in seconds
    //expiration is expressed in seconds since unix epoch,
    //when phase > 0 (during haggling) expiration is the creation-timestamp/last-modified-timestamp
    //when phase == 0 (after agreement) expiration contains the timestamp at which the opthy expires (agreement-timestamp + duration)
    result = {}
    const { opthy: contractAddress, phase, duration, holder, seller, expiration, token0: token0_, token1: token1_, balance0, balance1, r0, r1 } = opthy
    result.address = contractAddress;
    result.phase = phase;
    result.duration = duration;
    result.holder = holder;
    result.seller = seller;
    if (phase > 0) {
        result.lastEdit = new Date(expiration * 1000);
    } else {
        result.lastEdit = new Date((expiration - duration) * 1000);
        result.expiration = new Date(expiration * 1000);
    }

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
    result.token0 = token0

    // result.token1
    token1 = useERC20Metadata(token1_);
    token1.address = token1_;
    token1.balance = balance1;
    token1.r = r1;
    result.token1 = token1;

    return result
}