import React, { useContext, useState, useCallback, useMemo } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonLight } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { HelpCircle } from 'react-feather'
import { RowBetween, RowFixed } from '../../components/Row'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useRECIssuanceContract } from '../../hooks/useContract'
import { useCurrency } from '../../hooks/Tokens'
import { tryParseAmount } from '../../state/swap/hooks'
import { calculateGasMargin, isAddress } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useGetUserARECList } from '../../state/issuance/hooks'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Container } from '../../components/CurrencyInputPanel'
import { TYPE } from '../../theme'
import { RECData, REC_STARUS, RECRequest } from '../../state/issuance/hooks'
import TransactionConfirmationModal, { ConfirmationModalContentTitle } from '../../components/TransactionConfirmationModal'
import { ZERO_ADDRESS } from '../../constants'
import { MouseoverTooltip } from '../../components/Tooltip'

import AppBody from '../AppBody'
import QuestionHelper from '../../components/QuestionHelper'
import { GetCerticateInfo, ARECSelect, ARECOption, ButtonRow, DetailedARECInfo } from '../../components/ARecIssuance'

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

function RedeemHelpInfo( ) {
  return (<>
            <Text> This is to redeem your AREC NFT. After the selected AREC NFT is redeemed, 
              one redeem action will be created and recorded on blockchain. Optionally you 
              could mint an AREC retirement certificate at the same transaction. </Text>
            <Text> <b>1.</b> Connect your wallet on Polygon. </Text>
            <Text> <b>2.</b> If any, select the AREC to redeem from the AREC NFT list . </Text>
            <Text> <b>3.</b> Check the indicated AREC to redeem.</Text>            
            <Text> <b>4.A</b> Either click <b>Redeem</b> if you just want to redeem the AREC as 
                    a retirement action, check and sign your AREC redeem transaction.</Text>
            <Text> <b>4.B</b> Or click <b>Redeem and Mint Certificate</b> if you want to redeem
                    the AREC and also mint a retirement certificate, check and sign your 
                    AREC redeem transaction.</Text>
            <Text> <b>5.</b> Waiting your AREC redeem transactoin been confirmed by the blockchain.</Text>
            <Text> <b>Remindings:</b> If you redeem your AREC as a retrirement action, you could 
                    mint AREC retirement certificate freely at any later time.</Text>
          </>
        )
  }

export default function Redeem() {

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

  const arkreenTokenAddress = "0x54e1c534f59343c56549c76d1bdccc8717129832"
  const arkreenToken = useCurrency(arkreenTokenAddress)
  
  const arkreenRECIssuanceContract = useRECIssuanceContract(true)
  
  const [{ showConfirm, txnToConfirm, attemptingTxn, errorMessage, txHash }, setARECTxnState] = useState<{
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

  const [arecSelected, setARECSelected] = useState<number|undefined>()

  const onARECSelect = useCallback( (arecSelect) => {
    console.log("FFFFFFFFFFFFFFF",  arecSelect.target.value)
    setARECSelected(arecSelect.target.value)
  },[setARECSelected])

  const IDString = useMemo(()=>{
    if(!arecSelected) return ''
    const optionText_ID = '0000'.concat(allARECNftTokensID[arecSelected].toString())
    return optionText_ID.substring(optionText_ID.length-4)
  },[allARECNftTokensID, arecSelected])

  const recPowerList = allARECInfo.map((recData: RECData) => {
    const recPowerAmount = arkreenToken ? tryParseAmount(recData.amountREC.toString(), arkreenToken) : undefined
    return (recPowerAmount?.toFixed(3, { groupSeparator: ',' }) ?? '0').concat('_KWH')
  })

  const recStatusList = allARECInfo.map((recData: RECData) => {
    const recStatus = (recData?.status === REC_STARUS.Pending) ? 'Pending':
                      (recData?.status === REC_STARUS.Certified) ? 'Certified' :
                      (recData?.status === REC_STARUS.Cancelled) ? 'Cancelled' :
                      (recData?.status === REC_STARUS.Rejected) ? 'Rejected' : ' '                                            
    return recStatus
  })  

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <Container style={{boxShadow:"inset 0px 0px 8px #06c", margin:'0rem 0rem'}}>
          <AutoColumn gap="4px" style={{padding: "0.75rem 1rem 0.75rem 1rem"}}>
              <RowBetween align="center" height='20px'>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> NFT ID of AREC to Redeem: </Text>
                <Text fontWeight={700} fontSize={14} color={theme.primary1}> {'AREC_'.concat(IDString)} </Text>
              </RowBetween>

              <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> RE Amount to Redeem: </Text>
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.primary1}> 
                {arecSelected ? recPowerList[arecSelected]: ''} </Text>
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
  
  const attempString = `Your AREC NFT of AREC_${IDString} is being redeemed, a retirement certificate will 
                        be minted for you.`

  function modalBottom() {
    return (
      <RowBetween>
        <ButtonError
          disabled={errorAddress}
          onClick={() => handleRedeemAndMintCertificate() }
          id="liquidize-button"
        >
          <Text fontSize={20} fontWeight={500}>
            { !errorAddress ? `Redeem and Mint Certificate` : `Wrong Beneficiary Addess`}
          </Text>
        </ButtonError>
    </RowBetween>
    )
  }

  const handleConfirmDismiss = useCallback(() => {
    setARECTxnState({ attemptingTxn, txnToConfirm, showConfirm: false, errorMessage, txHash})
  }, [attemptingTxn, txnToConfirm, errorMessage, txHash])  


  async function handleRedeemAndMintCertificate() {
    if((!arkreenRECIssuanceContract) || (arecSelected===undefined)) return

    const ARECID = allARECNftTokensID[arecSelected]
    const ARECIDString ='0000'.concat(ARECID.toString())
    const ARECIDStr =ARECIDString.substring(ARECIDString.length-4)

    setARECTxnState({ attemptingTxn: true, txnToConfirm, showConfirm, errorMessage: undefined, txHash: undefined })
    await arkreenRECIssuanceContract.estimateGas['redeemAndMintCertificate'](ARECID,
                          (beneficiary==='')? ZERO_ADDRESS :beneficiary, 
                          nameCertOwner, nameBeneficiary, memoCertificate)  
      .then(async(estimatedGasLimit) => {
        await arkreenRECIssuanceContract.redeemAndMintCertificate(ARECID, 
                          (beneficiary==='')? ZERO_ADDRESS :beneficiary, 
                          nameCertOwner, nameBeneficiary, memoCertificate,
          { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          setARECSelected(undefined)
          addTransaction(response, {
            summary: `Redeemed AREC ID: ${ARECIDStr}`
          })
          setARECTxnState({ attemptingTxn: false, txnToConfirm, showConfirm, errorMessage: undefined, txHash: response.hash })
        })
        .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
                throw new Error(`Redeeming AREC failed: You denied transaction signature.`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              throw new Error(`Redeeming AREC failed: ${error.message}`)
            }
        })
      })
      .catch((error: any) => {
        console.log("Error of Redeeming AREC tx:", error)
        setARECTxnState({attemptingTxn: false, txnToConfirm, showConfirm, errorMessage: error.message, txHash: undefined })
      })
  }

  async function handleRECRedeem() {
    if((!arkreenRECIssuanceContract) || (arecSelected===undefined)) return

    const ARECID = allARECNftTokensID[arecSelected]
    const ARECIDString ='0000'.concat(ARECID.toString())
    const ARECIDStr =ARECIDString.substring(ARECIDString.length-4)

    setARECTxnState({ attemptingTxn: true, txnToConfirm, showConfirm, errorMessage: undefined, txHash: undefined })
    await arkreenRECIssuanceContract.estimateGas['redeem'](ARECID)
      .then(async(estimatedGasLimit) => {
        await arkreenRECIssuanceContract.redeem(ARECID, { gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          setARECSelected(undefined)
          addTransaction(response, {
            summary: `Redeemed AREC ID: ${ARECIDStr}`
          })
          setARECTxnState({ attemptingTxn: false, txnToConfirm, showConfirm, errorMessage: undefined, txHash: response.hash })
        })
        .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
                throw new Error(`Redeeming AREC failed: You denied transaction signature.`)
            } else {
              // otherwise, the error was unexpected and we need to convey that
              throw new Error(`Redeeming AREC failed: ${error.message}`)
            }
        })
      })
      .catch((error: any) => {
        console.log("Error of Redeeming AREC tx:", error)
        setARECTxnState({attemptingTxn: false, txnToConfirm, showConfirm, errorMessage: error.message, txHash: undefined })
      })
  }

  const HelpForMint1 = `After the selected AREC NFT is redeemed, one redeem action will be created and 
                        recorded on blockchain. With any redeem actions, you could mint an AREC retiremnet 
                        NFT at anytime later.`

  const HelpForMint2 = `After the selected AREC NFT is redeemed, one redeem action will be created and 
                        recorded on blockchain. An AREC retiremnet NFT will be minted at the same time.`                      

  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'AREC Redeem'}>
          { chainId && ( <QuestionHelper text={'AREC Redeem'} info={<RedeemHelpInfo/>} /> ) } 
        </PageHeader>
        <Wrapper id="issuance-page">

          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleConfirmDismiss}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={() => (
              <ConfirmationModalContentTitle
                title={'You will redeem'}
                onDismiss={handleConfirmDismiss}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={attempString}
            pendingTitle={'Redeem and Mint Certificate'}
            submittedTitle={'Redeem and Mint Certificate Submitted'}
          />

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
                      <Text fontWeight={500} fontSize={14} color={theme.text2}> Total Pending AREC Amount: </Text>
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
                  <ARECSelect itemselected={!!arecSelected} onChange = {onARECSelect}>
                    <ARECOption value="none" selected disabled hidden> Please select the AREC NFT to retire </ARECOption>                                      
                    {allARECInfo.map((recData: RECData, index) => {
                      const optionText_ID = '0000'.concat(allARECNftTokensID[index].toString())
                      return  <ARECOption value={index}> 
                                {'AREC_'.concat(optionText_ID.substring(optionText_ID.length-4)).concat(':')}
                                {'   '}
                                {recPowerList[index]} {`   `} {recStatusList[index]} 
                              </ARECOption>
                    })}
                  </ARECSelect>
                </div>
                { (allARECInfo[0] && (arecSelected !== undefined)) && (
                    <div style={{padding: '0.3rem 0.6rem 0.6rem 0.6rem'}}>
                      <DetailedARECInfo recData = {allARECInfo[arecSelected]} />
                    </div>
                )}
              </Container>
            )}
          </AutoColumn>

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
                <>
                  <RowBetween>
                    <ButtonError
                      onClick={() => handleRECRedeem() }
                      id="redeem-button"
                    >
                      <ButtonRow>
                        <div />
                        <Text fontSize={20} fontWeight={500}>
                          Redeem
                        </Text>
                        <div style={{fontWeight: "lighter" }} >
                          <MouseoverTooltip text = {HelpForMint1} >
                            <HelpCircle size="20" color={theme.text5} style={{ marginLeft: '8px' }} />
                          </MouseoverTooltip>
                        </div>
                      </ButtonRow>

                    </ButtonError>
                  </RowBetween>

                  <RowBetween marginTop="10px">
                    <ButtonError
                      onClick={() => setARECTxnState({ 
                        attemptingTxn: false, 
                        txnToConfirm, 
                        showConfirm: true, 
                        errorMessage: undefined, txHash: undefined })
                      }
                      id="redeem-button"
                    >
                      <ButtonRow>
                        <div />
                        <Text fontSize={20} fontWeight={500}>
                          Redeem and Mint Certificate
                        </Text>
                        <div style={{fontWeight: "lighter" }} >
                          <MouseoverTooltip text = {HelpForMint2} >
                            <HelpCircle size="20" color={theme.text5} style={{ marginLeft: '8px' }} />
                          </MouseoverTooltip>
                        </div>
                      </ButtonRow>
                    </ButtonError>
                  </RowBetween>
                </>
              )
            }
          </BottomGrouping>
        </Wrapper>
        </StyledPageCard>
      </AppBody>

    </>
  )
}