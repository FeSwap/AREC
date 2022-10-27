import React, { useContext, useEffect, useState, useCallback } from 'react'
//import { ArrowDown } from 'react-feather'
//import ReactGA from 'react-ga'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
//import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight, ButtonConfirmed } from '../../components/Button'
//import { ButtonError, ButtonLight, ButtonConfirmed, ButtonPrimary } from '../../components/Button'

//import Card from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
//import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
//import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { RowBetween, RowFixed } from '../../components/Row'
//import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
//import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
//import TradePrice from '../../components/swap/TradePrice'
import ProgressSteps from '../../components/ProgressSteps'
import PageHeader from '../../components/PageHeader'
//import {SettingsIcon} from '../../components/Settings'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useArkreenTokenContract, useRECIssuanceContract } from '../../hooks/useContract'
import { splitSignature } from 'ethers/lib/utils'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'
import { CurrencyAmount } from '@feswap/sdk'
import { BigNumber } from 'ethers'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { shortenAddress, shortenCID } from '../../utils'
//import { darken } from 'polished'

import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
//import useENSAddress from '../../hooks/useENSAddress'
//import { useSwapCallback } from '../../hooks/useSwapCallback'
//import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
//import { Field } from '../../state/swap/actions'
import ARECIssuanceDate from '../../components/ARecIssuance'
import { Container } from '../../components/CurrencyInputPanel'
import { DateTime } from 'luxon'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { RECRequest } from '../../state/issuance/hooks'

//import {
//  useSwapActionHandlers,
//  } from '../../state/swap/hooks'
//import { useExpertModeManager } from '../../state/user/hooks'

import AppBody from '../AppBody'
// import Loader from '../../components/Loader'
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

 function IssanceHelpInfo() {
  return (<>
            <Text> 1. Check your wallet is on Polygon. </Text>
            <Text> 2. Input the start date and end date to issue AREC. </Text>
            <Text> 3. Approve the issuace fee with your wallet.</Text>
            <Text> 4. Check the indicated AREC issuance info.</Text>            
            <Text> 5. Click <b>Issuace</b>, check and sign your AREC issuance request.</Text>
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

//box-shadow: inset 0px 0px 8px #06c;

function OverallAREC() {
  const theme = useContext(ThemeContext)
  return ( <ARECContainer>

            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Earliest AREC Date: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the date your miner(s) started mining, 
                          or the earlist date your renewable energy output is availble to mint AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> 2022-10-01 </Text>
            </RowBetween>
            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Latest AREC Date: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the last date your renewable energy output
                          can be mint as an AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> 2022-10-30 </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Miners: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the number of the 
                                      miners you are holding.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> 2 </Text>
             </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Available RE Amount: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the total renewable energy amount 
                              available for minting an AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> 10000.00 KWH </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Price To Issue AREC: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>You need to pay some AKRE tokens for issuing AREC.
                                  This price is used to calculate how much AKRE totally you should pay.
                                  This price is subject to change on Arkreen governance rule. </>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> 10.00 AKRE/MWH </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Mininum RE Allowed To Mint: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>Not allowed to mint AREC NFT with 
                                                renewable energy less than this amout.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text3}> 50.00 KWH </Text>
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

  // for expert mode
//  const toggleSettings = useToggleSettingsMenu()
//  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  //const [allowedSlippage] = useUserSlippageTolerance()

  const dateNow = DateTime.now().toFormat("yyyy-MM-dd")
  const arkreenTokenAddress = "0x54e1c534f59343c56549c76d1bdccc8717129832"
  const arkreenIssuanceAddress = "0x95f56340889642a41b913c32d160d2863536e073"

  const recProfile : ProfileAREC = {
    startDate:        '2022-09-03',
    startEnd:         '2022-10-18',
    minerNumber:      2,
    amountTotalRE:    '12312',       //10000.122
    priceToIssueREC:  '10.00',
    minREAmount:      '2000.00',
    feePayToMint:     "12000",
    feePayToken:      arkreenTokenAddress,
    cID:              "bafybeihepmxz4ytc4ht67j73nzurkvsiuxhsmxk27utnopzptpo7wuigte",         
    region:           "China",                
    url:              ""        
  }
  
  const [dateSelected, setDateSelected ] = useState(false)

  const amountTotalRE: number = Number(recProfile.amountTotalRE)
  const enableRECMint = amountTotalRE>0 ? true: false

  const startDate: string = amountTotalRE>0 ? recProfile.startDate : dateNow
  const minDate: string|undefined = enableRECMint ?  DateTime.fromFormat(recProfile.startDate, "yyyy-MM-dd")
                                                      .plus({ days: 1 }).toFormat("yyyy-MM-dd")
                                                  : undefined

  const startEndString: string = amountTotalRE>0 ? recProfile.startEnd : dateNow
  const [endDate, setEndtDate ] = useState(startEndString)

  const handleSetEndtDate = useCallback((endDate:string) => {
    setEndtDate(endDate)
    setDateSelected(true)
    setSignatureData(null)
  }, [setEndtDate])

  const swapInputError:string|undefined = undefined
  const isValid = true
  const priceImpactSeverity = 2

  const arkreenToken = useCurrency(arkreenTokenAddress)
 
  const arkreenTokenContract = useArkreenTokenContract(true)
  const arkreenRECIssuanceContract = useRECIssuanceContract(true)
  
  const deadline = useTransactionDeadline()         // custom from users settings

  const approvalAmount: CurrencyAmount | undefined = tryParseAmount(recProfile.feePayToMint, arkreenToken??undefined)

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


  // const [{ showConfirm, recRequestToConfirm, IssueErrorMessage, attemptingTxn, txHash }, setRECIssauncetate] = useState<{
  const [{ showConfirm, recRequestToConfirm }, setRECIssauncetate] = useState<{
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

  //console.log("showConfirm, recRequestToConfirm, IssueErrorMessage, attemptingTxn, txHash", 
  //            showConfirm, recRequestToConfirm, IssueErrorMessage, attemptingTxn, txHash)

  const addTransaction = useTransactionAdder()

  const RECIssuer = '0x576Ab950B8B3B18b7B53F7edd8A47986a44AE6F4'
  const recRequest: RECRequest = {
    issuer:     RECIssuer,
    startTime:  BigNumber.from(DateTime.fromFormat(recProfile.startDate, "yyyy-MM-dd").toSeconds()),
    endTime:    BigNumber.from(DateTime.fromFormat(recProfile.startEnd, "yyyy-MM-dd").toSeconds()),
    amountREC:  BigNumber.from(recProfile.amountTotalRE),
    cID:        recProfile.cID,
    region:     recProfile.region,
    url:        recProfile.url,
    memo:       ''
  }

//  amountREC:  BigNumber.from(Number(recProfile.amountTotalRE)*1000000),
  
  console.log("recRequest AAAAAAAAA",  recRequest.amountREC, recRequest.amountREC.toString())

  async function handleRECRequest() {

    if(!arkreenRECIssuanceContract || !signatureData || !deadline || !approvalAmount || !recRequest.issuer) 
      return

    const signatureToPay = [ arkreenTokenAddress, approvalAmount.raw.toString(), signatureData.deadline,
                              signatureData.v, signatureData.r, signatureData.s]

    console.log("signatureToPay", signatureToPay)                              

    setRECIssauncetate({ attemptingTxn: true, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
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
          setRECIssauncetate({ attemptingTxn: false, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: response.hash })
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
        setRECIssauncetate({attemptingTxn: false, recRequestToConfirm, showConfirm, IssueErrorMessage: error.message, txHash: undefined })
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

//  <PageHeader header={'Swap'}> <SettingsIcon /> </PageHeader>
// <CardNoise />

/*
<ConfirmSwapModal
isOpen={showConfirm}
trade={trade}
originalTrade={tradeToConfirm}
onAcceptChanges={handleAcceptChanges}
attemptingTxn={attemptingTxn}
txHash={txHash}
recipient={recipient}
allowedSlippage={allowedSlippage}
onConfirm={handleRECRequest}
swapErrorMessage={swapErrorMessage}
onDismiss={handleConfirmDismiss}
/>
*/

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
              minDate= {minDate} maxDate= {enableRECMint ? recProfile.startEnd : undefined}
              startDate= {startDate}
              endDate = {endDate} onChangeDate={handleSetEndtDate} id="issuace_date" >
                <OverallAREC />
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
                        color={(signatureData !== null) ? theme.primary1: theme.text2}> 3600.00 KWH </Text>
                  </RowBetween>

                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Issuance Cost: </Text>
                    <Text fontWeight={700} fontSize={14} 
                          color={(signatureData !== null) ? theme.primary1: theme.text2}> 36.00 AKRE </Text>
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
            ) :  !dateSelected ? (
              <ButtonLight> Select End AREC Date </ButtonLight>
            ) : (!arkreenTokenContract || !library || !approvalAmount ) ? (
              <ButtonError disabled={true} error={false}>
                <Text fontSize={20} fontWeight={500}>
                  No AREC to Mint
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
                  { signatureData !== null ? (
                    'AKRE Approved'
                  ) : (
                    'Approve AKRE'
                  )}
                </ButtonConfirmed>
                <ButtonError
                  onClick={() => handleRECRequest() }
                  width="48%"
                  id="swap-button"
                  disabled={ signatureData == null }
                  error={isValid && priceImpactSeverity > 2}
                >
                  <Text fontSize={16} fontWeight={500}>
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

//<AdvancedSwapDetailsDropdown trade={trade} />
/*
setRECIssauncetate({
  recRequestToConfirm: undefined,
  attemptingTxn: false,
  IssueErrorMessage: undefined,
  showConfirm: true,
  txHash: undefined
})
*/

/*
<RowBetween marginTop="10px">
<ButtonPrimary width="48%" onClick={() => {handleRECRequest()}}>
  Mint AREC
</ButtonPrimary>
<ButtonPrimary width="48%" onClick={() => {handleRECRequest()}}>
  Mint AREC
</ButtonPrimary>
</RowBetween>
*/