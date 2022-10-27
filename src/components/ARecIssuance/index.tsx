import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { darken } from 'polished'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { ArrowRight } from 'react-feather'

import { InputPanel, Container } from '../CurrencyInputPanel'

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
