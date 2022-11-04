import React, { useContext, useState, useCallback } from 'react'
import { Fraction, JSBI } from '@feswap/sdk'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonLight, ButtonPrimary} from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { RowBetween, RowFixed } from '../../components/Row'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
//import ProgressSteps from '../../components/ProgressSteps'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useRECIssuanceContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { shortenAddress, shortenCID } from '../../utils'
import { useGetPendingARECList } from '../../state/issuance/hooks'
import { useActiveWeb3React } from '../../hooks'
//import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Container } from '../../components/CurrencyInputPanel'
import { DateTime } from 'luxon'
import { TYPE } from '../../theme'
import { RECData, REC_STARUS, RECRequest } from '../../state/issuance/hooks'
import AppBody from '../AppBody'
import QuestionHelper from '../../components/QuestionHelper'
import { ARECSelect, ARECOption } from '../../components/ARecIssuance'

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

function ManagerHelpInfo( ) {
  return (<>
            <Text> Confirm AREC issuance: </Text>
            <Text> <b>1.</b> Connect your wallet on Polygon. </Text>
            <Text> <b>2.</b> Select the AREC NFT to confirm. </Text>
            <Text> <b>3.</b> Check the selected ARE info.</Text>            
            <Text> <b>4.</b> Click <b>Confirm AREC NFT</b>, check and sign your confirm transaction.</Text>
            <Text> <b>Remindings:</b> Only AREC issuers are allowed for this service.</Text>
          </>
        )
  }

const ARECContainer = styled.div`
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 0.3rem 0.6rem 0.3rem 0.6rem;
  background: transparent;
`

function DetailedARECInfo({recData}:{recData: RECData}) {
  const theme = useContext(ThemeContext)

  const startDate = DateTime.fromSeconds(recData.startTime) ?? ''
  const endDate = DateTime.fromSeconds(recData.endTime) ?? ''

  const powerAmount = new Fraction(recData.amountREC.toString(), JSBI.BigInt(1000000))
  const powerAmountString = (powerAmount?.toFixed(3, { groupSeparator: ',' }) ?? '0').concat(' KWH')  
  
  return ( <ARECContainer>
            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Issuer: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the name of the entity issuing AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                {shortenAddress(recData.issuer,6)}
              </Text>
            </RowBetween>    

            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Earliest AREC Date: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the earlies date when 
                                      the renewable energy of the selected AREC is generated.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                {startDate?.toFormat("yyyy-LLL-dd")}
              </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Latest AREC Date: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the last date when
                                    the renewable energy of the selected AREC is generated.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                {endDate?.toFormat("yyyy-LLL-dd")}
              </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Total RE Amount: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the total renewable energy amount 
                              of the selected AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {powerAmountString} </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC cID: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the cID of the renewable energy data 
                              in ipfs, with which the selected AREC RE amount can be verified.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {shortenCID(recData.cID)} </Text>
            </RowBetween>

          </ARECContainer>
    )
  }

//export default function Swap({ history }: RouteComponentProps) {
export default function RECManager() {

  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()
  const { allARECInfo, 
          allARECNftTokensID, 
        } = useGetPendingARECList()

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
  
  async function handleRECCertify() {
      if((!arkreenRECIssuanceContract) || (arecSelected === undefined)) return
 
      const ARECID = allARECNftTokensID[arecSelected]
      const ARECIDString ='00000000'.concat(ARECID.toString())
      const ARECIDStr =ARECIDString.substring(ARECIDString.length-8)

      setARECTxnState({ attemptingTxn: true, txnToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
      await arkreenRECIssuanceContract.estimateGas['certifyRECRequest']( ARECID, ARECIDStr)
        .then(async(estimatedGasLimit) => {
          await arkreenRECIssuanceContract.certifyRECRequest(ARECID, ARECIDStr, 
                                            { gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            setARECSelected(undefined)
            addTransaction(response, {
              summary: `Confirm AREC Issuance: ${ARECID.toString()}`
            })
            setARECTxnState({ attemptingTxn: false, txnToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: response.hash })
          })
          .catch((error: any) => {
              // if the user rejected the tx, pass this along
              if (error?.code === 4001) {
                  throw new Error(`Confirm AREC Issuance failed: You denied transaction signature.`)
              } else {
                // otherwise, the error was unexpected and we need to convey that
                throw new Error(`Confirm AREC Issuance failed: ${error.message}`)
              }
          })
        })
        .catch((error: any) => {
          console.log("Error of Confirm AREC Issuance tx:", error)
          setARECTxnState({attemptingTxn: false, txnToConfirm, showConfirm, IssueErrorMessage: error.message, txHash: undefined })
        })
      }
  
  const recPowerList = allARECInfo.map((recData: RECData) => {
    return (new Fraction(recData.amountREC.toString(), JSBI.BigInt(1000000))).toFixed(3, { groupSeparator: ',' }).concat(' KWH')
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
        <PageHeader header={'AREC Manager'}>
          { chainId && ( <QuestionHelper text={'AREC Manager'} info={<ManagerHelpInfo/>} /> ) } 
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
                    <ARECSelect itemselected={!!arecSelected} defaultValue="none" onChange = {onARECSelect}>
                      <ARECOption key="none" value="none" disabled hidden> Select AREC NFT to confirm </ARECOption>   
                      {allARECInfo.map((recData: RECData, index) => {
                        const optionText_ID = '0000'.concat(allARECNftTokensID[index].toString())
                        return  <ARECOption  key={optionText_ID} value={index} > 
                                  {'AREC_'.concat(optionText_ID.substring(optionText_ID.length-4)).concat(':')}
                                  {'   '}
                                  {recPowerList[index]} {`  `} {recStatusList[index]} 
                                </ARECOption>
                      })}
                    </ARECSelect>
                  </div>
                  <div style={{padding: '0.2rem 0.6rem 0.5rem 0.6rem', marginTop: '1rem'}}>
                    { allARECInfo[0] && (
                      <DetailedARECInfo recData = {allARECInfo[0]} />
                    )}
                  </div>
              </Container>
          </AutoColumn>
          <BottomGrouping>
            {(!account) ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : (
              <RowBetween marginTop="10px">
                    <ButtonPrimary fontSize={20} width="100%" onClick={() => {handleRECCertify()}}>
                      Confirm AREC NFT 
                    </ButtonPrimary>
              </RowBetween>
            )}
          </BottomGrouping>
        </Wrapper>
        </StyledPageCard>
      </AppBody>
    </>
  )
}

