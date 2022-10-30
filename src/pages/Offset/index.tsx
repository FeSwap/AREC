import React, { useContext, useState, useCallback, useMemo } from 'react'
import { CurrencyAmount } from '@feswap/sdk'
import { HelpCircle } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { RowBetween } from '../../components/Row'
import { MouseoverTooltip } from '../../components/Tooltip'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useArkreenRECTokenContract, ARECTokenAddress } from '../../hooks/useContract'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'
import { BigNumber } from 'ethers'
import { calculateGasMargin, isAddress } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useGetActionList, RECRequest } from '../../state/issuance/hooks'
import { useCurrencyBalances } from '../../state/wallet/hooks'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Container } from '../../components/CurrencyInputPanel'
import { GetCerticateInfo } from '../../components/ARecIssuance'
import { ZERO_ADDRESS } from '../../constants'

import TransactionConfirmationModal, { ConfirmationModalContentTitle } from '../../components/TransactionConfirmationModal'
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

function RetirementHelpInfo( ) {
  return (<>
            <Text> This is to offset your carbon footprint by burning some AREC tokens. 
              After the AREC tokens are burned, one offset action will be created 
              and recorded on the blockchain. Optionally you could mint an AREC 
              retirement certificate at the same transaction </Text>
            <Text> <b>1.</b> Connect your wallet on Polygon. </Text>
            <Text> <b>2.</b> Input how many AREC tokens to offset. </Text>
            <Text> <b>3.A</b> Either click <b>Offset AREC Token</b> if you just want to offset the AREC 
                              tokens as a retirement action, then check and sign your AREC offset transaction.</Text>
            <Text> <b>3.B</b> Or click <b>Offset and Mint Certificate</b> if you want to offset
                        the AREC tokens and also mint a retirement certificate, then check and sign your 
                        AREC offset transaction.</Text>
            <Text> <b>4.</b> Waiting your AREC offset transactoin to be confirmed on the blockchain.</Text>
            <Text> <b>Remindings:</b> If you offset your AREC tokens as a retrirement action, you could 
                        mint AREC retirement certificate freely at any later time.</Text>
          </>
        )
  }

  const HelpForOffset1 = `After the AREC tokens are offset, one offset action will be created and 
                        recorded on blockchain. You could mint an AREC retiremnet NFT certificate with these 
                        offset actions at anytime later.`

  const HelpForOffset2 = `After the AREC tokens are offset, one offset action will be created and 
                        recorded on blockchain, and an AREC retiremnet NFT certificate will be minted with 
                        this offset action at the same transaction.`                      

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
  
  const currencyARECT = useCurrency(ARECTokenAddress)
  const balanceARECT = useCurrencyBalances(account ?? undefined, [currencyARECT??undefined])[0]
  const [userInput, setUserInput] = useState<string>('')

  const amountInput : CurrencyAmount | undefined = useMemo(() => {
      if( userInput === '') return undefined
      return tryParseAmount(userInput, currencyARECT ?? undefined)
    },
    [currencyARECT, userInput]
  )

  const amountInputString = useMemo(()=>{
    if(!amountInput) return ''
    return amountInput.toSignificant(4)
  },[amountInput])

  const contractARECT = useArkreenRECTokenContract(true)
  const atMaxAmountInput = Boolean(balanceARECT && amountInput?.equalTo(balanceARECT))

  const handleMaxInput = useCallback(() => {
    balanceARECT && setUserInput(balanceARECT.toExact())
  }, [balanceARECT, setUserInput])

//  const [{ showConfirm, recRequestToConfirm, IssueErrorMessage, attemptingTxn, txHash }, setARECTxnState] = useState<{
  const [{ showConfirm, recRequestToConfirm, attemptingTxn, IssueErrorMessage, txHash }, setARECTxnState] = useState<{
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

  const [nameCertOwner, setNameCertOwner] = useState<string> ('')
  const [beneficiary, setBeneficiary] = useState<string> (ZERO_ADDRESS)
  const [nameBeneficiary, setNameBeneficiary] = useState<string> ('')
  const [memoCertificate, setMemoCertificate] = useState<string> ('')

  const errorAddress = useMemo(()=>{
    const address = isAddress(beneficiary)
    const error = Boolean(!address && (beneficiary!==ZERO_ADDRESS) && (beneficiary!==''))
    return error
  },[beneficiary])
  
  const onChangeBeneficiary = useCallback( (beneficiary) => {
    setBeneficiary(beneficiary)
    }, [setBeneficiary] 
  )

  const handleConfirmDismiss = useCallback(() => {
    setARECTxnState({ attemptingTxn, recRequestToConfirm, showConfirm: false, IssueErrorMessage, txHash })
  }, [attemptingTxn, recRequestToConfirm, IssueErrorMessage, txHash])


    async function handleoffsetAndMintCertificate() {
 
      if((!contractARECT) || (!amountInput) || amountInput?.equalTo('0') ) return
      const offsetValue = BigNumber.from(amountInput.raw.toString())

      setARECTxnState({ attemptingTxn: true, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
      await contractARECT.estimateGas['offsetAndMintCertificate'](  
                            (beneficiary==='')? ZERO_ADDRESS :beneficiary, 
                            nameCertOwner, nameBeneficiary, memoCertificate,
                            offsetValue)  
          .then(async(estimatedGasLimit) => {
          await contractARECT.offsetAndMintCertificate(
                    (beneficiary==='')? ZERO_ADDRESS :beneficiary, 
                    nameCertOwner, nameBeneficiary, memoCertificate, 
                    offsetValue, { gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Offset AREC token and mint retirement certificate: ${amountInputString} ARECT`
            })
            setARECTxnState({ attemptingTxn: false, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: response.hash })
          })
          .catch((error: any) => {
              // if the user rejected the tx, pass this along
              if (error?.code === 4001) {
                  throw new Error(`Offsst and mint retirement certificate: You denied transaction signature.`)
              } else {
                // otherwise, the error was unexpected and we need to convey that
                throw new Error(`Offsst and mint retirement certificate: ${error.message}`)
              }
          })
        })
        .catch((error: any) => {
          console.log("Error of Offset and Mint Certificate tx:", error)
          setARECTxnState({attemptingTxn: false, recRequestToConfirm, showConfirm, IssueErrorMessage: error.message, txHash: undefined })
        })
    }
  
  async function handleCommitOffset() {
 
    if((!contractARECT) || (!amountInput) || amountInput?.equalTo('0') ) return
    const offsetValue = BigNumber.from(amountInput.raw.toString())

    setARECTxnState({ attemptingTxn: true, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
    await contractARECT.estimateGas['commitOffset'](offsetValue)  
        .then(async(estimatedGasLimit) => {
        await contractARECT.commitOffset(offsetValue, { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Offset AREC token: ${amountInputString} ARECT`
          })
          setARECTxnState({ attemptingTxn: false, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: response.hash })
        })
        .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
                throw new Error(`Offset AREC Token: You denied transaction signature.`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              throw new Error(`Offset AREC Token: ${error.message}`)
            }
        })
      })
      .catch((error: any) => {
        console.log("Error of Offset AREC Token tx:", error)
        setARECTxnState({attemptingTxn: false, recRequestToConfirm, showConfirm, IssueErrorMessage: error.message, txHash: undefined })
      })
  }

  const attempString = `You are burning and offsetting: ${amountInputString} ARECT, and minting a retirement certificate NFT
                        for your carbon footprint offset.`

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <Container style={{boxShadow:"inset 0px 0px 8px #06c", margin:'0rem 0rem'}}>
          <AutoColumn gap="4px" style={{padding: "0.75rem 1rem 0.75rem 1rem"}}>
              <RowBetween align="center" height='20px'>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Offset Amount of AREC Token: </Text>
                <Text fontWeight={700} fontSize={14} color={theme.primary1}> {amountInput?.toSignificant(4)} ARECT</Text>
              </RowBetween>
          </AutoColumn>
        </Container>  
        <GetCerticateInfo certOwner = {nameCertOwner} beneficiary={beneficiary} 
                          nameBeneficiary={nameBeneficiary} memoCertificate={memoCertificate}
                          setCertOwner ={setNameCertOwner}  setBeneficiary = {onChangeBeneficiary} 
                          setNameBeneficiary = {setNameBeneficiary} setMemoCertificate ={setMemoCertificate} />
      </AutoColumn>
    )
  }

  function modalBottom() {
    return (
      <RowBetween>
        <ButtonError
          disabled={errorAddress}
          onClick={() => handleoffsetAndMintCertificate() }
          id="liquidize-button"
        >
          <Text fontSize={20} fontWeight={500}>
            Offset and Mint Certificate
          </Text>
        </ButtonError>
    </RowBetween>
    )
  }

  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'AREC Token Offset'}>
          { chainId && ( <QuestionHelper text={'AREC Token Offset'} info={<RetirementHelpInfo/>} /> ) } 
        </PageHeader>
        <Wrapper id="issuance-page">

        <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleConfirmDismiss}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={() => (
              <ConfirmationModalContentTitle
                title={'You will offset'}
                onDismiss={handleConfirmDismiss}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={attempString}
            pendingTitle={'Offset and Mint Certificate'}
            submittedTitle={'Offset and Mint Certificate Submitted'}
          />

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
                        <MouseoverTooltip text ={HelpForOffset1} >
                          <HelpCircle size="20" color={theme.text5} style={{ marginLeft: '8px' }} />
                        </MouseoverTooltip>
                      </ButtonRow>
                    </ButtonError>
                  </RowBetween>

                  <RowBetween marginTop="10px">
                  <ButtonError
                    onClick={() => {    
                      setARECTxnState({  attemptingTxn: false, 
                                      recRequestToConfirm, 
                                      showConfirm: true,
                                      IssueErrorMessage: undefined, 
                                      txHash: undefined })
                    }  
                  }
                    id="redeem-button"
                  >
                    <ButtonRow>
                      <div />
                      <Text fontSize={20} fontWeight={500}>
                        Offset and Mint Certificate
                      </Text>
                      <MouseoverTooltip text ={HelpForOffset2} >
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