import React, { memo, useCallback, useRef } from 'react'
import styled from 'styled-components/macro'

const Input = styled.input<{ error?: boolean; fontSize?: string }>`
  font-size: ${({ fontSize }) => fontSize || '1.25rem'};
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

export const TextAreaInput = styled.textarea<{ error?: boolean; fontSize?: string; borderRadius?: string }>`
  font-size: ${({ fontSize }) => fontSize || '1.25rem'};
  outline: none;
  border: ${({ borderRadius}) => borderRadius ? '1px solid': 'none'};
  border-color: ${({ borderRadius, theme }) => borderRadius ? theme.bg5: 'none'};
  border-radius: ${({ borderRadius }) => borderRadius ? '6px': 'none'};
  flex: 1 1 auto;
  width: 0;
  resize: none;
  background-color: ${({ theme }) => theme.bg1};
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;
  line-height: 1.25rem;
  padding: ${({ borderRadius }) => borderRadius ? '0.4rem 1rem 0.4rem 1rem': '0px'};;
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

export const TextInput = ({
  className,
  value,
  onUserInput,
  placeholder,
  fontSize,
}: {
  className?: string
  value: string
  onUserInput: (value: string) => void
  placeholder: string
  fontSize: string
}) => {
  const handleInput = useCallback(
    (event) => {
      onUserInput(event.target.value)
    },
    [onUserInput]
  )

  return (
    <div className={className}>
      <Input
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder={placeholder || ''}
        onChange={handleInput}
        value={value}
        fontSize={fontSize}
      />
    </div>
  )
}

export const ResizingTextArea = memo(
  ({
    className,
    value,
    onUserInput,
    placeholder,
    fontSize,
    small = false,
    borderRadius
  }: {
    className?: string
    value: string
    onUserInput: (value: string) => void
    placeholder: string
    fontSize: string
    small?: boolean
    borderRadius?: string
  }) => {
    const inputRef = useRef<HTMLTextAreaElement>(document.createElement('textarea'))

    const handleInput = useCallback(
      (event) => {
        inputRef.current.style.height = 'auto'
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
        onUserInput(event.target.value)
      },
      [onUserInput]
    )

    return (
      <TextAreaInput
        style={{ height: 'auto', minHeight: small ? '6rem': '500px', maxHeight: small ? '10rem': 'none' }}
        className={className}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        borderRadius={borderRadius}
        placeholder={placeholder || ''}
        onChange={handleInput}
        value={value}
        fontSize={fontSize}
        ref={inputRef}
      />
    )
  }
)

ResizingTextArea.displayName = 'ResizingTextArea'
