import React, { useContext, useState, useCallback, useMemo } from 'react'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { RowBetween, RowFixed } from '../../components/Row'
import { ZERO_ADDRESS } from '../../constants'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import useENS from '../../hooks/useENS'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useArkreenRetirementContract, arkreenTokenAddress } from '../../hooks/useContract'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'
import { BigNumber } from 'ethers'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useGetActionList } from '../../state/issuance/hooks'
import Loader from '../../components/Loader'
import { TYPE } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Container } from '../../components/CurrencyInputPanel'
import { OffsetAction, RECRequest } from '../../state/issuance/hooks'
import { GetCerticateInfo } from '../../components/ARecIssuance'
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
            <Text> This is to mint retirement certificate based on previous retirement (redeem and offset) 
              actions. You could also include some retirement memo to this certificate. </Text>
            <Text> <b>1.</b> Connect your wallet on Polygon. </Text>
            <Text> <b>2.</b> Select the retirement actions you want to include. </Text>
            <Text> <b>3.</b> Input the message you want to record in the certificate, including your name 
              as the certificate owner, retirement beneficiary wallet address and name, and any 
              supplement message you want to include. All this items are optional</Text>
            <Text> <b>4.</b> Click <b>Mint Retirement Certificate</b>, check and sign your transaction.</Text>
          </>
        )
}

const ARECContainer = styled.div`
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 0.3rem 0.6rem 0.3rem 0.6rem;
  background: transparent;
`

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
  
  const arkreenToken = useCurrency(arkreenTokenAddress)
  const arkRetirementCertificateContract = useArkreenRetirementContract(true)
 
  // const [{ showConfirm, txnToConfirm, errorMessage, attemptingTxn, txHash }, setARECTxnState] = useState<{
  const [{ showConfirm, txnToConfirm }, setARECTxnState] = useState<{
    showConfirm: boolean
    txnToConfirm: RECRequest | undefined
    attemptingTxn: boolean
    errorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    txnToConfirm: undefined,
    attemptingTxn: false,
    errorMessage: undefined,
    txHash: undefined
  })

  const addTransaction = useTransactionAdder()
  const [offsetSelected, setOffsetSelected] = useState<number[] | undefined>()


  const [nameCertOwner, setNameCertOwner] = useState<string> ('')
  const [beneficiary, setBeneficiary] = useState<string> (ZERO_ADDRESS)
  const [nameBeneficiary, setNameBeneficiary] = useState<string> ('')
  const [memoCertificate, setMemoCertificate] = useState<string> ('')
  const [errorAddress, setErrorAddress] = useState(false)

  const { address, loading} = useENS(beneficiary)
  useMemo(()=>{
    if(loading) return
    const error = Boolean(!address && (beneficiary!==ZERO_ADDRESS) && (beneficiary!==''))
    setErrorAddress(error)
  },[loading, address, beneficiary, setErrorAddress])
  
  const onChangeBeneficiary = useCallback( (beneficiary) => {
    setBeneficiary(beneficiary)
    }, [setBeneficiary] 
  )

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

    setARECTxnState({ attemptingTxn: true, txnToConfirm, showConfirm, errorMessage: undefined, txHash: undefined })
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
          setARECTxnState({ attemptingTxn: false, txnToConfirm, showConfirm, errorMessage: undefined, txHash: response.hash })
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
        setARECTxnState({attemptingTxn: false, txnToConfirm, showConfirm, errorMessage: error.message, txHash: undefined })
      })
  }

  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'Mint Retirement Certificate'}>
          { chainId && ( <QuestionHelper text={'Mint Retirement Certificate'} info={<RetirementHelpInfo/>} /> ) } 
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
                  <select multiple size={5} onChange = {onARECSelect} style={{ fontSize:16, fontWeight:500, width:'100%', 
                                    borderColor: offsetSelected ? theme.text1 :theme.primary1,
                                    borderWidth: offsetSelected ? "1px" : "2px",
                                    borderRadius: '4px 0px 0px 4px',
                                    appearance: 'none',
                                    padding: '0.2rem 0.6rem 0rem 0.6rem', fontFamily: 'Tahoma'}} >
                    <option value="none" disabled> Select action(s) to mint retirement NFT </option>                                           
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
              <GetCerticateInfo certOwner = {nameCertOwner} beneficiary={beneficiary} 
                                nameBeneficiary={nameBeneficiary} memoCertificate={memoCertificate}
                                setCertOwner ={setNameCertOwner}  setBeneficiary = {onChangeBeneficiary} 
                                setNameBeneficiary = {setNameBeneficiary} setMemoCertificate ={setMemoCertificate} />
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
                    Select Retirement Actions
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
                    <Text fontSize={20} fontWeight={500}>
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
