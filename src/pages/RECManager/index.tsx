import React, { useContext, useEffect, useState, useCallback } from 'react'
//import React, { useContext, useEffect, useState, useCallback } from 'react'

//import { ArrowDown } from 'react-feather'
//import ReactGA from 'react-ga'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
//import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonLight, ButtonPrimary} from '../../components/Button'
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
import { useArkreenTokenContract, useRECIssuanceContract, arkreenTokenAddress } from '../../hooks/useContract'
//import { splitSignature } from 'ethers/lib/utils'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'
import { CurrencyAmount } from '@feswap/sdk'
import { BigNumber } from 'ethers'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { shortenAddress, shortenCID } from '../../utils'
import { useGetPendingARECList } from '../../state/issuance/hooks'

//import { darken } from 'polished'

import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
//import useENSAddress from '../../hooks/useENSAddress'
//import { useSwapCallback } from '../../hooks/useSwapCallback'
//import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
//import { Field } from '../../state/swap/actions'
//import ARECIssuanceDate from '../../components/ARecIssuance'
import { Container } from '../../components/CurrencyInputPanel'
import { DateTime } from 'luxon'
//import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { TYPE } from '../../theme'
import { RECData, REC_STARUS } from '../../state/issuance/hooks'
//import { CheckCircle } from 'react-feather'

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


 function IssanceHelpInfo( ) {
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
  padding: 0.3rem 0.6rem 0.3rem 0.6rem;
  background: transparent;
`

//box-shadow: inset 0px 0px 8px #06c;

function DetailedARECInfo({recData}:{recData: RECData}) {
  const theme = useContext(ThemeContext)
  const arkreenToken = useCurrency(arkreenTokenAddress)

  const startDate = DateTime.fromSeconds(recData.startTime) ?? ''
  const endDate = DateTime.fromSeconds(recData.endTime) ?? ''

  const powerAmount = arkreenToken ? tryParseAmount(recData.amountREC.toString(), arkreenToken) : undefined
  const powerAmountString = (powerAmount?.toFixed(3, { groupSeparator: ',' }) ?? '0').concat(' KWH')
  
  return ( <ARECContainer>
            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Issuer: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the name of the entity issuing AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                {shortenAddress(recData.issuer,6)}
              </Text>
            </RowBetween>    

            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Earliest AREC Date: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the earlies date when 
                                      the renewable energy of the selected AREC is generated.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                {startDate?.toFormat("yyyy-LLL-dd")}
              </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Latest AREC Date: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the last date when
                                    the renewable energy of the selected AREC is generated.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                {endDate?.toFormat("yyyy-LLL-dd")}
              </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Total RE Amount: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the total renewable energy amount 
                              of the selected AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {powerAmountString} </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC cID: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the cID of the renewable energy data 
                              in ipfs, with which the selected AREC RE amount can be verified.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {shortenCID(recData.cID)} </Text>
            </RowBetween>

          </ARECContainer>
    )
  }

//export default function Swap({ history }: RouteComponentProps) {
export default function RECManager() {

  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()


  const { numberOfARECNft, 
          allARECInfo, 
          allARECNftTokensID, 
        } = useGetPendingARECList()

  console.log("allARECInfo", numberOfARECNft, allARECInfo, allARECNftTokensID)

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


  const swapInputError:string|undefined = undefined


  const arkreenToken = useCurrency(arkreenTokenAddress)
 
  const arkreenTokenContract = useArkreenTokenContract(true)
  const arkreenRECIssuanceContract = useRECIssuanceContract(true)
  
  //const deadline = useTransactionDeadline()         // custom from users settings

  const approvalAmount: CurrencyAmount | undefined = tryParseAmount(recProfile.feePayToMint, arkreenToken??undefined)

  const [signatureData ] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  
  const [approval] = useApproveCallback(approvalAmount, arkreenIssuanceAddress)

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

    const [arecSelected, setARECSelected] = useState<number|undefined>()

    const onARECSelect = useCallback( (arecSelect) => {
      setARECSelected(arecSelect.target.value)
   },[setARECSelected])
  
   console.log("arecSelected, setARECSelected", arecSelected, setARECSelected)

    async function handleRECCertify() {

      if((!arkreenRECIssuanceContract) || (arecSelected === undefined))
      {
        console.log("arkreenRECIssuanceContract",  arkreenRECIssuanceContract)
        return
      }
//      const signatureToPay =  [ arkreenTokenAddress, approvalAmount.raw.toString(), signatureData.deadline,
//                                signatureData.v, signatureData.r, signatureData.s]
  
//      console.log("signatureToPay", signatureToPay)                              
  
      const ARECID = allARECNftTokensID[arecSelected]
      const ARECIDString ='00000000'.concat(ARECID.toString())
      const ARECIDStr =ARECIDString.substring(ARECIDString.length-8)

      setRECIssauncetate({ attemptingTxn: true, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
      await arkreenRECIssuanceContract.estimateGas['certifyRECRequest']( ARECID, ARECIDStr)
        .then(async(estimatedGasLimit) => {
          await arkreenRECIssuanceContract.certifyRECRequest(ARECID, ARECIDStr, 
                                            { gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            setDateSelected(false)
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
  
  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow = !(swapInputError || !arkreenTokenContract || !library || !approvalAmount || !dateSelected)


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


  const recPowerList = allARECInfo.map((recData: RECData, index) => {
    const recPowerAmount = arkreenToken ? tryParseAmount(recData.amountREC.toString(), arkreenToken) : undefined
    return (recPowerAmount?.toFixed(3, { groupSeparator: ',' }) ?? '0').concat('_KWH')
  })

  const recStatusList = allARECInfo.map((recData: RECData) => {
    const recStatus = (recData.status === REC_STARUS.Pending) ? 'Pending':
                      (recData.status === REC_STARUS.Certified) ? 'Certified' :
                      (recData.status === REC_STARUS.Cancelled) ? 'Cancelled' :
                      (recData.status === REC_STARUS.Rejected) ? 'Rejected' :  
                      (recData.status === REC_STARUS.Retired) ? 'Retired' :  
                      (recData.status === REC_STARUS.Liquidized) ? 'Liquidized' : ' '                                         
    return recStatus
  })  

  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'AREC Retirement'}>
          { chainId && ( <QuestionHelper text={'AREC Issuance'} info={<IssanceHelpInfo/>} /> ) } 
        </PageHeader>
        <Wrapper id="issuance-page">
          <AutoColumn gap={'md'}>
            <Container style={{boxShadow:"inset 0px 0px 8px #06c", margin:'0rem 0rem'}}>
              <AutoColumn gap="4px" style={{padding: "0.75rem 1rem 0.75rem 1rem"}}>
                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> Total AREC NFT Number: </Text>
                    <Text fontWeight={700} fontSize={14} color={theme.text2}> {allARECNftTokensID.length} </Text>
                  </RowBetween>
              </AutoColumn>
            </Container>              
              <Container>
                  <RowBetween align="center" height='20px' style={{padding: "0.75rem 1rem 0rem 1rem"}}>
                    <TYPE.body color={theme.text2} fontWeight={500} fontSize={16} width={"45%"}>
                      <strong>AREC NFT List:</strong>
                    </TYPE.body>
                  </RowBetween>                  

                  <div style={{margin: '0.8rem 0.6rem 0rem'}}>
                    <select onChange = {onARECSelect} style={{ fontSize:16, fontWeight:500, width:'100%',
                                      padding: '0.2rem 0.6rem 0.4rem 0.6rem', fontFamily: 'Lucida Console'}} >
                      {allARECInfo.map((recData: RECData, index) => {
                        const optionText_ID = '0000'.concat(allARECNftTokensID[index].toString())
                        return  <option value={index} > 
                                  {'AREC_'.concat(optionText_ID.substring(optionText_ID.length-4)).concat(':')}
                                  {'   '}
                                  {recPowerList[index]} {`  `} {recStatusList[index]} 
                                </option>
                      })}


                    </select>
                  </div>
                  <div style={{padding: '0.2rem 0.6rem 0.5rem 0.6rem', marginTop: '1rem'}}>
                    { allARECInfo[0] && (
                      <DetailedARECInfo recData = {allARECInfo[0]} />
                    )}
                  </div>
              </Container>
          </AutoColumn>
          <BottomGrouping>
            {!account && (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[signatureData !== null]} />
              </Column>
            )}


            <RowBetween marginTop="10px">
                  <ButtonPrimary width="100%" onClick={() => {handleRECCertify()}}>
                    Confirm AREC NFT 
                  </ButtonPrimary>
            </RowBetween>


          </BottomGrouping>
        </Wrapper>
        </StyledPageCard>
      </AppBody>

    </>
  )
}

