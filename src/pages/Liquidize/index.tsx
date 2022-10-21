import React from 'react'
//import React, { useState } from 'react'

//import { Box } from 'rebass'
import styled from 'styled-components'

//import { AutoRow } from '../../components/Row'
//import { AutoRow, RowBetween } from '../../components/Row'

import { RowBetween, Divider, Gap } from '../../components/Row'
import { AutoColumn } from '../../components/Column'
//import {DataCard} from '../../components/earn/styled'
import PageHeader from '../../components/PageHeader'
import { CardNoise } from '../../components/earn/styled'

//import PairList from '../../components/PairList'
//import TopTokenList from '../../components/TokenList'
//import TxnList from '../../components/TxnList'
//import GlobalChart from '../../components/GlobalChart'
//import Search from '../../components/Search'
//import GlobalStats from '../../components/GlobalStats'

//import { useGlobalData, useGlobalTransactions } from '../../contexts/GlobalData'
//import { useAllPairData } from '../../contexts/PairData'
//import { useMedia } from 'react-use'
//import Panel from '../../components/Panel'
//import { useAllTokenData } from '../../contexts/TokenData'
//import { formattedNum, formattedPercent } from '../../utils'
import { TYPE } from '../../theme'
//import AppBody from '../AppBody'
// import { TYPE, ThemedBackground } from '../../Theme'

import { transparentize } from 'polished'
//import { CustomLink } from '../../components/Link'

//import { PageWrapper, ContentWrapper } from '../../components'

//import CheckBox from '../../components/Checkbox'
//import QuestionHelper from '../../components/QuestionHelper'

/*
export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 0px;
  padding-bottom: 80px;

  @media screen and (max-width: 600px) {
    & > * {
      padding: 0 12px;
    }
  }
`
*/

/*
const PageWrapper = styled(AutoColumn)`
  max-width: 1080px;
  width: 100%;
`
*/


const DataRow = styled(RowBetween)`
  justify-content: start;
  overflow: hidden;
  border-radius: 12px;
  display: flex;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

export const ContentWrapper = styled.div`
  display: grid;
  justify-content: start;
  align-items: start;
  grid-template-columns: 1fr;
  grid-gap: 24px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  box-sizing: border-box;
  @media screen and (max-width: 1180px) {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
`

//background: radial-gradient(76.02% 75.41% at 40% 0%, #FFB6C1 30%, #E6E6FA 100%);

const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  border-radius: 10px;
  width: 100%;
  position: relative;
  overflow: hidden;
`

//background: radial-gradient(76.02% 75.41% at 40% 0%, #FFB6C1 30%, #E6E6FA 100%);

const PoolData = styled(DataCard)`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 12px;
  background: rgba(0,100,30,0.3);
  z-index: 1;
`

//max-width: 300px;

interface InfoDataProps {
  tag: string
  info: string
}

function InfoData({tag, info}: InfoDataProps) {
  return (
    <PoolData>
      <AutoColumn gap="sm">
        <TYPE.mediumHeader style={{ margin: 0, whiteSpace: 'nowrap' }}>{tag} </TYPE.mediumHeader>
        <TYPE.body fontSize={22} fontWeight={300} style={{ textAlign: 'center' }}>
          {info} 
        </TYPE.body>
      </AutoColumn>
    </PoolData>  
  )
}


/*
const ListOptions = styled(AutoRow)`
  height: 40px;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-width: 640px) {
    font-size: 1rem;
  }
`

const GridRow = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
  align-items: start;
  justify-content: space-between;
`
*/

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 1080px;
  width: 100%;
  background:  radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.3, 'pink')} 0%, ${'#E6E6FA'} 100%);
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04)
  0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 16px;
  padding: 0rem;
`

//background: radial-gradient(76.02% 75.41% at 40% 0%, #FFB6C1 30%, #E6E6FA 100%);
/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export function AppBody({ children, ...rest }: { children: React.ReactNode }) {
  return <BodyWrapper {...rest}>{children}</BodyWrapper>
}

export default function Liquidize() {
  // get data for lists and totals
//  const allPairs = useAllPairData()
//  const allTokens = useAllTokenData()
//  const transactions = useGlobalTransactions()
//  const { totalLiquidityUSD, oneDayVolumeUSD, volumeChangeUSD, liquidityChangeUSD } = useGlobalData()

  // breakpoints
//  const below800 = useMedia('(max-width: 800px)')


  // for tracked data on pairs
//  const [useTracked, setUseTracked] = useState(true)

  return (
    <>
      <AppBody>
        <PageHeader header="AREC Liquidize" />      
        <DataRow style={{ gap: '10px', padding: '1rem' }}>
          <InfoData tag={'Total AREC NFTs:'} info={'10 NFTs'}/>
          <InfoData tag={'Total AREC Power:'} info={'10000 MWH'}/>
          <InfoData tag={'Total AREC Holders:'} info={'1000'}/>
        </DataRow> 
        <Divider />
        <DataRow style={{ gap: '10px', padding: '1rem' }}>  
          <InfoData tag={'AKRE Max Supply:'} info={'10,000,000,000 AKRE'}/>  
          <InfoData tag={'AKRE Circulating Supply:'} info={'100,000 AKRE'}/>              
          <InfoData tag={'Total AKRE Hoders:'} info={'90,000'}/>
        </DataRow> 
        <CardNoise />
      </AppBody>
      <Gap />
      <AppBody>
        <PageHeader header="My Profile" />      
        <DataRow style={{ gap: '10px', padding: '1rem' }}>
          <InfoData tag={'My AKRE'} info={'20,000 ARKE'}/>
          <InfoData tag={'My AREC NFTs:'} info={'10 NFTs'}/>
          <InfoData tag={'My AREC Power:'} info={'10000 MWH'}/>
        </DataRow> 
        <Divider />
        <DataRow style={{ gap: '10px', padding: '1rem' }}>  
          <InfoData tag={'AREC Redeemed:'} info={'1,000 KWH'}/>  
          <InfoData tag={'AREC Offset:'} info={'20,000 KWH'}/>              
          <InfoData tag={'Total AREC retired:'} info={'50,000 KWH'}/>
        </DataRow> 
        <CardNoise />
      </AppBody>

    </>
  )
}

//<Search />
//<GlobalStats />

/*
{below800 && ( // mobile card
            <Box mb={20}>
              <Panel>
                <Box>
                  <AutoColumn gap="36px">
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Volume (24hrs)</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {oneDayVolumeUSD ? formattedNum(oneDayVolumeUSD, true) : '-'}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>{volumeChangeUSD ? formattedPercent(volumeChangeUSD) : '-'}</TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                    <AutoColumn gap="20px">
                      <RowBetween>
                        <TYPE.main>Total Liquidity</TYPE.main>
                        <div />
                      </RowBetween>
                      <RowBetween align="flex-end">
                        <TYPE.main fontSize={'1.5rem'} lineHeight={1} fontWeight={600}>
                          {totalLiquidityUSD ? formattedNum(totalLiquidityUSD, true) : '-'}
                        </TYPE.main>
                        <TYPE.main fontSize={12}>
                          {liquidityChangeUSD ? formattedPercent(liquidityChangeUSD) : '-'}
                        </TYPE.main>
                      </RowBetween>
                    </AutoColumn>
                  </AutoColumn>
                </Box>
              </Panel>
            </Box>
          )}
          {!below800 && (
            <GridRow>
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart display="liquidity" />
              </Panel>
              <Panel style={{ height: '100%' }}>
                <GlobalChart display="volume" />
              </Panel>
            </GridRow>
          )}
          {below800 && (
            <AutoColumn style={{ marginTop: '6px' }} gap="24px">
              <Panel style={{ height: '100%', minHeight: '300px' }}>
                <GlobalChart display="liquidity" />
              </Panel>
            </AutoColumn>
          )}
          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1.125rem'} style={{ whiteSpace: 'nowrap' }}>
                Top Tokens
              </TYPE.main>
              <CustomLink to={'/tokens'}>See All</CustomLink>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <TopTokenList tokens={allTokens} />
          </Panel>
          <ListOptions gap="10px" style={{ marginTop: '2rem', marginBottom: '.5rem' }}>
            <RowBetween>
              <TYPE.main fontSize={'1rem'} style={{ whiteSpace: 'nowrap' }}>
                Top Pairs
              </TYPE.main>
              <AutoRow gap="4px" width="100%" justifyContent="flex-end">
                <CheckBox
                  checked={useTracked}
                  setChecked={() => setUseTracked(!useTracked)}
                  text={'Hide untracked pairs'}
                />
                <QuestionHelper text="USD amounts may be inaccurate in low liquidity pairs or pairs without ETH or stablecoins." />
                <CustomLink to={'/pairs'}>See All</CustomLink>
              </AutoRow>
            </RowBetween>
          </ListOptions>
          <Panel style={{ marginTop: '6px', padding: '1.125rem 0 ' }}>
            <PairList pairs={allPairs} useTracked={useTracked} />
          </Panel>
          <span>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '2rem' }}>
              Transactions
            </TYPE.main>
          </span>
          <Panel style={{ margin: '1rem 0' }}>
            <TxnList transactions={transactions} />
          </Panel>
        </div>
*/