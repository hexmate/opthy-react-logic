import { useState } from 'react';
import { Contract } from '@ethersproject/contracts'
import { parseUnits } from '@ethersproject/units';
import { Action } from "./Action";
import { useUnpackedOpthy } from "./Opthy"
import { useOpthysAddress, name2ABI, ZeroAccount, usePolyWeb3React } from './utils';

export const NewOpthy = (props) => {
    const { polyaccount, library } = usePolyWeb3React()
    const [iSell, setISell] = useState(true);
    const [initialLiquidityHR, setInitialLiquidityHR] = useState("");
    const [feeHR, setFeeHR] = useState("");
    const [token0, setToken0] = useState("0x034f40c41Bb7D27965623f7bb136CC44D78be5E7");
    const [r1HR, setR1HR] = useState("");
    const [token1, setToken1] = useState("0xC818545C50a0E2568E031Ef9150849b396992880");
    const [daysDuration, setDaysDuration] = useState("");

    const [holder, seller] = iSell ? [ZeroAccount, polyaccount] : [polyaccount, ZeroAccount]
    duration = (daysDuration || 1) * 60 * 60 * 24
    const { data, mutate } = useUnpackedOpthy({
        opthy: useOpthysAddress(),
        phase: 1,
        duration,
        holder,
        seller,
        expiration: Date.now(),
        token0,
        token1,
        balance0: "0",
        balance1: "0",
        r0: "0",
        r1: "0",
    }, () => { })

    const fee = parseUnits(feeHR || "0", data.token0.decimals)
    const initialLiquidity = parseUnits(initialLiquidityHR || "0", data.token0.decimals)
    const r1 = parseUnits(r1HR || "0", data.token1.decimals)

    const r0 = initialLiquidity + fee
    const amount = iSell ? initialLiquidity : fee

    const newOpthy = async () => {
        const contract = new Contract(useOpthysAddress(), name2ABI("Opthys"), library.getSigner(window.ethereum.selectedAddress))
        return contract.newOpthy(iSell, duration, token0, token1, r0, r1, amount)
    }

    return (
        <form>
            <h2> Create New Opthy </h2>
            <select value={iSell} onChange={setISell} required>
                <option value={true}>I'm the seller</option>
                <option value={false}>I'm the holder</option>
            </select>
            <input type="number" placeholder="Seller Liquidity" value={initialLiquidityHR} onChange={(e) => setInitialLiquidityHR(e.currentTarget.value)} required />
            <input type="number" placeholder="Fee to Seller" value={feeHR} onChange={(e) => setFeeHR(e.currentTarget.value)} required />
            <select value={token0} onChange={(e) => setToken0(e.currentTarget.value)} required>
                <option value="0x034f40c41Bb7D27965623f7bb136CC44D78be5E7">DAI</option>
                <option value="0x1b98136005d568B23b7328F279948648992e1fD2">USDC</option>
                <option value="0xEabAe0083967F2360848efC65C9c967135e80EE4">USDT</option>
                <option value="0xC818545C50a0E2568E031Ef9150849b396992880">ETH</option>
            </select>
            <input type="number" placeholder="Holder Liquidity" value={r1HR} onChange={(e) => setR1HR(e.currentTarget.value)} required />
            <select value={token1} onChange={(e) => setToken1(e.currentTarget.value)} required>
                <option value="0xC818545C50a0E2568E031Ef9150849b396992880">ETH</option>
                <option value="0x034f40c41Bb7D27965623f7bb136CC44D78be5E7">DAI</option>
                <option value="0x1b98136005d568B23b7328F279948648992e1fD2">USDC</option>
                <option value="0xEabAe0083967F2360848efC65C9c967135e80EE4">USDT</option>
            </select>
            <input type="number" placeholder="Duration in Days (1-90)" value={daysDuration} onChange={(e) => setDaysDuration(e.currentTarget.value)} max="90" min="1" required />
            <Action
                ERC20={{
                    data: data.token0,
                    spender: useOpthysAddress(),
                    amount: amount
                }}
                asyncAction={newOpthy}
                actionLabel={"Create New Opthy"}
                actionType="submit"
                currencyBalance={data.currencyBalance}
                setStatus={() => mutate()}//////////////////////////////////
            />

        </form>
    );
}
