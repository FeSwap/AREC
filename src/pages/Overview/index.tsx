import React, { useContext, useMemo } from 'react'
import { Fraction, JSBI } from '@feswap/sdk'
//import { darken } from 'polished'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
//import { ButtonError, ButtonLight } from '../../components/Button'
import { StyledPageCard } from '../../components/earn/styled'
import { AutoColumn } from '../../components/Column'
//import { HelpCircle } from 'react-feather'
import { RowBetween } from '../../components/Row'
import { Wrapper } from '../../components/swap/styleds'
import PageHeader from '../../components/PageHeader'
//import { useTransactionAdder } from '../../state/transactions/hooks'
//import { useRECIssuanceContract } from '../../hooks/useContract'
//import { useCurrency } from '../../hooks/Tokens'
//import { tryParseAmount } from '../../state/swap/hooks'
//import { calculateGasMargin, isAddress } from '../../utils'
//import { TransactionResponse } from '@ethersproject/providers'
import { useOverallARECInfo } from '../../state/issuance/hooks'
import Loader from '../../components/Loader'
//import { useActiveWeb3React } from '../../hooks'
//import { useWalletModalToggle } from '../../state/application/hooks'
import { Container } from '../../components/CurrencyInputPanel'
import { TYPE } from '../../theme'
//import { RECData, REC_STARUS, RECRequest } from '../../state/issuance/hooks'
//import TransactionConfirmationModal, { ConfirmationModalContentTitle } from '../../components/TransactionConfirmationModal'
//import { ZERO_ADDRESS } from '../../constants'
//import { MouseoverTooltip } from '../../components/Tooltip'

import AppBody from '../AppBody'
import QuestionHelper from '../../components/QuestionHelper'
//import { GetCerticateInfo, ARECSelect, ARECOption, ButtonRow, DetailedARECInfo } from '../../components/ARecIssuance'

export interface ProfileAREC {
  readonly startDate:       string
  readonly startEnd:        string
  readonly minerNumber:     number
  readonly amountTotalRE:   string
  readonly priceToIssueREC: string
  readonly feePayToMint:    string;
  readonly feePayToken:     string;
  readonly minREAmount:     string 
  readonly cID:             string;
  readonly region:          string;      
  readonly url:             string;
}

const ARECContainer = styled.div`
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 0.3rem 0.6rem 0.3rem 0.6rem;
  background: transparent;
`

/*
const DataRow = styled(RowBetween)`
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`
*/

const DataRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

/*
const PoolData = styled(DataCard)`
  background-color: theme.primary1;
  border-radius: 12px;
  padding: 12px;
  z-index: 1;
`
*/

//${({ theme }) => darken(0.1, theme.primary1)}
// background: radial-gradient(76.02% 75.41% at 40% 0%, #FFB6C1 30%, #E6E6FA 100%);

function OverviewHelpInfo( ) {
  return (<>
            <Text> This is the overview of AREC ecosystem. </Text>
          </>
        )
  }

export default function Overview() {

  // const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  // const toggleWalletModal = useWalletModalToggle()

  const { 
    AllARECCount,
    AllRedeemedARECCount,
    AllLiquidizedARECCount,
    AllREAIssued,
    AllREARedeemed,
    AllREALiquidized,  
    allARECRetirmentTotalSupply,
    AllARECRetirmentTotalAmount,
    ARECTotalSupply,
    ARECTotalOffset
    
/*    
    numberOfARECNft, 
          allARECInfo, 
          allARECNftTokensID, 
          totalRECAmountIssued, 
          totalRECAmountPending
*/          
        } = useOverallARECInfo()

  const AllARECRetirmentTotalAmountString = useMemo (()=>{
    if (!AllARECRetirmentTotalAmount) return undefined
    return (new Fraction(AllARECRetirmentTotalAmount.toString(), JSBI.BigInt(1000000))).toFixed(3)
  },[AllARECRetirmentTotalAmount])
  


  const AllREAIssuedString = useMemo (()=>{
    if (!AllREAIssued) return undefined
    return (new Fraction(AllREAIssued.toString(), JSBI.BigInt(1000000))).toFixed(3)
  },[AllREAIssued])
  

  const AllREARedeemedString = useMemo (()=>{
    if (!AllREARedeemed) return undefined
    return (new Fraction(AllREARedeemed.toString(), JSBI.BigInt(1000000))).toFixed(3)
  },[AllREARedeemed])

  const AllREALiquidizedString = useMemo (()=>{
    if (!AllREALiquidized) return undefined
    return (new Fraction(AllREALiquidized.toString(), JSBI.BigInt(1000000))).toFixed(3)
  },[AllREALiquidized])

  const ARECTotalSupplyString = useMemo (()=>{
    if (!ARECTotalSupply) return undefined
    return (new Fraction(ARECTotalSupply.toString(), JSBI.BigInt(1000000))).toFixed(3)
  },[ARECTotalSupply])

  const ARECTotalOffsetString = useMemo (()=>{
    if (!ARECTotalOffset) return undefined
    return (new Fraction(ARECTotalOffset.toString(), JSBI.BigInt(1000000))).toFixed(3)
  },[ARECTotalOffset])

  

  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'AREC Overview'}>
          <QuestionHelper text={'AREC Overview'} info={<OverviewHelpInfo/>} />
        </PageHeader>
        <Wrapper id="issuance-page">

              <DataRow>
                <Container style={{boxShadow:"inset 0px 0px 4px #06c", margin:'0rem 0rem'}}>
                  <AutoColumn gap="sm">
                    <TYPE.body style={{ margin: '0.5rem 1rem 0rem' }}>Total AREC Issued:</TYPE.body>
                    <RowBetween style={{ padding:'0rem 1rem'}}>
                      <TYPE.body fontSize={24} fontWeight={500} style={{ color:theme.primary1, textAlign:'center' }}>
                        {AllARECCount?.toString()}
                      </TYPE.body>
                      <TYPE.body fontSize={20} fontWeight={400} style={{ textAlign: 'center' }}>
                        NFTs
                      </TYPE.body>
                    </RowBetween>
                    <RowBetween style={{ padding:'0rem 1rem 0.5rem'}}>
                      <TYPE.body fontSize={20} fontWeight={500} style={{color: theme.primary1, textAlign: 'center' }}>
                        {AllREAIssuedString}
                      </TYPE.body>
                      <TYPE.body fontSize={20} fontWeight={400} style={{ textAlign: 'center' }}>
                        KWH
                      </TYPE.body>
                    </RowBetween>
                  </AutoColumn>
                </Container>
                
                <Container style={{boxShadow:"inset 0px 0px 4px #06c", margin:'0rem 0rem'}}>
                  <AutoColumn gap="sm">
                    <TYPE.body style={{ margin: '0.5rem 1rem 0rem' }}>Total AREC Retired:</TYPE.body>
                    <RowBetween style={{ padding:'0rem 1rem'}}>
                      <TYPE.body fontSize={24} fontWeight={500} style={{color:theme.primary1, textAlign: 'center' }}>
                        {allARECRetirmentTotalSupply?.toString()}
                      </TYPE.body>
                      <TYPE.body fontSize={20} fontWeight={400} style={{ textAlign: 'center' }}>
                        NFTs
                      </TYPE.body>
                    </RowBetween>
                    <RowBetween style={{ padding:'0rem 1rem 0.5rem'}}>
                      <TYPE.body fontSize={20} fontWeight={500} style={{ color:theme.primary1, textAlign: 'center' }}>
                        {AllARECRetirmentTotalAmountString}
                      </TYPE.body>
                      <TYPE.body fontSize={20} fontWeight={400} style={{ textAlign: 'center' }}>
                        KWH
                      </TYPE.body>
                    </RowBetween>
                  </AutoColumn>
                </Container>
              </DataRow>

          <AutoColumn gap={'md'} style={{ padding:'1rem 0rem 0.5rem'}}>
            <Container style={{boxShadow:"inset 0px 0px 4px #06c", margin:'0rem 0rem'}}>
            
              <AutoColumn gap="4px" style={{padding: "0.5rem 0.5rem 0.5rem 0.5rem"}}>
                  <ARECContainer>
                    <RowBetween align="center" height='24px'>
                      <Text lineHeight={"24px"} fontWeight={500} fontSize={14} color={theme.text2}> Redeemed AREC NFTs: </Text>
                      { (AllRedeemedARECCount === undefined) ? (
                          <Loader  />
                        ) : (
                          <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text2}> {AllRedeemedARECCount} </Text>
                        ) 
                      }
                    </RowBetween>

                    { AllREARedeemedString && (
                      <RowBetween align="center" height='24px'>
                        <Text lineHeight={"24px"} fontWeight={500} fontSize={14} color={theme.text2}> Redeemed AREC Amount: </Text>
                        <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text2}> 
                          {AllREARedeemedString} KWH
                        </Text>
                      </RowBetween>
                    )}   
                  </ARECContainer>
                  <ARECContainer style={{marginTop: "0.5rem"}}>
                    <RowBetween align="center" height='24px'>
                      <Text lineHeight={"24px"} fontWeight={500} fontSize={14} color={theme.text2}> Liquidized AREC NFTs: </Text>
                      { (AllLiquidizedARECCount === undefined) ? (
                          <Loader  />
                        ) : (
                          <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text2}> {AllLiquidizedARECCount} </Text>
                        ) 
                      }
                    </RowBetween>
                    { AllREALiquidizedString && (
                      <RowBetween align="center" height='24px'>
                        <Text lineHeight={"24px"} fontWeight={500} fontSize={14} color={theme.text2}> Liquidized AREC Amount: </Text>
                        <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text2}> 
                          {AllREALiquidizedString} KWH
                        </Text>
                      </RowBetween>
                    )} 
                    { ARECTotalSupplyString && (
                      <RowBetween align="center" height='24px'>
                        <Text lineHeight={"24px"} fontWeight={500} fontSize={14} color={theme.text2}> Circulating AREC ERC20 Tokens: </Text>
                        <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text2}> 
                          {ARECTotalSupplyString} ARET
                        </Text>
                      </RowBetween>
                    )}            

                    { ARECTotalOffsetString && (
                      <RowBetween align="center" height='24px'>
                        <Text lineHeight={"24px"} fontWeight={500} fontSize={14} color={theme.text2}> Burned AREC ERC20 Token: </Text>
                        <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text2}> 
                          {ARECTotalOffsetString} ARET
                        </Text>
                      </RowBetween>
                    )}   

                </ARECContainer>
              </AutoColumn>
            </Container>   
          </AutoColumn>
          
        </Wrapper>
        </StyledPageCard>
      </AppBody>

    </>
  )
}