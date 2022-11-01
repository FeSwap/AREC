import React, { useContext, useState, useCallback, useMemo } from 'react'
import { Fraction, JSBI } from '@feswap/sdk'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { RowBetween, RowFixed } from '../../components/Row'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useRECIssuanceContract, ARECTokenAddress } from '../../hooks/useContract'
import { useCurrency } from '../../hooks/Tokens'
import { TokenAmount, Token } from '@feswap/sdk'
import { CurrencyAmount } from '@feswap/sdk'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useGetUserARECList } from '../../state/issuance/hooks'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ARECSelect, DetailedARECInfo, ARECOption } from '../../components/ARecIssuance'
import { Container } from '../../components/CurrencyInputPanel'
import { TYPE } from '../../theme'
import { RECData, REC_STARUS, RECRequest } from '../../state/issuance/hooks'

import AppBody from '../AppBody'
import QuestionHelper from '../../components/QuestionHelper'

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

 function LiquidizeHelpInfo( ) {
  return (<>
            <Text> Liquidizing AREC NFT will transfer the NFT to the specific contract, and keep it locked there.
              Equivalent amount of AREC ERC20 tokens will be minted to your wallet. </Text>
            <Text> <b>1.</b> Select the AREC to liquidize. </Text>
            <Text> <b>2.</b> Check the indicated AREC to liquidize.</Text>     
            <Text> <b>3.</b> Click <b>Liquidize</b> button.</Text>
            <Text> <b>4.</b> Sign the transaction with your wallet.</Text>
          </>
        )
  }

export default function Liquidize() {
  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  const { numberOfARECNft, 
          allARECInfo, 
          allARECNftTokensID, 
          totalRECAmountIssued, 
          totalRECAmountPending
        } = useGetUserARECList()

  const arkreenRECToken = useCurrency(ARECTokenAddress)
  const totalRECAmountIssuedString = (new Fraction(totalRECAmountIssued.toString(), JSBI.BigInt(1000000))).toFixed(3)
  const totalRECAmountPendingString = (new Fraction(totalRECAmountPending.toString(), JSBI.BigInt(1000000))).toFixed(3)

  const arkreenRECIssuanceContract = useRECIssuanceContract(true)

  // const [{ showConfirm, txnToConfirm, IssueErrorMessage, attemptingTxn, txHash }, setARECTxnState] = useState<{
  const [{ showConfirm, txnToConfirm }, setARECTxnState] = useState<{
    showConfirm: boolean
    txnToConfirm: RECRequest | undefined
    attemptingTxn: boolean
    IssueErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    txnToConfirm: undefined,
    attemptingTxn: false,
    IssueErrorMessage: undefined,
    txHash: undefined
  })

  const addTransaction = useTransactionAdder()
  const [arecSelected, setARECSelected] = useState<number|undefined>()

  const onARECSelect = useCallback( (arecSelect) => {
    setARECSelected(arecSelect.target.value)
  },[setARECSelected])

  const mintAmount: CurrencyAmount | undefined = useMemo(()=>{
    if( !arkreenRECToken || !arecSelected || (allARECInfo[arecSelected].status !== REC_STARUS.Certified)) return undefined
    return new TokenAmount(arkreenRECToken as Token, JSBI.BigInt(allARECInfo[arecSelected].amountREC.toString()))
  },[allARECInfo, arecSelected, arkreenRECToken])

  const recPowerList = allARECInfo.map((recData: RECData) => {
    return (new Fraction(recData.amountREC.toString(), JSBI.BigInt(1000000))).toFixed(3, { groupSeparator: ',' }).concat(' KWH')
  })

  const recStatusList = allARECInfo.map((recData: RECData) => {
    const recStatus = (recData?.status === REC_STARUS.Pending) ? 'Pending':
                      (recData?.status === REC_STARUS.Certified) ? 'Certified' :
                      (recData?.status === REC_STARUS.Cancelled) ? 'Cancelled' :
                      (recData?.status === REC_STARUS.Rejected) ? 'Rejected' : ' '                                            
    return recStatus
  })  

  async function handleRECLiquidize() {

    if((!arkreenRECIssuanceContract) || (arecSelected===undefined)) return

    const ARECID = allARECNftTokensID[arecSelected]
    const ARECIDString ='0000'.concat(ARECID.toString())
    const ARECIDStr =ARECIDString.substring(ARECIDString.length-4)

    setARECTxnState({ attemptingTxn: true, txnToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
    await arkreenRECIssuanceContract.estimateGas['liquidizeREC'](ARECID)
      .then(async(estimatedGasLimit) => {
        await arkreenRECIssuanceContract.liquidizeREC(ARECID, { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Liquidize AREC ID: ${ARECIDStr}`
          })
          setARECTxnState({ attemptingTxn: false, txnToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: response.hash })
        })
        .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
                throw new Error(`AREC Liquidize failed: You denied transaction signature.`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              throw new Error(`AREC Liquidize failed: ${error.message}`)
            }
        })
      })
      .catch((error: any) => {
        console.log("Error of AREC Liquidize tx:", error)
        setARECTxnState({attemptingTxn: false, txnToConfirm, showConfirm, IssueErrorMessage: error.message, txHash: undefined })
      })
  }

  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'AREC Liquidize'}>
          { chainId && ( <QuestionHelper text={'AREC Liquidization'} info={<LiquidizeHelpInfo/>} /> ) } 
        </PageHeader>
        <Wrapper id="issuance-page">
          <AutoColumn gap={'md'}>
            <Container style={{boxShadow:"inset 0px 0px 8px #06c", margin:'0rem 0rem'}}>
              <AutoColumn gap="4px" style={{padding: "0.75rem 1rem 0.75rem 1rem"}}>
                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> Total AREC NFT Number: </Text>
                    { (numberOfARECNft === undefined) ? (
                        <Loader  />
                      ) : (
                        <Text fontWeight={700} fontSize={14} color={theme.text2}> {numberOfARECNft} </Text>
                      ) 
                    }
                  </RowBetween>
                  { !totalRECAmountIssued.isZero() && (
                    <RowBetween align="center" height='20px'>
                      <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Issued AREC Amount: </Text>
                      <Text fontWeight={700} fontSize={14} color={theme.primary1}> {totalRECAmountIssuedString} KWH</Text>
                    </RowBetween>
                  )}
                  { !totalRECAmountPending.isZero() && (
                    <RowBetween align="center" height='20px'>
                      <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Pending AREC Amount: </Text>
                      <Text fontWeight={700} fontSize={14} color={theme.text2}> 
                        {totalRECAmountPendingString} KWH
                      </Text>
                    </RowBetween>
                  )}                  
              </AutoColumn>
            </Container>   
            {((numberOfARECNft !== undefined) && (numberOfARECNft !==0)) && (            
              <Container>
                <RowBetween align="center" height='20px' style={{padding: "0.75rem 1rem 0rem 1rem"}}>
                  <TYPE.body color={theme.text2} fontWeight={500} fontSize={16} width={"45%"}>
                    <strong>AREC NFT List:</strong>
                  </TYPE.body>
                </RowBetween>                  
                <div style={{margin: '0.8rem 0.6rem 0.6rem'}}>
                  <ARECSelect itemselected={!!arecSelected} defaultValue="none" onChange = {onARECSelect}>
                    <ARECOption key="none" value="none" disabled hidden> Please select the AREC NFT to retire </ARECOption>                                      
                    {allARECInfo.map((recData: RECData, index) => {
                      const optionText_ID = '0000'.concat(allARECNftTokensID[index].toString())
                      return  <ARECOption key={optionText_ID} value={index}> 
                                {'AREC_'.concat(optionText_ID.substring(optionText_ID.length-4)).concat(':')}
                                {'   '}
                                {recPowerList[index]} {`   `} {recStatusList[index]} 
                              </ARECOption>
                    })}
                  </ARECSelect>
                </div>
                { (allARECInfo[0] && (arecSelected !== undefined)) && (
                    <div style={{padding: '0.3rem 0.6rem 0.6rem 0.6rem'}}>
                      <DetailedARECInfo recData = {allARECInfo[arecSelected]} />
                    </div>
                )}
              </Container>
            )}
          </AutoColumn>

          { ((arecSelected !== undefined) && allARECInfo[arecSelected]?.status === REC_STARUS.Certified) && (
            <AutoColumn gap="4px" style = {{padding:'0.4rem 0.8rem 0rem 0.8rem'}} >
              <RowBetween align="center" height='24px'> 
                <RowFixed>
                  <Text fontWeight={700} fontSize={16} color={theme.text2}> The selected AREC will be liquidized. </Text>
                  <QuestionHelper bkgOff={true} small={'s'} info={<> The selected AREC will be liquidized,
                      and some amount of AREC ERC20 token will be mint, which euqals to the renewable energy amount
                      recorded in the AREC NFT.</>} />
                </RowFixed>
              </RowBetween>                
              <RowBetween align="center" height='24px'> 
                <RowFixed>
                  <Text fontWeight={700} fontSize={14} color={theme.text2}> AREC ERC20 Token To Mint: </Text>
                </RowFixed>
                <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.primary1}> 
                  {mintAmount?.toFixed(3).concat(' ARECT')}
                </Text>
              </RowBetween>  
            </AutoColumn>
          )}

          <BottomGrouping>
            {!account ? (
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
              ) : (numberOfARECNft === undefined) ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    Waiting AREC Info
                  </Text>
                </ButtonError>
              ) : (arecSelected === undefined) ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    Select the AREC
                  </Text>
                </ButtonError>
              ) : (allARECInfo[arecSelected]?.status === REC_STARUS.Pending) ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    Pending AREC
                  </Text>
                </ButtonError>
              ) : (
                <RowBetween>
                  <ButtonError
                    onClick={() => handleRECLiquidize() }
                    id="liquidize-button"
                  >
                    <Text fontSize={20} fontWeight={500}>
                      Liquidize
                    </Text>
                  </ButtonError>
                </RowBetween>
              )
            }
          </BottomGrouping>
        </Wrapper>
        </StyledPageCard>
      </AppBody>
    </>
  )
}