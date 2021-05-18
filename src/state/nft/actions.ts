import { createAction } from '@reduxjs/toolkit'

//export enum Field {
//  TOKEN_A = 'TOKEN_A',
//  TOKEN_B = 'TOKEN_B'
//}

export enum Field {
  TOKEN_A,
  TOKEN_B
}

export enum WALLET_BALANCE {
  ETH,
  FESW
}

export enum NFT_BID_PHASE {
  BidToStart,
  BidPhase, 
  BidDelaying,
  BidSettled,
  PoolHolding, 
  PoolForSale
}

export const selectNftCurrency = createAction<{ field: Field; currencyId: string }>('swap/selectNftCurrency')
export const typeNftInput = createAction<{ typedValue: string }>('nft/typeNftInput')
export const replaceNftState = createAction<{
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
}>('nft/replaceNftState')
export const setNftRecipient = createAction<{ recipient: string | null }>('nft/setNftRecipient')