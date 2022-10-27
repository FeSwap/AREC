import React, { useContext, useState, useCallback } from 'react'
//import React, { useContext, useEffect, useState, useCallback } from 'react'

//import { ArrowDown } from 'react-feather'
//import ReactGA from 'react-ga'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'

import AddressInputPanel, { MessageInputPanel } from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight } from '../../components/Button'
//import { ButtonError, ButtonLight, ButtonConfirmed, ButtonPrimary } from '../../components/Button'

//import Card from '../../components/Card'
import { AutoColumn } from '../../components/Column'
//import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
//import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { RowBetween, RowFixed } from '../../components/Row'
import { ZERO_ADDRESS } from '../../constants'

//import { RowBetween, RowFixed, AutoRow } from '../../components/Row'

import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import { SeparatorBlack } from '../../components/SearchModal/styleds'

//import { ArrowWrapper, BottomGrouping, Wrapper } from '../../components/swap/styleds'

import { ResizingTextArea } from '../../components/TextInput'
import useENS from '../../hooks/useENS'

//import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
//import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
//import TradePrice from '../../components/swap/TradePrice'
//import ProgressSteps from '../../components/ProgressSteps'
import PageHeader from '../../components/PageHeader'
//import {SettingsIcon} from '../../components/Settings'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useArkreenRetirementContract, arkreenTokenAddress } from '../../hooks/useContract'
//import { splitSignature } from 'ethers/lib/utils'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'
//import { CurrencyAmount } from '@feswap/sdk'
import { BigNumber } from 'ethers'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
//import { shortenAddress, shortenCID } from '../../utils'
import { useGetActionList } from '../../state/issuance/hooks'
import Loader from '../../components/Loader'
import { TYPE } from '../../theme'

//import { LinkStyledButton, TYPE } from '../../theme'

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
//import { DateTime } from 'luxon'
//import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { OffsetAction } from '../../state/issuance/hooks'
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


const ARECContainer = styled.div`
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 0.3rem 0.6rem 0.3rem 0.6rem;
  background: transparent;
`

/*
const ScrollSelect = styled.select`
  appearance:none;
  -moz-appearance:none;
  -webkit-appearance:none;

  ::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background-clip: content-box;
    box-shadow: 0 0 0 5px #464f70 inset;
    -webkit-box-shadow: inset 0 0 8px
  }
`
  */


/*
const PromptText = memo(styled(TextInput)`
  margin-bottom: 0.5rem;
`)
*/


//box-shadow: inset 0px 0px 8px #06c;
function DetailedRetirementInfo({retireID, retireData}:
              {retireID: number[],  retireData: OffsetAction[]}) {
  const theme = useContext(ThemeContext)
  const arkreenToken = useCurrency(arkreenTokenAddress)

  const totalRetirementAmount = retireID.reduce<BigNumber>((totalRetirementAmount, id)=> { 
      return totalRetirementAmount.add(retireData[id].amount)
  }, BigNumber.from(0))

  const powerAmount = arkreenToken ? tryParseAmount(totalRetirementAmount.toString(), arkreenToken) : undefined
  const powerAmountString = (powerAmount?.toFixed(3, { groupSeparator: ',' }) ?? '0').concat(' KWH')

  return ( <ARECContainer>
            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Number of Selected Retirement Actions: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the number of retirement actions
                        that will be included in the minted retirement certificate.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {retireID.length} </Text>
            </RowBetween>
            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> Selected Retirement RE Amount: </Text>
                <QuestionHelper bkgOff={true} small={true} info={<>This is the total renewable energy amount 
                              of the selected retirement actions to be included in the minted retirement certificate.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {powerAmountString} </Text>
            </RowBetween>
          </ARECContainer>
    )
  }

//export default function Swap({ history }: RouteComponentProps) {
export default function MintCertificate() {

  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  const { allOffsetActionsID,
          allOffsetActions,
          allUnclaimedActionsIDs,
          totalUnclaimedAmount,
          allUnclaimedActions
      } = useGetActionList()
  
  const arkreenTokenAddress = "0x54e1c534f59343c56549c76d1bdccc8717129832"
  const arkreenToken = useCurrency(arkreenTokenAddress)
  
  const arkRetirementCertificateContract = useArkreenRetirementContract(true)

//  console.log("allOffsetActionsID, allOffsetActions, arkRetirementCertificateContract",
//              allOffsetActionsID, allOffsetActions, allUnclaimedActionsIDs, totalUnclaimedAmount, allClaimedActionsIDs,
//              totalClaimedAmount, arkRetirementCertificateContract)
  
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
  const [offsetSelected, setOffsetSelected] = useState<number[] | undefined>()

  const [beneficiary, setBeneficiary] = useState<string> (ZERO_ADDRESS)

  const [nameCertOwner, setNameCertOwner] = useState<string> ('')
  const [nameBeneficiary, setNameBeneficiary] = useState<string> ('')

  const [memoCertificate, setMemoCertificate] = useState<string> ('')

  const { address, loading, name: nameENSBeneficiary} = useENS(beneficiary)
  const errorAddress = Boolean(!loading && !address && (beneficiary!==ZERO_ADDRESS) && (beneficiary!==''))

  const onChangeBeneficiary = useCallback( (beneficiary) => {
    setBeneficiary(beneficiary)
    }, [setBeneficiary] 
  )

  console.log('beneficiary, address, loading, nameENSBeneficiary',  beneficiary, address, loading, nameENSBeneficiary)

  const onARECSelect = useCallback( (arecSelect) => {
    let selected: number[] = []
    for (let i = 0; i < arecSelect.target.selectedOptions.length; i++) {
      selected.push(arecSelect.target.selectedOptions[i].value as number)
    }

    setOffsetSelected(selected)
  }, [setOffsetSelected])

  const retiredPowerUnclaimed = allUnclaimedActions.map((offsetAction: OffsetAction) => {
    const retiredPowerUnclaimed = arkreenToken ? tryParseAmount(offsetAction.amount.toString(), arkreenToken) : undefined
    return (retiredPowerUnclaimed?.toFixed(3, { groupSeparator: ',' }) ?? '0').concat('_KWH')
  })

  async function handleMintCertificate() {
 
    if((!arkRetirementCertificateContract) || (offsetSelected===undefined) || (offsetSelected.length ===0) || errorAddress) return

    const retirmentID = offsetSelected.map((offsetIndex)=> allUnclaimedActionsIDs[offsetIndex])

    setMintState({ attemptingTxn: true, recRequestToConfirm, showConfirm, IssueErrorMessage: undefined, txHash: undefined })
    await arkRetirementCertificateContract.estimateGas['mintCertificate'](account, 
                    (beneficiary==='')? ZERO_ADDRESS :beneficiary, nameCertOwner,
                    nameBeneficiary, memoCertificate, retirmentID)
      .then(async(estimatedGasLimit) => {
        await arkRetirementCertificateContract.mintCertificate(account, 
                    (beneficiary==='')? ZERO_ADDRESS :beneficiary, nameCertOwner,
                    nameBeneficiary, memoCertificate, retirmentID, { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Mint retirement certificate with ${offsetSelected.length} actions`
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
        <PageHeader header={'Mint Retirement Certificate'}>
          { chainId && ( <QuestionHelper text={'AREC Issuance'} info={<RetirementHelpInfo/>} /> ) } 
        </PageHeader>
        <Wrapper id="issuance-page">
          <AutoColumn gap={'md'}>
            <Container style={{boxShadow:"inset 0px 0px 8px #06c", margin:'0rem 0rem'}}>
              <AutoColumn gap="4px" style={{padding: "0.75rem 1rem 0.75rem 1rem"}}>
                  <RowBetween align="center" height='20px'>
                    <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Number of Retirement Actions: </Text>
                    { (allOffsetActionsID === undefined) ? (
                        <Loader  />
                      ) : (
                        <Text fontWeight={700} fontSize={14} color={theme.text2}> 
                          {allUnclaimedActionsIDs?.length.toString()} 
                        </Text>
                      ) 
                    }
                  </RowBetween>
                  { (allOffsetActionsID !== undefined) && (
                    <RowBetween align="center" height='20px'>
                      <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Retirement Amount to Mint: </Text>
                      <Text fontWeight={700} fontSize={14} color={theme.primary1}> {totalUnclaimedAmount.toString()} KWH</Text>
                    </RowBetween>
                  )}
              </AutoColumn>
            </Container>   
            {((allUnclaimedActionsIDs !== undefined) && (allUnclaimedActionsIDs.length !==0)) && (            
              <Container>
                <RowBetween align="center" height='20px' style={{padding: "0.75rem 1rem 0rem 1rem"}}>
                  <TYPE.body color={theme.text2} fontWeight={500} fontSize={16} width={"45%"}>
                    <strong>Retirement Action List:</strong>
                  </TYPE.body>
                </RowBetween>                  
                <div style={{margin: '0.8rem 0.6rem 0.6rem'}}>
                  <select multiple size={3} onChange = {onARECSelect} style={{ fontSize:16, fontWeight:500, width:'100%', 
                                    borderColor: offsetSelected ? theme.text1 :theme.primary1,
                                    borderWidth: offsetSelected ? "1px" : "2px",
                                    borderRadius: '4px 0px 0px 4px',
                                    appearance: 'none',
                                    padding: '0.4rem 0.6rem 0.4rem 0.6rem', fontFamily: 'Lucida Console'}} >
                    {allUnclaimedActionsIDs.map((_, index) => {
                      const optionText_ID = '0000'.concat(allUnclaimedActionsIDs[index].toString())
                      return  <option value={index} key={index.toString()} > 
                                {'ACT_'.concat(optionText_ID.substring(optionText_ID.length-4)).concat(':')}
                                {'         '} {retiredPowerUnclaimed[index]} 
                              </option>
                    })}
                  </select>
                </div>
                { ((offsetSelected !== undefined) && (offsetSelected.length !==0)) &&(
                    <div style={{padding: '0.3rem 0.6rem 0.6rem 0.6rem'}}>
                      <DetailedRetirementInfo retireID = {offsetSelected} retireData = {allOffsetActions} />
                    </div>
                )}
              </Container>
            )}

            {((allUnclaimedActionsIDs !== undefined) && (allUnclaimedActionsIDs.length !==0)) && (            
              <Container>
                
                <RowBetween align="center" height='20px' style={{padding: "1rem 1rem 0.75rem 1rem"}}>
                  <RowFixed>
                    <TYPE.body color={theme.text2} fontWeight={500} fontSize={16}>
                      <strong>Retirement Certificate Info:</strong>
                    </TYPE.body>
                    <QuestionHelper bkgOff={true} small={true} info={<>This is the number of retirement actions
                          that will be included in the minted retirement certificate.</>} />
                  </RowFixed>
                  <div />
                </RowBetween >
                <SeparatorBlack/>
                <AutoColumn gap="4px" style={{padding: "0.5rem"}}>
                  <RowFixed style={{paddingLeft: "0.5rem"}}>
                    <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                      Certifictate Owner Name (Optional):
                    </TYPE.body>
                    <QuestionHelper bkgOff={true} small={true} info={<>This is the name of the owner of the retirement
                          certificate that will be minted.</>} />
                  </RowFixed>
                  <MessageInputPanel value={nameCertOwner} onUserInput={setNameCertOwner} placeholder={`Certifictate Owner Name`} />

                  <RowFixed style={{padding: "0.3rem 0.5rem 0rem"}}>
                    <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                      Beneficiary Account Address: (Optional):
                    </TYPE.body>
                    <QuestionHelper bkgOff={true} small={true} info={<>This is the account address of the retirement
                      beneficiary.</>} />
                  </RowFixed>
                  <AddressInputPanel id="recipient" simple={true} 
                          value={(beneficiary !==ZERO_ADDRESS) ? beneficiary: ''} onChange={onChangeBeneficiary} 
                          placeholder={'Beneficiary Account Address'} />

                  <RowFixed style={{padding: "0.3rem 0.5rem 0rem"}}>
                    <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                    Beneficiary Name (Optional):
                    </TYPE.body>
                    <QuestionHelper bkgOff={true} small={true} info={<>This is the name of the 
                          retirement beneficiary. </>} />
                  </RowFixed>
                  <MessageInputPanel value={nameBeneficiary??nameENSBeneficiary} 
                        onUserInput={setNameBeneficiary} placeholder={`Retirement Beneficiary Name`} />

                  <RowFixed style={{padding: "0.3rem 0.5rem 0rem"}}>
                    <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
                      Retirement Memo: (Optional):
                    </TYPE.body>
                    <QuestionHelper bkgOff={true} small={true} info={<>This is the optiona message that could be recorded in the
                          retirement certificate. </>} />
                  </RowFixed>
                  <ResizingTextArea value={memoCertificate} onUserInput={setMemoCertificate} 
                        placeholder={`Retirement Certificate Memo`} borderRadius={'6px'} small={true} fontSize="1rem" />
                </AutoColumn>
              </Container>
            )}
          </AutoColumn>

          <BottomGrouping>
            {!account ? (
                <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
              ) : (allUnclaimedActionsIDs === undefined) ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    Waiting Retirement Info
                  </Text>
                </ButtonError>
              ) : ((allUnclaimedActionsIDs === undefined) || (allUnclaimedActionsIDs.length ===0)) ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    No Retirement Action
                  </Text>
                </ButtonError>
              ) : ((offsetSelected === undefined) || (offsetSelected.length ===0)) ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    Select Retirement Action
                  </Text>
                </ButtonError>
              ) : (errorAddress) ? (
                <ButtonError disabled={true} error={false}>
                  <Text fontSize={20} fontWeight={500}>  
                    Wrong Beneficiary Address
                  </Text>
                </ButtonError>
              ) : (
                <RowBetween>
                  <ButtonError
                    onClick={() => handleMintCertificate() }
                    id="redeem-button"
                  >
                    <Text fontSize={16} fontWeight={500}>
                      Mint Retirement Certificate
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