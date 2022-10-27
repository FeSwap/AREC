import React, { useContext, useState, useCallback } from 'react'
//import React, { useContext, useEffect, useState, useCallback } from 'react'

//import { ArrowDown } from 'react-feather'
//import ReactGA from 'react-ga'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
//import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight } from '../../components/Button'
//import { ButtonError, ButtonLight, ButtonConfirmed, ButtonPrimary } from '../../components/Button'

//import Card from '../../components/Card'
import { AutoColumn } from '../../components/Column'
//import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
//import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { RowBetween, RowFixed } from '../../components/Row'
//import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
//import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
//import TradePrice from '../../components/swap/TradePrice'
//import ProgressSteps from '../../components/ProgressSteps'
import PageHeader from '../../components/PageHeader'
//import {SettingsIcon} from '../../components/Settings'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useRECIssuanceContract, arkreenTokenAddress } from '../../hooks/useContract'
//import { splitSignature } from 'ethers/lib/utils'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'
import { CurrencyAmount } from '@feswap/sdk'
import { BigNumber } from 'ethers'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { shortenAddress, shortenCID } from '../../utils'
import { useGetUserARECList } from '../../state/issuance/hooks'
import Loader from '../../components/Loader'

//import { darken } from 'polished'

import { useActiveWeb3React } from '../../hooks'
//import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
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


 function LiquidizeHelpInfo( ) {
  return (<>
            <Text> Liquidizing AREC NFT will transfer the NFT to the specific contract, and keep it locked there.
              Same amount of AREC ERC20 tokens will be minted to your wallet. </Text>
            <Text> 1. Select the AREC to liquidize. </Text>
            <Text> 2. Click <b>Liquidize</b> button.</Text>
            <Text> 3. Sign the transaction with your wallet.</Text>
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

  const recStatus = (recData?.status === REC_STARUS.Pending) ? 'Pending':
                    (recData?.status === REC_STARUS.Certified) ? 'Issued' :
                    (recData?.status === REC_STARUS.Cancelled) ? 'Cancelled' :
                    (recData?.status === REC_STARUS.Rejected) ? 'Rejected' : ' '        

  return ( <ARECContainer>
            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Status: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the selected AREC Status.
                    Only certified AREC can be redeemed of liquidized.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} 
                  color={(recData?.status === REC_STARUS.Certified) ? theme.text1: theme.primary1}> 
                {recStatus}
              </Text>
            </RowBetween>   

            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Issuer: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the name of the entity issuing AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                {shortenAddress(recData.issuer,6)}
              </Text>
            </RowBetween>   

            {(recData?.status === REC_STARUS.Certified) && ( 
              <RowBetween align="center" height='24px'> 
                <RowFixed>
                  <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Serial No: </Text>
                  <QuestionHelper bkgOff={true} small={true} info={<>This is the unique serial number
                                        of the AREC certified by the issuer.</>} />
                </RowFixed>
                <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                  {recData.serialNumber}
                </Text>
              </RowBetween>
            )}

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
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Region:  </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the region of the selected AREC.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {recData.region} </Text>
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

  // console.log("allARECInfo", numberOfARECNft, allARECInfo, allARECNftTokensID, totalRECAmountIssued, totalRECAmountPending)

  const arkreenTokenAddress = "0x54e1c534f59343c56549c76d1bdccc8717129832"
  const arkreenRECTokenAddress = "0xb0c9dd915f62d0a37792fd2ce497680e909d8c0f"
  //const arkreenIssuanceAddress = "0x95f56340889642a41b913c32d160d2863536e073"
 
  const arkreenToken = useCurrency(arkreenTokenAddress)
  const arkreenRECToken = useCurrency(arkreenRECTokenAddress)
 
  const arkreenRECIssuanceContract = useRECIssuanceContract(true)
  

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

  const addTransaction = useTransactionAdder()

  //const RECIssuer = '0x576Ab950B8B3B18b7B53F7edd8A47986a44AE6F4'
  const [arecSelected, setARECSelected] = useState<number|undefined>()

  const onARECSelect = useCallback( (arecSelect) => {
    setARECSelected(arecSelect.target.value)
 },[setARECSelected])


 const mintAmount: CurrencyAmount | undefined = 
          ((arecSelected !== undefined) && allARECInfo[arecSelected]?.status === REC_STARUS.Certified)
          ? tryParseAmount(allARECInfo[arecSelected].amountREC.toString(), arkreenRECToken??undefined) : undefined

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

  const recPowerList = allARECInfo.map((recData: RECData) => {
    const recPowerAmount = arkreenToken ? tryParseAmount(recData.amountREC.toString(), arkreenToken) : undefined
    return (recPowerAmount?.toFixed(3, { groupSeparator: ',' }) ?? '0').concat('_KWH')
  })

  const recStatusList = allARECInfo.map((recData: RECData) => {
    const recStatus = (recData?.status === REC_STARUS.Pending) ? 'Pending':
                      (recData?.status === REC_STARUS.Certified) ? 'Issued' :
                      (recData?.status === REC_STARUS.Cancelled) ? 'Cancelled' :
                      (recData?.status === REC_STARUS.Rejected) ? 'Rejected' : ' '                                            
    return recStatus
  })  

  async function handleRECLiquidize() {

    if((!arkreenRECIssuanceContract) || (arecSelected===undefined)) return

    const ARECID = allARECNftTokensID[arecSelected]
    const ARECIDString ='0000'.concat(ARECID.toString())
    const ARECIDStr =ARECIDString.substring(ARECIDString.length-4)

    setRECIssauncetate({ attemptingTxn: true, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
    await arkreenRECIssuanceContract.estimateGas['liquidizeREC'](ARECID)
      .then(async(estimatedGasLimit) => {
        await arkreenRECIssuanceContract.liquidizeREC(ARECID, { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Liquidize AREC ID: ${ARECIDStr}`
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
                      <Text fontWeight={700} fontSize={14} color={theme.primary1}> {totalRECAmountIssued.toString()} KWH</Text>
                    </RowBetween>
                  )}
                  { !totalRECAmountPending.isZero() && (
                    <RowBetween align="center" height='20px'>
                      <Text fontWeight={500} fontSize={14} color={theme.text2}> Total pending AREC Amount: </Text>
                      <Text fontWeight={700} fontSize={14} color={theme.text2}> 
                        {totalRECAmountPending.toString()} KWH
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
                  <select onChange = {onARECSelect} style={{ fontSize:16, fontWeight:500, width:'100%', 
                                    borderColor: arecSelected? theme.text1 :theme.primary1,
                                    borderWidth: arecSelected? "1px" : "2px",
                                    padding: '0.4rem 0.6rem 0.4rem 0.6rem', fontFamily: 'Lucida Console'}} >
                    {allARECInfo.map((recData: RECData, index) => {
                      const optionText_ID = '0000'.concat(allARECNftTokensID[index].toString())
                      return  <option value={index} selected={(index===0)? true: false}>
                                {'AREC_'.concat(optionText_ID.substring(optionText_ID.length-4)).concat(':')}
                                {'   '}
                                {recPowerList[index]} {`   `} {recStatusList[index]} 
                              </option>
                    })}
                  </select>
                </div>
                { (allARECInfo[0]) && (
                    <div style={{padding: '0.3rem 0.6rem 0.6rem 0.6rem'}}>
                      <DetailedARECInfo recData = {allARECInfo[0]} />
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
                  <QuestionHelper bkgOff={true} small={true} info={<> The selected AREC will be liquidized,
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
                    <Text fontSize={16} fontWeight={500}>
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