import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { Fraction, JSBI } from '@feswap/sdk'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight, ButtonConfirmed } from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'
import { RowBetween, RowFixed } from '../../components/Row'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import ProgressSteps from '../../components/ProgressSteps'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useArkreenTokenContract, useRECIssuanceContract,
        arkreenTokenAddress, arkreenIssuanceAddress } from '../../hooks/useContract'
import { splitSignature } from 'ethers/lib/utils'
import { TokenAmount, Token } from '@feswap/sdk'
import { BigNumber } from 'ethers'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { shortenAddress, shortenCID } from '../../utils'

import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import ARECIssuanceDate from '../../components/ARecIssuance'
import { Container } from '../../components/CurrencyInputPanel'
import { DateTime } from 'luxon'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { RECRequest, arkreenToken } from '../../state/issuance/hooks'

import AppBody from '../AppBody'
import QuestionHelper from '../../components/QuestionHelper'

export interface ProfileAREC {
  startDate:       string
  endDate:          string
  minerNumber:     number
  amountTotalRE:   string
  priceToIssueREC: string
  feePayToken:     string;
  minREAmount:     string 
  cID:             string;
  region:          string;      
  url:             string;
}

 function IssanceHelpInfo() {
  return (<>
            <Text> 1. Connect your wallet on Polygon. </Text>
            <Text> 2. Input the start date and end date to issue AREC. </Text>
            <Text> 3. Approve the issuance fee with your wallet.</Text>
            <Text> 4. Check the indicated AREC issuance info.</Text>            
            <Text> 5. Click <b>Mint AREC</b>, check and sign your AREC issuance request.</Text>
            <Text> 6. Waiting your AREC issuance been confirmed by Arkreen.</Text>
            <Text> <b>Remindings:</b> Your request maybe rejected by Arkreen for some reason.
                    In that case you can update your request, or cancel your request.</Text>
          </>
        )
  }

const ARECContainer = styled.div`
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 0.3rem 1rem 0.3rem 1rem;
  background: transparent;
`

function OverallAREC({recProfile}:{recProfile: ProfileAREC}) {
  const theme = useContext(ThemeContext)
  const amountTotalREString = (new Fraction(recProfile.amountTotalRE.toString(), JSBI.BigInt(1000000))).toFixed(3)

  return ( <ARECContainer>

            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Earliest AREC Date: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the date your miner(s) started mining, 
                          or the earlist date your renewable energy output is availble to mint AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> {recProfile.startDate} </Text>
            </RowBetween>
            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Latest AREC Date: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the last date your renewable energy output
                          can be mint as an AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> {recProfile.endDate} </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Miners: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the number of the 
                                      miners you are holding.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> 2 </Text>
             </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Available RE Amount: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the total renewable energy amount 
                              available for minting an AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> {amountTotalREString} KWH </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Price To Issue AREC: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>You need to pay some AKRE tokens for issuing AREC.
                                  This price is used to calculate how much AKRE totally you should pay.
                                  This price is subject to change on Arkreen governance rule. </>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> {recProfile.priceToIssueREC} AKRE/MWH </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Mininum RE Allowed To Mint: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>Not allowed to mint AREC NFT with 
                                                renewable energy less than this amout.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> {recProfile.minREAmount} KWH </Text>
            </RowBetween>

          </ARECContainer>
    )
  }

//export default function Swap({ history }: RouteComponentProps) {
export default function Issauce() {

  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()
  const dateNow = DateTime.now().toFormat("yyyy-MM-dd")

  const recProfileInit : ProfileAREC = {
    startDate:        '2022-09-03',
    endDate:          dateNow,
    minerNumber:      2,
    amountTotalRE:    '12312000000',       //12312000000
    priceToIssueREC:  '20',
    minREAmount:      '500.00',
//    feePayToMint:     "12000",
    feePayToken:      arkreenTokenAddress,
    cID:              "bafybeihepmxz4ytc4ht67j73nzurkvsiuxhsmxk27utnopzptpo7wuigte",         
    region:           "China",                
    url:              ""        
  }

  const [recProfile, setRecProfile] = useState<ProfileAREC>(recProfileInit)
  
  //const arkreenToken = useCurrency(arkreenTokenAddress)

//  const arkreenToken = new Token(ChainId.MATIC_TESTNET, arkreenTokenAddress, 18, 'AKRE', 'Arkreen DAO Token')

  /*
  const feeToPay = useMemo(()=>{
    const fee = BigNumber.from(recProfile.amountTotalRE)
                  .mul( BigNumber.from(recProfile.priceToIssueREC)).mul('1000000000').toString()
   return new Fraction(fee, WEI_DENOM)
  },[recProfile])

  const feePayToMint = feeToPay.toFixed(3)
  */

  const approvalAmount: TokenAmount | undefined = useMemo(()=>{
    const feeToPay = JSBI.multiply(JSBI.BigInt(recProfile.amountTotalRE), JSBI.BigInt(recProfile.priceToIssueREC))
    return new TokenAmount(arkreenToken as Token, JSBI.multiply(feeToPay, JSBI.BigInt('1000000000')))
  },[recProfile])
  
  //const feePayToMint = approvalAmount.toFixed(3)-

  const [dateSelected, setDateSelected ] = useState(false)

  const amountTotalRE: BigNumber = BigNumber.from(recProfile.amountTotalRE)
  const enableRECMint = amountTotalRE.isZero() ? false: true

  const startDate: string = enableRECMint ? recProfile.startDate : dateNow
  const minDate: string|undefined = enableRECMint ?  DateTime.fromFormat(recProfile.startDate, "yyyy-MM-dd")
                                                      .plus({ days: 1 }).toFormat("yyyy-MM-dd")
                                                  : undefined

  const startEndString: string = enableRECMint ? recProfile.endDate : dateNow
  const [endDate, setEndtDate ] = useState(startEndString)

  const handleSetEndtDate = useCallback((endDate:string) => {
    setEndtDate(endDate)
    setDateSelected(true)

    let recProfile = {...recProfileInit} as ProfileAREC

    recProfile.endDate = endDate

    const random = BigNumber.from(Math.floor(Math.random() * 1000000000))
    const amountTotalRE = BigNumber.from(recProfile.amountTotalRE).add(random)
    recProfile.amountTotalRE = amountTotalRE.toString()
    setRecProfile(recProfile)

    setSignatureData(null)
  }, [setEndtDate, recProfileInit])

  const swapInputError:string|undefined = undefined
  const isValid = true
  const priceImpactSeverity = 2

 
  const arkreenTokenContract = useArkreenTokenContract(true)
  const arkreenRECIssuanceContract = useRECIssuanceContract(true)
  
  const deadline = useTransactionDeadline()         // custom from users settings

  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  
  const [approval, approveCallback] = useApproveCallback(approvalAmount, arkreenIssuanceAddress)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

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

  const RECIssuer = '0x576Ab950B8B3B18b7B53F7edd8A47986a44AE6F4'
  const recRequest: RECRequest = {
    issuer:     RECIssuer,
    startTime:  BigNumber.from(DateTime.fromFormat(recProfile.startDate, "yyyy-MM-dd").toSeconds()),
    endTime:    BigNumber.from(DateTime.fromFormat(endDate, "yyyy-MM-dd").toSeconds()),
    amountREC:  BigNumber.from(recProfile.amountTotalRE),
    cID:        recProfile.cID,
    region:     recProfile.region,
    url:        recProfile.url,
    memo:       ''
  }
 
  async function handleRECRequest() {

    if(!arkreenRECIssuanceContract || !signatureData || !deadline || !approvalAmount || !recRequest.issuer) 
      return

    const signatureToPay = [ arkreenTokenAddress, approvalAmount.raw.toString(), signatureData.deadline,
                              signatureData.v, signatureData.r, signatureData.s]

    setARECTxnState({ attemptingTxn: true, txnToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
    await arkreenRECIssuanceContract.estimateGas['mintRECRequest']( recRequest, signatureToPay)
      .then(async(estimatedGasLimit) => {
        await arkreenRECIssuanceContract.mintRECRequest(recRequest, signatureToPay, 
                                          { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          setDateSelected(false)
          setSignatureData(null)
          addTransaction(response, {
            summary: `Request AREC issued by ${shortenAddress(recRequest.issuer,6)}`
          })
          setARECTxnState({ attemptingTxn: false, txnToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: response.hash })
        })
        .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
                throw new Error(`NFT Bidding failed: You denied transaction signature.`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              throw new Error(`NFT Bidding failed: ${error.message}`)
            }
        })
      })
      .catch((error: any) => {
        console.log("Error of mintRECRequest estimateGas tx:", error)
        setARECTxnState({attemptingTxn: false, txnToConfirm, showConfirm, IssueErrorMessage: error.message, txHash: undefined })
      })
    }

    async function onAttemptToApprove() {

    if (!arkreenTokenContract || !library || !deadline) throw new Error('missing dependencies')
    if (!approvalAmount) throw new Error('missing liquidity amount')
    
    // try to gather a signature for permission
    const nonce = await arkreenTokenContract.nonces(account)
  
    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
    const domain = {
      name: 'Arkreen DAO Token',
      version: '1',
      chainId: chainId,
      verifyingContract: arkreenTokenContract.address
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
    const message = {
      owner: account,
      spender: arkreenIssuanceAddress,
      value: approvalAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber()
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })
  
    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadline.toNumber()
        })
      })
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          approveCallback()
        }
      })
  }
   
  
  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow = !(swapInputError || !arkreenTokenContract || !library || !approvalAmount || !dateSelected)
  const shortCID = shortenCID(recProfile.cID)
  const amountTotalREString = (new Fraction(amountTotalRE.toString(), JSBI.BigInt(1000000))).toFixed(3)

  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'AREC Issuance'}>
          { chainId && ( <QuestionHelper text={'AREC Issuance'} info={<IssanceHelpInfo/>} /> ) } 
        </PageHeader>
        <Wrapper id="issuance-page">

          <AutoColumn gap={'md'}>
            <ARECIssuanceDate active={enableRECMint}  
              minDate= {minDate} maxDate= {enableRECMint ? dateNow : undefined}
              startDate= {startDate}
              endDate = {endDate} onChangeDate={handleSetEndtDate} id="issuace_date" >
                <OverallAREC recProfile={recProfile}/>
            </ARECIssuanceDate>
         
            <Container style={{boxShadow:"inset 0px 0px 8px #06c"}}>
              <AutoColumn gap="4px" style={{padding: "0.75rem 1rem 0.75rem 1rem"}}>
                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Issuer: </Text>
                    <Text fontWeight={700} fontSize={14} color={theme.text2}> Arkreen Fund </Text>
                  </RowBetween>

                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Region: </Text>
                    <Text fontWeight={700} fontSize={14} color={theme.text2}> China </Text>
                  </RowBetween>

                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> Total AREC Amount: </Text>
                    <Text fontWeight={700} fontSize={14} 
                        color={(signatureData !== null) ? theme.primary1: theme.text2}> {amountTotalREString} KWH </Text>
                  </RowBetween>

                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Issuance Cost: </Text>
                    <Text fontWeight={700} fontSize={14} 
                          color={(signatureData !== null) ? theme.primary1: theme.text2}> {approvalAmount?.toFixed(3)} AKRE </Text>
                  </RowBetween>

                  { (signatureData !== null) && (
                    <RowBetween align="center" height='20px'>
                      <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC cID: </Text>
                      <Text fontWeight={700} fontSize={14} color={theme.primary1}> 
                        {shortCID}
                      </Text>
                    </RowBetween>
                  )}

              </AutoColumn>
            </Container>              
            
          </AutoColumn>
          <BottomGrouping>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : (!arkreenTokenContract || !library) ? (
              <ButtonError disabled={true} error={false}>
                <Text fontSize={20} fontWeight={500}>
                  Waiting AREC Info
                </Text>
              </ButtonError>
            ) : (!approvalAmount || !enableRECMint) ? (
              <ButtonError disabled={true} error={false}>
                <Text fontSize={20} fontWeight={500}>
                  No AREC to Mint
                </Text>
              </ButtonError>
            ): !dateSelected ? (
              <ButtonError disabled={true} error={false}>
                <Text fontSize={20} fontWeight={500}>
                  Select End AREC Date
                </Text>
              </ButtonError>
            ) : (
              <RowBetween>
                <ButtonConfirmed
                  onClick={()=>{onAttemptToApprove()}}
                  disabled={signatureData !== null}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  confirmed={approval === ApprovalState.APPROVED}
                >
                  <Text fontSize={20} fontWeight={500}>
                    { signatureData !== null ? (
                      'AKRE Approved'
                    ) : (
                      'Approve AKRE'
                    )}
                  </Text>
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => handleRECRequest() }
                  width="48%"
                  id="swap-button"
                  disabled={ signatureData == null }
                  error={isValid && priceImpactSeverity > 2}
                >
                  <Text fontSize={20} fontWeight={500}>
                    Mint AREC
                  </Text>
                </ButtonError>
              </RowBetween>
            )
            
            }
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[signatureData !== null]} />
              </Column>
            )}

          </BottomGrouping>
        </Wrapper>
        </StyledPageCard>
      </AppBody>

    </>
  )
}

