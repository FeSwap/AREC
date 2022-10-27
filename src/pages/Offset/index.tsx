import React, { useContext, useState, useCallback, useMemo } from 'react'
import { CurrencyAmount } from '@feswap/sdk'

import { HelpCircle } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'

import { ButtonError, ButtonLight } from '../../components/Button'

import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { RowBetween } from '../../components/Row'

//import { AutoRow } from '../../components/Row'
import { MouseoverTooltip } from '../../components/Tooltip'

import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useArkreenRECTokenContract } from '../../hooks/useContract'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'

import { BigNumber } from 'ethers'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useGetActionList } from '../../state/issuance/hooks'
import { useCurrencyBalances } from '../../state/wallet/hooks'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Container } from '../../components/CurrencyInputPanel'

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

export interface RECRequest {
  issuer:       string
  startTime:    BigNumber;
  endTime:      BigNumber;
  amountREC:    BigNumber;
  cID:          string;
  region:       string;      
  url:          string;
  memo:         string;
} 

 function RetirementHelpInfo( ) {
  return (<>
            <Text> 1. Check your wallet is on Polygon. </Text>
            <Text> 2. Select the AREC if any. </Text>
            <Text> 3. Approve the issuace fee with your wallet.</Text>
            <Text> 4. Check the indicated AREC issuance info.</Text>            
            <Text> 5. Click <b>Issuace</b>, check and sign your AREC issuance request.</Text>
            <Text> 6. Waiting your AREC issuance been confirmed by Arkreen.</Text>
            <Text> <b>Remindings:</b> Your request maybe rejected by Arkreen for some reason.
                    In that case you can update your request, or cancel your request.</Text>
          </>
        )
  }

  const ButtonRow = styled.div`
    display: grid;
    width: 100%;
    height: 20px
    grid-template-columns: 20px 1fr 20px;
    column-gap: 6px;
    align-items: start;
    justify-content: space-between;
  `  

export default function Offset() {

  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  const { allOffsetActionsID,
          allUnclaimedActionsIDs,
          totalUnclaimedAmount,
      } = useGetActionList()
  
  const ARECTokenAddress = "0xb0c9dd915f62d0a37792fd2ce497680e909d8c0f"
  const currencyARECT = useCurrency(ARECTokenAddress)
  const balanceARECT = useCurrencyBalances(account ?? undefined, [currencyARECT??undefined])[0]
  const [userInput, setUserInput] = useState<string>('')

  const amountInput : CurrencyAmount | undefined = useMemo(() => {
      if( userInput === '') return undefined
      return tryParseAmount(userInput, currencyARECT ?? undefined)
    },
    [currencyARECT, userInput]
  )

  const contractARECT = useArkreenRECTokenContract(true)
  const atMaxAmountInput = Boolean(balanceARECT && amountInput?.equalTo(balanceARECT))

  const handleMaxInput = useCallback(() => {
    balanceARECT && setUserInput(balanceARECT.toExact())
  }, [balanceARECT, setUserInput])

  // const [{ showConfirm, recRequestToConfirm, IssueErrorMessage, attemptingTxn, txHash }, setMintState] = useState<{
  const [{ showConfirm, recRequestToConfirm }, setMintState] = useState<{
    showConfirm: boolean
    recRequestToConfirm: RECRequest | undefined
    attemptingTxn: boolean
    IssueErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    recRequestToConfirm: undefined,
    attemptingTxn: false,
    IssueErrorMessage: undefined,
    txHash: undefined
  })

  const addTransaction = useTransactionAdder()

  async function handleCommitOffset() {
 
    if((!contractARECT) || (!amountInput) || amountInput?.equalTo('0') ) return
    const offsetValue = BigNumber.from(amountInput.raw.toString())

    setMintState({ attemptingTxn: true, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
    await contractARECT.estimateGas['commitOffset'](offsetValue)  
        .then(async(estimatedGasLimit) => {
        await contractARECT.commitOffset(offsetValue, { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Mint retirement certificate with actions`
          })
          setMintState({ attemptingTxn: false, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: response.hash })
        })
        .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
                throw new Error(`Mint retirement certificate: You denied transaction signature.`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              throw new Error(`Mint retirement certificate: ${error.message}`)
            }
        })
      })
      .catch((error: any) => {
        console.log("Error of mint retirement certificate tx:", error)
        setMintState({attemptingTxn: false, recRequestToConfirm, showConfirm, IssueErrorMessage: error.message, txHash: undefined })
      })
  }

  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'AREC Token Offset'}>
          { chainId && ( <QuestionHelper text={'AREC Token Offset'} info={<RetirementHelpInfo/>} /> ) } 
        </PageHeader>
        <Wrapper id="issuance-page">
          <AutoColumn gap={'md'}>
            <Container style={{boxShadow:"inset 0px 0px 8px #06c", margin:'0rem 0rem'}}>
              <AutoColumn gap="4px" style={{padding: "0.75rem 1rem 0.75rem 1rem"}}>
                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Token Amount: </Text>
                    { (balanceARECT === undefined) ? (
                        <Loader  />
                      ) : (
                        <Text fontWeight={700} fontSize={14} color={theme.primary1}> {balanceARECT.toSignificant(4)} ARECT</Text>
                      )
                    }
                  </RowBetween>
                  { (allOffsetActionsID !== undefined) && (
                    <RowBetween align="center" height='20px'>
                      <Text fontWeight={500} fontSize={14} color={theme.text2}> Number of Retirement Actions: </Text>
                      <Text fontWeight={700} fontSize={14} color={theme.text2}> 
                        {allUnclaimedActionsIDs?.length.toString()} Actions
                      </Text>
                    </RowBetween>
                  )}
                  { (allOffsetActionsID !== undefined) && (
                    <RowBetween align="center" height='20px'>
                      <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Retirement Amount: </Text>
                      <Text fontWeight={700} fontSize={14} color={theme.text2}> {totalUnclaimedAmount.toString()} KWH</Text>
                    </RowBetween>
                  )}
              </AutoColumn>
            </Container>  
            <CurrencyInputPanel
              label={'Available AREC Token'}
              value={userInput}
              showMaxButton={!atMaxAmountInput}
              currency={currencyARECT}
              onUserInput={setUserInput}
              onMax={handleMaxInput}
              disableCurrencySelect = {true}
              id="sponsor-currency-input"
              customBalanceText = 'Balance: '
            />
          </AutoColumn>
          <BottomGrouping>
            {!account ? (
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
              ) : (userInput === '') ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    Input Offset Amount
                  </Text>
                </ButtonError>
              ) : ((balanceARECT === undefined) || (balanceARECT.equalTo('0') )) ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    No AREC Token to Offset
                  </Text>
                </ButtonError>
              ) : (
                <div>
                  <RowBetween marginTop="10px">
                    <ButtonError
                      onClick={() => handleCommitOffset() }
                      id="redeem-button"
                    >
                      <ButtonRow>
                        <div />
                        <Text fontSize={20} fontWeight={500}>
                          Offset AREC Token
                        </Text>
                        <MouseoverTooltip text ={'qqqq'} >
                          <HelpCircle size="20" color={theme.text5} style={{ marginLeft: '8px' }} />
                        </MouseoverTooltip>
                      </ButtonRow>
                    </ButtonError>
                  </RowBetween>

                  <RowBetween marginTop="10px">
                  <ButtonError
                    onClick={() => handleCommitOffset() }
                    id="redeem-button"
                  >
                    <ButtonRow>
                      <div />
                      <Text fontSize={20} fontWeight={500}>
                        Offset and Mint Certificate
                      </Text>
                      <MouseoverTooltip text ={'qqqq'} >
                        <HelpCircle size="20" color={theme.text5} style={{ marginLeft: '8px' }} />
                      </MouseoverTooltip>
                    </ButtonRow>
                  </ButtonError>
                  </RowBetween>
                </div>
              )
            }
          </BottomGrouping>
        </Wrapper>
        </StyledPageCard>
      </AppBody>
    </>
  )
}

