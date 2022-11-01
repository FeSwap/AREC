import React, { useContext, useState } from 'react'
import { Fraction, JSBI } from '@feswap/sdk'
import styled, { ThemeContext } from 'styled-components'
import { darken } from 'polished'
import { RowBetween, RowFixed } from '../Row'
import { TYPE } from '../../theme'
import { Text } from 'rebass'
import { ArrowRight, MinusCircle, PlusCircle } from 'react-feather'

import { InputPanel, Container } from '../CurrencyInputPanel'
import QuestionHelper from '../QuestionHelper'
import { AutoColumn } from '../Column'
import { SeparatorBlack } from '../SearchModal/styleds'
import AddressInputPanel, { MessageInputPanel } from '../AddressInputPanel'
import { ResizingTextArea } from '../TextInput'
import { ZERO_ADDRESS } from '../../constants'
import { ButtonEmpty } from '../Button'
import { DateTime } from 'luxon'
import { RECData, REC_STARUS } from '../../state/issuance/hooks'
//import { useCurrency } from '../../hooks/Tokens'
//import { tryParseAmount } from '../../state/swap/hooks'
import { shortenAddress, shortenCID } from '../../utils'
//import { arkreenTokenAddress } from '../../hooks/useContract'

export const ARECDate = styled.input.attrs({
  type: "date"
})`
  border: solid 1px;
  border-color: ${({theme}) => theme.primaryText1};
    border-radius: 6px;
  font-size: 20px;
  padding: 0.2rem 0.8rem 0.2rem 0.8rem; 
  margin: 0.5rem 0.4rem 0.5rem 0.4rem;
  &:disabled {
    border-color: ${({theme}) => theme.bg4};
  }  
  :hover:not([disabled]) {
      border: solid 2px red;
    }
  }
`

interface DateInputInterface {
  onChangeDate?: (date: string) => void,
  min?: string,
  max?: string,
  value?: string, 
  disabled: boolean
}

function DateInput({ onChangeDate, min, max, value, disabled=false}: DateInputInterface) {
  return (
    <ARECDate disabled={disabled} min={min} max={max} value={value} width={"45%"}
      onChange={(event) => onChangeDate && onChangeDate(event.target.value)} />
  )
}
 
const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const DateRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 20px 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`

export const ARECSelect = styled.select<{itemselected: boolean}>`
  font-size: 16px; 
  font-weight: 600; 
  border-radius: 4px 0px 0px 4px;
  width: 100%;
  border-color:  ${({itemselected, theme}) => (itemselected? theme.text1 :theme.primary1) };
  border-Width: ${({itemselected}) => (itemselected? "1px" : "2px") };
  padding: 0.4rem 0.6rem 0.4rem 0.6rem;
  font-family: 'Tahoma';
`
//font-family: 'Lucida Console';
//font-family: 'Inter var', sans-serif;
//Consolas

export const ARECOption = styled.option`
  color: ${({theme}) => (theme.text1) };
  :focus {
    color: black;
    background-color: cyan;
  }
  :hover {
    color: black;
    background-color: cyan;
  }
`

export const ButtonRow = styled.div`
display: grid;
width: 100%;
height: 20px
grid-template-columns: 20px 1fr 20px;
column-gap: 6px;
align-items: start;
justify-content: space-between;
`  

interface ARECIssuanceDateProps {
  startDate: string
  endDate: string
  minDate?: string
  maxDate?: string
  onChangeDate: (date: string) => void
  id: string
  children:  React.ReactNode
  active:  boolean
}

interface GetCertInfoProps {
  certOwner:        string
  beneficiary:      string
  nameBeneficiary:  string
  memoCertificate:  string
  setCertOwner:       (date: string) => void
  setBeneficiary:     (date: string) => void
  setNameBeneficiary: (date: string) => void
  setMemoCertificate: (date: string) => void
}

function ButtonUpOrDown( { bShow, setbShow}: { bShow: boolean, setbShow: (bShow: boolean) => void} ) {
  return (
    <RowFixed >
      <ButtonEmpty style={{padding:'4px'}} onClick={() => {setbShow(!bShow)}} >
        {bShow  ? ( <MinusCircle size="16px" style={{ margin: '0px 8px 0px 20px'}} /> ) 
                : ( <PlusCircle size="16px" style={{ margin: '0px 8px 0px 20px'}} />
        )}
      </ButtonEmpty>
    </RowFixed>
  )
}
export function GetCerticateInfo({
  certOwner,
  beneficiary,
  nameBeneficiary,
  memoCertificate,
  setCertOwner,
  setBeneficiary,
  setNameBeneficiary,
  setMemoCertificate
  } : GetCertInfoProps) {
  const theme = useContext(ThemeContext)

  const [showOwnerName , setShowOwnerName] = useState(false)
  const [showbeneficiary, setShowbeneficiary] = useState(false)
  const [showNameBeneficiary, setShowNameBeneficiary] = useState(false)
  const [showMemoCertificate, setShowMemoCertificate] = useState(true)

  return (
    <Container>
      <RowBetween align="center" height='20px' style={{padding: "1rem 1rem 0.75rem 1rem"}}>
        <RowFixed>
          <TYPE.body color={theme.text2} fontWeight={500} fontSize={16}>
            <strong>Retirement Certificate Info:</strong>
          </TYPE.body>
          <QuestionHelper bkgOff={true} small={'m'} info={<>This is the additional information items
                that will be included in the minted retirement certificate.</>} />
        </RowFixed>
        <div />
      </RowBetween >
      <SeparatorBlack/>
      <AutoColumn gap="4px" style={{padding: "0.5rem"}}>
        <RowBetween>
          <RowFixed style={{padding: "0.3rem 0.5rem 0rem"}}>
            <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
              Certifictate Owner Name (Optional):
            </TYPE.body>
            <QuestionHelper bkgOff={true} small={'s'} info={<>This is the name of the owner of the retirement
                  certificate that will be minted.</>} />
          </RowFixed>
          < ButtonUpOrDown bShow ={showOwnerName} setbShow ={setShowOwnerName} />
        </RowBetween>  
        { showOwnerName && (
          <MessageInputPanel value={certOwner} onUserInput={setCertOwner} placeholder={`Certifictate Owner Name`} />
        )}

        <RowBetween>
          <RowFixed style={{padding: "0.3rem 0.5rem 0rem"}}>
            <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
              Beneficiary Account Address: (Optional):
            </TYPE.body>
            <QuestionHelper bkgOff={true} small={'s'} info={<>This is the account address of the retirement
              beneficiary.</>} />
          </RowFixed>
          < ButtonUpOrDown bShow ={showbeneficiary} setbShow ={setShowbeneficiary} />
        </RowBetween>
        { showbeneficiary && (
          <AddressInputPanel id="recipient" simple={true} 
                  value={(beneficiary !==ZERO_ADDRESS) ? beneficiary: ''} onChange={setBeneficiary} 
                  placeholder={'Beneficiary Account Address'} />
        )}      

        <RowBetween>
          <RowFixed style={{padding: "0.3rem 0.5rem 0rem"}}>
            <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
            Beneficiary Name (Optional):
            </TYPE.body>
            <QuestionHelper bkgOff={true} small={'s'} info={<>This is the name of the 
                  retirement beneficiary. </>} />
          </RowFixed>
          < ButtonUpOrDown bShow ={showNameBeneficiary} setbShow ={setShowNameBeneficiary} />
        </RowBetween>
        { showNameBeneficiary && (
          <MessageInputPanel value={nameBeneficiary} 
                onUserInput={setNameBeneficiary} placeholder={`Retirement Beneficiary Name`} />
        )}    

        <RowBetween>
          <RowFixed style={{padding: "0.3rem 0.5rem 0rem"}}>
            <TYPE.body color={theme.text2} fontWeight={500} fontSize={14}>
              Retirement Memo: (Optional):
            </TYPE.body>
            <QuestionHelper bkgOff={true} small={'s'} info={<>This is the optional message that could be recorded in the
                  retirement certificate. </>} />
          </RowFixed>
          < ButtonUpOrDown bShow ={showMemoCertificate} setbShow ={setShowMemoCertificate} />
        </RowBetween>
        { showMemoCertificate && (
          <ResizingTextArea value={memoCertificate} onUserInput={setMemoCertificate} 
                placeholder={`Retirement Certificate Memo`} borderRadius={'6px'} small={true} fontSize="1rem" />
        )}

      </AutoColumn>
    </Container>
  )
}

export default function ARECIssuanceDate({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChangeDate,
  id,
  children,
  active,
}: ARECIssuanceDateProps) {

  const theme = useContext(ThemeContext)
   return (
    <InputPanel id={id}>
      <Container>

          <LabelRow>
            <RowBetween style={{alignItems: 'center'}}>
              <TYPE.body color={theme.text2} fontWeight={500} fontSize={16} width={"45%"}>
                <strong>Start AREC Date:</strong>
              </TYPE.body>
              <ArrowRight size={16} width={"10%"} />
              <TYPE.body color={theme.text2} fontWeight={500} fontSize={16} width={"45%"} textAlign={'right'}>
                <strong>End REC Date:</strong>
              </TYPE.body>
            </RowBetween>
          </LabelRow>

        <DateRow style={{padding: '0.2rem 0.2rem 0.2rem 0.2rem', height:'60px'}}>
          <DateInput value ={startDate} disabled={true} />
          <div/>
          <DateInput value ={endDate} onChangeDate={onChangeDate} max={maxDate} 
                              min={minDate} disabled={!active} />
        </DateRow>
        <div style={{padding: '0.2rem 0.6rem 0.5rem 0.6rem', marginBottom: '4px'}}>
          {children}
        </div>
      </Container>

    </InputPanel>
  )
}

const ARECContainer = styled.div`
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 0.3rem 0.6rem 0.3rem 0.6rem;
  background: transparent;
`
export function DetailedARECInfo({recData}:{recData: RECData}) {
  const theme = useContext(ThemeContext)
//  const arkreenToken = useCurrency(arkreenTokenAddress)

  const startDate = DateTime.fromSeconds(recData.startTime) ?? ''
  const endDate = DateTime.fromSeconds(recData.endTime) ?? ''

//  const powerAmount = arkreenToken ? tryParseAmount(recData.amountREC.toString(), arkreenToken) : undefined
  const powerAmount = new Fraction(recData.amountREC.toString(), JSBI.BigInt(1000000))
  const powerAmountString = (powerAmount?.toFixed(3, { groupSeparator: ',' }) ?? '0').concat(' KWH')

  const recStatus = (recData?.status === REC_STARUS.Pending) ? 'Pending':
                    (recData?.status === REC_STARUS.Certified) ? 'Certified' :
                    (recData?.status === REC_STARUS.Cancelled) ? 'Cancelled' :
                    (recData?.status === REC_STARUS.Rejected) ? 'Rejected' : ' '        

  return ( <ARECContainer>
            <RowBetween align="center" height='24px'> 
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Status: </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the selected AREC Status.
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
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the name of the entity issuing AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> 
                {shortenAddress(recData.issuer,6)}
              </Text>
            </RowBetween>   

            {(recData.status === REC_STARUS.Certified) && ( 
              <RowBetween align="center" height='24px'> 
                <RowFixed>
                  <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Serial No: </Text>
                  <QuestionHelper bkgOff={true} small={'s'} info={<>This is the unique serial number
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
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the amount of the total renewable energy  
                              recorded in the selected AREC NFT.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {powerAmountString} </Text>
            </RowBetween>

            <RowBetween align="center" height="24px">
              <RowFixed>
                <Text fontWeight={500} fontSize={14} color={theme.text2}> AREC Region:  </Text>
                <QuestionHelper bkgOff={true} small={'s'} info={<>This is the region of the selected AREC.</>} />
              </RowFixed>
              <Text lineHeight={"24px"} fontWeight={700} fontSize={14} color={theme.text1}> {recData.region} </Text>
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
