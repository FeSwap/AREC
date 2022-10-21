import React from 'react'
import styled from 'styled-components'
import { Sun, Moon } from 'react-feather'

const ToggleElement = styled.span<{ isActive?: boolean; isOnSwitch?: boolean }>`
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  background: ${({ theme, isActive, isOnSwitch }) => (isActive ? (isOnSwitch ? theme.primary1 : theme.text4) : 'none')};
  color: ${({ theme, isActive, isOnSwitch }) => (isActive ? (isOnSwitch ? theme.white : theme.text2) : theme.text2)};
  font-size: 1rem;
  font-weight: ${({ isOnSwitch }) => (isOnSwitch ? '500' : '400')};
  :hover {
    user-select: ${({ isOnSwitch }) => (isOnSwitch ? 'none' : 'initial')};
    background: ${({ theme, isActive, isOnSwitch }) =>
      isActive ? (isOnSwitch ? theme.primary1 : theme.text3) : 'none'};
    color: ${({ theme, isActive, isOnSwitch }) => (isActive ? (isOnSwitch ? theme.white : theme.text2) : theme.text3)};
  }
`

const StyledToggle = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.bg3};
  display: flex;
  width: fit-content;
  cursor: pointer;
  outline: none;
  padding: 0;
`

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: () => void
}

export default function Toggle({ id, isActive, toggle }: ToggleProps) {
  return (
    <StyledToggle id={id} isActive={isActive} onClick={toggle}>
      <ToggleElement isActive={isActive} isOnSwitch={true}>
        On
      </ToggleElement>
      <ToggleElement isActive={!isActive} isOnSwitch={false}>
        Off
      </ToggleElement>
    </StyledToggle>
  )
}

const IconWrapper = styled.div<{ isActive?: boolean }>`
  opacity: ${({ isActive }) => (isActive ? 0.8 : 0.4)};

  :hover {
    opacity: 1;
  }
`

const StyledTogglePic = styled.div`
  display: flex;
  width: fit-content;
  cursor: pointer;
  text-decoration: none;
  margin-top: 1rem;
  color: ${({ theme }) => theme.text2};
  :hover {
    text-decoration: none;
  }
`

export function TogglePic({id, isActive, toggle }: ToggleProps) {
  return (
    <StyledTogglePic id={id} onClick={toggle}>
      <span>
        <IconWrapper isActive={!isActive}>
          <Sun size={20} />
        </IconWrapper>
      </span>
      <span style={{ padding: '0 .5rem' }}>{' / '}</span>
      <span>
        <IconWrapper isActive={isActive}>
          <Moon size={20} />
        </IconWrapper>
      </span>
    </StyledTogglePic>
  )
}
