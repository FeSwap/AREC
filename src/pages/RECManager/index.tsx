import React, { useContext, useEffect, useState, useCallback } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonLight, ButtonPrimary} from '../../components/Button'
import Column, { AutoColumn } from '../../components/Column'
import { RowBetween, RowFixed } from '../../components/Row'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import ProgressSteps from '../../components/ProgressSteps'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useArkreenTokenContract, useRECIssuanceContract, 
        arkreenTokenAddress, arkreenIssuanceAddress } from '../../hooks/useContract'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'
import { CurrencyAmount } from '@feswap/sdk'
import { BigNumber } from 'ethers'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { shortenAddress, shortenCID } from '../../utils'
import { useGetPendingARECList } from '../../state/issuance/hooks'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Container } from '../../components/CurrencyInputPanel'
import { DateTime } from 'luxon'
import { TYPE } from '../../theme'
import { RECData, REC_STARUS, RECRequest } from '../../state/issuance/hooks'
import AppBody from '../AppBody'
import QuestionHelper from '../../components/QuestionHelper'
import { ARECSelect } from '../../components/ARecIssuance'

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


  const { allARECInfo, 
          allARECNftTokensID, 
        } = useGetPendingARECList()
 
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
  
    async function handleRECCertify() {

      if((!arkreenRECIssuanceContract) || (arecSelected === undefined))
      {
        console.log("arkreenRECIssuanceContract",  arkreenRECIssuanceContract)
        return
      }
  
      const ARECID = allARECNftTokensID[arecSelected]
      const ARECIDString ='00000000'.concat(ARECID.toString())
      const ARECIDStr =ARECIDString.substring(ARECIDString.length-8)

      setARECTxnState({ attemptingTxn: true, txnToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
      await arkreenRECIssuanceContract.estimateGas['certifyRECRequest']( ARECID, ARECIDStr)
        .then(async(estimatedGasLimit) => {
          await arkreenRECIssuanceContract.certifyRECRequest(ARECID, ARECIDStr, 
                                            { gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            setDateSelected(false)
            addTransaction(response, {
              summary: `Request AREC issued by ${shortenAddress(recRequest.issuer,6)}`
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
  
  const showApproveFlow = !(swapInputError || !arkreenTokenContract || !library || !approvalAmount || !dateSelected)

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
                    <ARECSelect itemselected={!!arecSelected} onChange = {onARECSelect}>
                      {allARECInfo.map((recData: RECData, index) => {
                        const optionText_ID = '0000'.concat(allARECNftTokensID[index].toString())
                        return  <option value={index} > 
                                  {'AREC_'.concat(optionText_ID.substring(optionText_ID.length-4)).concat(':')}
                                  {'   '}
                                  {recPowerList[index]} {`  `} {recStatusList[index]} 
                                </option>
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
            {!account && (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[signatureData !== null]} />
              </Column>
            )}
            <RowBetween marginTop="10px">
                  <ButtonPrimary fontSize={20} width="100%" onClick={() => {handleRECCertify()}}>
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

