//import React, { useContext, useCallback } from 'react'
//import styled, { ThemeContext } from 'styled-components'
import React, {  useCallback } from 'react'
import styled from 'styled-components'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React } from '../../hooks'
import { ExternalLink } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { getExplorerLink } from '../../utils/explorer'
import { feswType } from '../../hooks/useContract'

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.bg1};
  z-index: 1;
  width: 100%;
`

const ContainerRow = styled.div<{ error: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: 1px solid ${({ error, theme }) => (error ? theme.red1 : theme.bg5)};
  transition: border-color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')},
    color 500ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  background-color: ${({ theme }) => theme.bg1};
`

const InputContainer = styled.div`
  flex: 1;
  padding: 1rem;
`

const Input = styled.input<{ error?: boolean }>`
  font-size: 1.25rem;
  outline: none;
  border: none;
  flex: 1 1 auto;
  width: 0;
  background-color: ${({ theme }) => theme.bg1};
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;
  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
  padding: 0px;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

export default function AddressInputPanel({
  id,
  value,
  onChange,
  placeholder,
  simple = false
}: {
  id?: string
  // the typed string value
  value: string
  // triggers whenever the typed value changes
  onChange: (value: string) => void
  placeholder?: string
  simple?:  boolean
}) {
  const { chainId } = useActiveWeb3React()
//  const theme = useContext(ThemeContext)

  const { address, loading, name } = useENS(value)
  const error = Boolean(value.length > 0 && !loading && !address)

  const handleInput = useCallback(
    event => {
      const input = event.target.value
      const withoutSpaces = input.replace(/\s+/g, '')
      onChange(withoutSpaces)
    },
    [onChange]
  )

  const placeHolder = placeholder ?? (feswType(chainId) === "FESW" ? "Wallet Address or ENS name" : "Wallet Address")

  return (
    <InputPanel id={id} style={{borderRadius: simple ? '6px': '8px'}}>
      <ContainerRow error={error} style={{borderRadius: simple ? '6px': '8px'}}>
        <InputContainer style={{padding: simple ? '0.4rem 1rem': '1em'}}>
          <AutoColumn gap="md">
            {!simple && (
              <RowBetween>
                {address && chainId && (
                  <ExternalLink href={getExplorerLink(chainId, name ?? address, 'address')} style={{ fontSize: '15px' }}>
                    (View on Explorer)
                  </ExternalLink>
                )}
              </RowBetween>
            )}
            <Input
              className="recipient-address-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder={placeHolder}
              error={error}
              pattern="^(0x[a-fA-F0-9]{40})$"
              onChange={handleInput}
              value={value}
              style= {{fontSize: simple ? '0.9rem': '1.25rem'}}
            />
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}

export function MessageInputPanel({
  id,
  value,
  onUserInput,
  placeholder,
}: {
  id?: string
  value: string
  // triggers whenever the typed value changes
  onUserInput: (value: string) => void
  placeholder?: string
}) {
  return (
    <InputPanel id={id} style={{borderRadius: '6px'}}>
      <ContainerRow error={false} style={{borderRadius: '6px'}}>
        <InputContainer style={{padding: '0.4rem 1rem'}}>
          <AutoColumn gap="md">
            <Input
              className="recipient-address-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              maxLength={50}
              spellCheck="false"
              placeholder={placeholder}
              onChange={(event)=> onUserInput(event.target.value)}
              value={value}
              style= {{fontSize: '0.9rem'}}
            />
          </AutoColumn>            
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}


