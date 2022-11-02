import React from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import Title from '../Title'
import { BasicLink } from '../Link'
import { useMedia } from 'react-use'
import { transparentize } from 'polished'
import { withRouter } from 'react-router-dom'
import { TrendingUp, PieChart, CheckCircle, LogOut, Repeat, Award, Heart,
          MessageCircle, BookOpen, Link2, List } from 'react-feather'
// DollarSign, Link2, List
// import Link from '../Link'
//import { Link } from 'rebass'
import { TogglePic } from '../Toggle'
import { RouteComponentProps } from 'react-router-dom'
import { useDarkModeManager } from '../../state/user/hooks'
import { MenuItem } from '../../components/Menu/'
//import { Text } from 'rebass'

const Wrapper = styled.div<{isMobile?: boolean}>`
  height: ${({ isMobile }) => (isMobile ? 'initial' : '100vh')};
  background-color: ${({ theme }) => transparentize(0.4, theme.bg1)};
  color: ${({ theme }) => theme.text2};
  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
  position: sticky;
  top: 0px;
  z-index: 9999;
  box-sizing: border-box;
  background: rgba(0,192,239,0.5);
  color: ${({ theme }) => theme.bg2};

  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
    position: relative;
  }

  @media screen and (max-width: 600px) {
    padding: 1rem;
  }
`

// Good: background: linear-gradient( rgba(0,192,239,0.5), rgba(0,192,239,0.5));

//background: linear-gradient(193.68deg, #6000A0 0.68%, #300060 100.48%);
// background: linear-gradient( rgba(0,192,239,0.5), rgba(0,192,239,0.5));
//background: linear-gradient(193.68deg, #6000A0 0.68%, #300060 100.48%);
//linear-gradient(rgba(0,192,239,0.3), rgba(250,234,229,0.3));
//#rgba(250,234,229,0.3)

const Option = styled.div<{activeText?: boolean}>`
  font-weight: 500;
  font-size: 16px;
  opacity: ${({ activeText }) => (activeText ? 1 : 0.6)};
  color: ${({ theme }) => theme.text1};
  display: flex;
  :hover {
    opacity: 1;
  }
`

const DesktopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
`

const MobileWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

/*
const HeaderText = styled.div`
  margin-right: 0.5rem;
  font-size: 0.825rem;
  font-weight: 500;
  display: inline-box;
  display: -webkit-inline-box;
  opacity: 0.8;
  :hover {
    opacity: 1;
    cursor: pointer;
    text-decoration: none;
    underline: none;
  }
  a {
    color: ${({ theme }) => theme.text2};
  }
`
*/

/*
const Polling = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
  opacity: 0.4;
  transition: opacity 0.25s ease;
  :hover {
    opacity: 1;
  }
`
const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-right: 0.5rem;
  margin-top: 3px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`

*/

function SideNav({ history }: RouteComponentProps) {
  const below1080 = useMedia('(max-width: 1080px)')

//  const below1180 = useMedia('(max-width: 1180px)')

  const [isDark, toggleDarkMode] = useDarkModeManager()

  return (
    <Wrapper isMobile={below1080}>
      {!below1080 ? (
        <DesktopWrapper>
          <AutoColumn gap="1rem" style={{ marginLeft: '.75rem', marginTop: '1.5rem' }}>
            <Title />
            {!below1080 && (
              <AutoColumn gap="1.25rem" style={{ marginTop: '1rem' }}>
                <BasicLink to="/Overview">
                  <Option activeText={history.location.pathname === '/Overview' ?? undefined}>
                    <TrendingUp size={18} style={{ marginRight: '.75rem' }} />
                    Overview
                  </Option>
                </BasicLink>
                <BasicLink to="/Issuance">
                  <Option activeText={(history.location.pathname.split('/')[1] === 'Issuance') ?? undefined}>
                    <CheckCircle size={18} style={{ marginRight: '.75rem' }} />
                    Issue AREC
                  </Option>
                </BasicLink>

                <BasicLink to="/Redeem">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'Redeem') ?? undefined
                    }
                  >
                    <LogOut size={18} style={{ marginRight: '.75rem' }} />
                    Redeem
                  </Option>
                </BasicLink>

                <BasicLink to="/Liquidize">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'Liquidize') ?? undefined
                    }
                  >
                    <PieChart size={18} style={{ marginRight: '.75rem' }} />
                    Liquidize
                  </Option>
                </BasicLink>

                <BasicLink to="/Offset">
                  <Option activeText={(history.location.pathname.split('/')[1] === 'Offset') ?? undefined}>
                    <Heart size={18} style={{ marginRight: '.75rem' }} />
                    Offset
                  </Option>
                </BasicLink>

                <BasicLink to="/mintCert">
                  <Option activeText={(history.location.pathname.split('/')[1] === 'mintCert') ?? undefined}>
                    <Award size={18} style={{ marginRight: '.75rem' }} />
                    Mint Certificate
                  </Option>
                </BasicLink>                

                <BasicLink to="/swap">
                  <Option
                    activeText={
                      (history.location.pathname.split('/')[1] === 'accounts' ||
                        history.location.pathname.split('/')[1] === 'account') ??
                      undefined
                    }
                  >
                    <Repeat size={18} style={{ marginRight: '.75rem' }} />
                    Exchange
                  </Option>
                </BasicLink>

              </AutoColumn>
            )}
          </AutoColumn>
          <AutoColumn gap="0.5rem" style={{ marginLeft: '.75rem', marginBottom: '4rem' }}>
            <MenuItem id="link" href="https://wwww.arkreen.com" style={{padding:'0px'}}>
                <Link2 size={14} />
                <span style={{fontWeight:400, fontSize:'14px'}}> Arkreen </span>
            </MenuItem>
            <MenuItem id="link" href="https://explorer.arkreen.com/" style={{padding:'0px'}}>
                <List size={14} />
                <span style={{fontWeight:400, fontSize:'14px'}}> Explorer </span>
            </MenuItem>
            <MenuItem id="link" href="https://docs.arkreen.com" style={{padding:'0px'}}>
                <BookOpen size={14} />
                <span style={{fontWeight:400, fontSize:'14px'}}> Docs </span>
            </MenuItem>
            <MenuItem id="link" href="https://twitter.com/arkreen_network" style={{padding:'0px'}}>
                <MessageCircle size={14} />
                <span style={{fontWeight:400, fontSize:'14px'}}> Twitter </span>
            </MenuItem>
            <TogglePic isActive={isDark} toggle={toggleDarkMode} />
          </AutoColumn>
        </DesktopWrapper>
      ) : (
        <MobileWrapper>
          <Title />
        </MobileWrapper>
      )}
    </Wrapper>
  )
}

export default withRouter(SideNav)
