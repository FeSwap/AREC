import React, { useCallback, useState, useContext } from 'react'
import { HelpCircle as Question } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import Tooltip from '../Tooltip'

const QuestionWrapper = styled.div<{bkgOff?: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  background-color: ${({theme, bkgOff}) => (bkgOff ? 'none' : theme.bg1) };
  color: ${({ theme }) => theme.text2};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

// ${({ theme, error }) => (error ? theme.red1 : 'inherit')};
// ${({ theme, status }) => (status === 'for' ? theme.green1 : theme.red1)};


//background-color: ${({ theme }) => theme.bg1};

const LightQuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  width: 24px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.white};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const QuestionMark = styled.span`
  font-size: 1rem;
`

export default function QuestionHelper({ text, info, warning = false, small, bkgOff }: 
                    { text?: string, info?: JSX.Element, warning?: boolean, small?: string, bkgOff?: boolean }) {
  const [show, setShow] = useState<boolean>(false)
  const theme = useContext(ThemeContext)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} info={info} show={show}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close} bkgOff={bkgOff}>
          { <Question color={warning ? theme.primary1: undefined } 
            size={(small==='s') ? 12 : (small==='m')? 16 : 20} />
          }
        </QuestionWrapper>
      </Tooltip>
    </span>
  )
}

export function LightQuestionHelper({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <span style={{ marginLeft: 4 }}>
      <Tooltip text={text} show={show}>
        <LightQuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <QuestionMark>?</QuestionMark>
        </LightQuestionWrapper>
      </Tooltip>
    </span>
  )
}
