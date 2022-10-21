import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'

import { Flex } from 'rebass'
// import Link from '../Link'
import { RowFixed } from '../Row'
import Logo from '../../assets/svg/logo.svg'

// import Wordmark from '../../assets/wordmark_white.svg'

import { BasicLink } from '../Link'
import { useMedia } from 'react-use'

const TitleWrapper = styled.div`
  text-decoration: none;
  z-index: 10;
  width: 100%;
  &:hover {
    cursor: pointer;
  }
`

/*
const UniIcon = styled(Link)`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`
*/

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  :hover {
    transform: rotate(-5deg);
  }
`

const Option = styled.div<{activeText?: boolean}>`
  font-weight: 500;
  font-size: 14px;
  opacity: ${({ activeText }) => (activeText ? 1 : 0.6)};
  color: ${({ theme }) => theme.text1};
  display: flex;
  margin-left: 12px;
  :hover {
    opacity: 1;
  }
`

export default function Title() {
  const history = useHistory()
  const below1080 = useMedia('(max-width: 1080px)')
  const theme = useContext(ThemeContext)


//  {!below1080 && (
//    <img width={'84px'} style={{ marginLeft: '8px', marginTop: '0px' }} src={Wordmark} alt="logo" />
//  )}

//color: ${({ theme }) => theme.text2};

  return (
    <TitleWrapper onClick={() => history.push('/')}>
      <Flex alignItems="center" style={{ justifyContent: 'space-between' }}>
        <RowFixed>
          <UniIcon id="link" onClick={() => history.push('/')}>
            <img width={'56px'} src={Logo} alt="logo" />
          </UniIcon>
          {!below1080 && (
            <TYPE.largeHeader color={theme.text1} style={{ fontSize: 28, marginLeft: '5px', marginTop: '0px', fontFamily: 'Georgia' }} > 
                Arkreen 
            </TYPE.largeHeader>
          )}
        </RowFixed>
        {below1080 && (
          <RowFixed color={'black'} style={{ alignItems: 'flex-end' }}>
            <BasicLink to="/home">
              <Option activeText={history.location.pathname === '/home' ?? undefined}>Overview</Option>
            </BasicLink>
            <BasicLink to="/tokens">
              <Option
                activeText={
                  (history.location.pathname.split('/')[1] === 'tokens' ||
                    history.location.pathname.split('/')[1] === 'token') ??
                  undefined
                }
              >
                Tokens
              </Option>
            </BasicLink>
            <BasicLink to="/pairs">
              <Option
                activeText={
                  (history.location.pathname.split('/')[1] === 'pairs' ||
                    history.location.pathname.split('/')[1] === 'pair') ??
                  undefined
                }
              >
                Pairs
              </Option>
            </BasicLink>

            <BasicLink to="/accounts">
              <Option
                activeText={
                  (history.location.pathname.split('/')[1] === 'accounts' ||
                    history.location.pathname.split('/')[1] === 'account') ??
                  undefined
                }
              >
                Accounts
              </Option>
            </BasicLink>
          </RowFixed>
        )}
      </Flex>
    </TitleWrapper>
  )
}
