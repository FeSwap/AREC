import React, { useContext } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/nft/actions'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { TruncatedText, SwapShowAcceptChanges } from '../swap/styleds'
import {NftBidTrade} from '../../state/nft/hooks'

export default function SponsorModalHeader({
  nftBid,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  nftBid: NftBidTrade
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {

  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
      <RowBetween align="flex-end">
        <RowFixed gap={'0px'}>
          <CurrencyLogo currency={nftBid?.pairCurrencies[Field.TOKEN_A]??undefined} size={'24px'} style={{ marginRight: '12px' }} />
          <TruncatedText
            fontSize={24}
            fontWeight={500}
            color={showAcceptChanges ? theme.primary1 : ''}
          >
            {` To Do: nftBid?.pairCurrencies[Field.TOKEN_A]?.toSignificant(6) `}
          </TruncatedText>
        </RowFixed>
        <RowFixed gap={'0px'}>
          <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}> ETH
          </Text>
        </RowFixed>
      </RowBetween>
      <RowFixed>
        <ArrowDown size="16" color={theme.text2} style={{ marginLeft: '4px', minWidth: '16px' }} />
      </RowFixed>
      <RowBetween align="flex-end">
        <RowFixed gap={'0px'}>
          <CurrencyLogo currency={nftBid?.pairCurrencies[Field.TOKEN_B]??undefined} size={'24px'} style={{ marginRight: '12px' }} />
          <TruncatedText
            fontSize={24}
            fontWeight={500}
            color={
                showAcceptChanges ? theme.primary1 : ''
            }
          >
            {` To DO: nftBid?.pairTokens[Field.TOKEN_B]?.toSignificant(6) `}
          </TruncatedText>
        </RowFixed>
        <RowFixed gap={'0px'}>
          <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}> FESW </Text>
        </RowFixed>
      </RowBetween>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <TYPE.main color={theme.primary1}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '10px' }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
        <TYPE.italic textAlign="left" style={{ width: '100%' }}>
          The giveaway FESW amount is estimated, which may be less than the value above 
          if your tranaction confirmatoin is delayed in the Ethereum blockchain
        </TYPE.italic>
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
