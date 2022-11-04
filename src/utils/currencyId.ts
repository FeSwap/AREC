import { Currency, ETHER, Token, ChainId } from '@feswap/sdk'

export function currencyId(currency?: Currency, chainId?: ChainId): string {
  if(!currency) return ''
  if (currency === ETHER) {
    return currency.getSymbol(chainId) ?? 'ETH'
  }
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
