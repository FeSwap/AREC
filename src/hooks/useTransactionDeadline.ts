import { BigNumber } from 'ethers'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../state'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const ttl = useSelector<AppState, number>(state => state.user.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp()

  return useMemo(() => {
    if (blockTimestamp && ttl) return blockTimestamp.add(ttl)
    return BigNumber.from(Math.floor(DateTime.now().toSeconds())).add(7200)
  }, [blockTimestamp, ttl])
}
