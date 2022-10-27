import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
//import AddressClaimModal from '../components/claim/AddressClaimModal'
import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import SideNav from '../components/SideNav'
import Web3ReactManager from '../components/Web3ReactManager'
//import { ApplicationModal } from '../state/application/actions'
//import { useModalOpen, useToggleModal } from '../state/application/hooks'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
} from './AddLiquidity/redirects'
import Earn from './Earn'
import Manage from './Earn/Manage'
import Pool from './Pool'
//import PoolFinder from './PoolFinder'
import Overview from './Overview'
import Test from './Test'

import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import Nft from './Nft'
import Issuance from './Issuance'
import Retirement from './Retirement'
import Liquidize from './Liquidize'
import RECManager from './RECManager'
import MintCertificate from './Certificate'
import Offset from './Offset'

import CreateProposal from './CreateProposal'
import {RedirectNftCheckSingleId, RedirectNftCheckTwoIds} from './Nft/redirects'
import CreatePairByNft from './CreatePair'
import Sponsor from './Sponsor'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
//import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'

import Vote from './Vote'
import VotePage from './Vote/VotePage'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr
  @media screen and (max-width: 1080px) {
    grid-template-columns: 1fr;
    max-width: 100vw;
    overflow: hidden;
    grid-gap: 0;
  }
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 80px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`
/*
function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  return <AddressClaimModal isOpen={open} onDismiss={toggle} />
}
<TopLevelModals />
<Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
*/

// <Route exact strict path="/sponsor" component={Sponsor} />

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <ContentWrapper>
      <SideNav />
      <AppWrapper>
        <URLWarning />
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
        <BodyWrapper>
          <Popups />
          <Polling />
          <Web3ReactManager>
            <Switch>
              <Route exact path="/" component={Overview} />              
              <Route exact strict path="/Overview" component={Overview} />              
              <Route exact strict path="/swap" component={Swap} />
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route exact strict path="/Issuance" component={Issuance} />
              <Route exact strict path="/Liquidize" component={Liquidize} />
              <Route exact strict path="/Retirement" component={Retirement} />   
              <Route exact strict path="/RECManager" component={RECManager} />  
              <Route exact strict path="/Offset" component={Offset} />  
              <Route exact strict path="/mintCert" component={MintCertificate} />  
              <Route exact strict path="/sponsor" component={Sponsor} />              
              <Route exact strict path="/Test" component={Test} />              
              <Route exact strict path="/liquidity" component={Pool} />
              <Route exact strict path="/fesw" component={Earn} />
              <Route exact strict path="/vote" component={Vote} />
              <Route exact strict path="/create" component={CreatePairByNft} />
              <Route exact path="/add" component={AddLiquidity} />
              <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
              <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route exact strict path="/fesw/:currencyIdA/:currencyIdB" component={Manage} />
              <Route exact strict path="/vote/:id" component={VotePage} />
              <Route exact path="/nft" component={Nft} />
              <Route exact path="/nft/:currencyIdA" component={RedirectNftCheckSingleId} />
              <Route exact path="/nft/:currencyIdA/:currencyIdB" component={RedirectNftCheckTwoIds} />
              <Route exact strict path="/create-proposal" component={CreateProposal} />
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </Web3ReactManager>
          <Marginer />
        </BodyWrapper>
      </AppWrapper>
      </ContentWrapper>
    </Suspense>
  )
}
