"use strict"

import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useOpthysAddress } from "./utils";
import useSWR from 'swr';
import { Opthy } from "./Opthy";

export const Opthys = (props) => {
  const opthysAddress = useOpthysAddress()
  const { data, mutate, error } = useSWR([opthysAddress, 'Opthys', 'getOpthys'])

  useMutateAtEveryBlock(mutate)

  if (error) {
    console.log(error)
    return <div>failed to load</div>
  }

  if (!data) {
    return <div>loading...</div>
  }

  const opthys = props.filter ? data.filter(props.filter) : data

  if (opthys.length == 0) {
    return <div>no opthy contract found</div>
  }

  propsFactory = props.propsFactory || emptyPropsFactory

  //o.opthy is the opthy contract addres
  return <>{opthys.map((o) => <Opthy key={o.opthy} data={o} mutateOpthy={mutate} {...propsFactory(o)} />)}</>
}

function emptyPropsFactory(o) {
  return {}
}

//Call mutate for each new block
//used in complex scenarios where there are way too many events from way too many contract for subscribing to events
export const useMutateAtEveryBlock = (mutate) => {
  const { library } = useWeb3React()

  useEffect(() => {
    const callback = () => mutate(undefined, true)
    library.on('block', callback)
    return () => library.removeListener('block', callback)
  }, [])
}