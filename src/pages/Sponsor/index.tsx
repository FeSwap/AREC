import { Currency, CurrencyAmount, JSBI, Token, Trade, ETHER } from '@uniswap/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import ConfirmSponsorModal from '../../components/Sponsor/ConfirmSponsorModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import SponsorWarningModal from '../../components/Sponsor'
import ProgressSteps from '../../components/ProgressSteps'
import PageHeader from '../../components/PageHeader'

import { BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE, FESW } from '../../constants'
import { getTradeVersion } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  SponsorTrade,
  useDerivedSponsorInfo,
  useSponsorActionHandlers,
  useSponsorState
} from '../../state/sponsor/hooks'
import { useExpertModeManager, useUserSlippageTolerance, useUserSingleHopOnly } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { ClickableText } from '../Pool/styleds'
import Loader from '../../components/Loader'
import { Contract, BigNumber, constants, utils, providers, ContractFactory } from 'ethers'
import { ethers } from "ethers";
import FeswapByteCode from '../../constants/abis/Fesw.json'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useSponsorContract, useFeswContract } from '../../hooks/useContract'
import { TransactionResponse } from '@ethersproject/providers'
import { isAddress, calculateGasMargin } from '../../utils'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'

export default function Sponsor() {
  const theme = useContext(ThemeContext)
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const sponsorContract = useSponsorContract()

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]:  ETHER,
    [Field.OUTPUT]: chainId ? FESW[chainId] : undefined
  }

  const [showSponsorWarning, clearShowSponsorWarning] = useState<boolean>(true)
  
  const [willSponsor, setWillSponsor] = useState<boolean>(false)
  const handleWillSponsor = useCallback((yesOrNo: boolean) => {
    setWillSponsor(yesOrNo)
    clearShowSponsorWarning(false)
  }, [setWillSponsor, clearShowSponsorWarning])

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()
  const [isExpertMode] = useExpertModeManager()

  // swap state
  const { independentField, typedValue, recipient } = useSponsorState() 

  const {
    currencyBalances,
    parsedAmounts,
    feswGiveRate,
    inputError: SponsorInputError
  } = useDerivedSponsorInfo()

  const sponsor: SponsorTrade = {parsedAmounts, feswGiveRate}
  
  const { address: recipientAddress } = useENSAddress(recipient)

  const { onUserInput, onChangeRecipient } = useSponsorActionHandlers()
  const isValid = !SponsorInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  // modal and loading
  const [{ showConfirm, sponsorToConfirm, spnosorErrorMessage, attemptingTxn, txHash }, setSponsorState] = useState<{
    showConfirm: boolean
    sponsorToConfirm: SponsorTrade | undefined
    attemptingTxn: boolean
    spnosorErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    sponsorToConfirm: undefined,
    attemptingTxn: false,
    spnosorErrorMessage: undefined,
    txHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  async function handleSponsor(){
    const sponsorAmount = parsedAmounts[Field.INPUT]
  
    if (!sponsorAmount || !account || !library || !chainId|| !sponsorContract ) return
  
    setSponsorState({ attemptingTxn: true, sponsorToConfirm, showConfirm, spnosorErrorMessage: undefined, txHash: undefined })
    sponsorContract.estimateGas['Sponsor'](account, {value: sponsorAmount.raw})
      .then(estimatedGasLimit => {
        sponsorContract.Sponsor(account, { value: sponsorAmount.raw, gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Sponsored ${sponsorAmount?.toSignificant(6)} ETH`,
          })
          setSponsorState({ attemptingTxn: false, sponsorToConfirm, showConfirm, spnosorErrorMessage: undefined, txHash: response.hash })
        })
      })
      .catch(error => {
        setSponsorState({attemptingTxn: false, sponsorToConfirm, showConfirm, spnosorErrorMessage: error.message, txHash: undefined })
      })
  }
  
  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const handleConfirmDismiss = useCallback(() => {
    setSponsorState({ showConfirm: false, sponsorToConfirm, attemptingTxn, spnosorErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, spnosorErrorMessage, sponsorToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSponsorState({ sponsorToConfirm: sponsor, spnosorErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, spnosorErrorMessage, sponsor, txHash])

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])


  return (
    <>
      <SponsorWarningModal
        isOpen={showSponsorWarning}
        onConfirm={handleWillSponsor}
      />
      <AppBody>
        <PageHeader header="Sponsor" />
        <Wrapper id="swap-page">
          <ConfirmSponsorModal
            isOpen={showConfirm}
            sponsor={sponsor}
            originalSponsor={sponsorToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            onConfirm={handleSponsor}
            swapErrorMessage={spnosorErrorMessage}
            onDismiss={handleConfirmDismiss}
          />
          <AutoColumn gap={'md'}>
            <CurrencyInputPanel
              label={independentField === Field.OUTPUT && feswGiveRate ? 'Need to sponsor' : 'Will sponsor'}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              disableCurrencySelect = {true}
              id="sponsor-currency-input"
              customBalanceText = 'Balance: '
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable={false}>
                  <ArrowDown
                    size="16"
                    color={theme.primary1}
                  />
                </ArrowWrapper>
                {recipient === null && isExpertMode ? (
                  <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </LinkStyledButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && feswGiveRate ? 'GET (estimated)' : 'Apply'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              disableCurrencySelect = {true}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />

            {recipient !== null && (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.primary1} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            )}
            {
              <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                <AutoColumn gap="4px">
                  {Boolean(feswGiveRate) && (
                    <RowBetween align="center">
                      <Text fontWeight={500} fontSize={14} color={theme.text2}>
                        Price
                      </Text>
                      <TradePrice
                        price={feswGiveRate}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </RowBetween>
                  )}
                </AutoColumn>
              </Card>
            }
          </AutoColumn>
          <BottomGrouping>
            {!account ? (
              <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            ) : (
              <AutoColumn gap="8px">
              <ButtonError
                onClick={() => {
                  if (isExpertMode) {
                    handleSponsor()
                  } else {
                    setSponsorState({
                      sponsorToConfirm: sponsor,
                      attemptingTxn: false,
                      spnosorErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                id="swap-button"
                disabled={!isValid || (!isExpertMode)}
                error={isValid}
              >
                <Text fontSize={20} fontWeight={500}>
                  {SponsorInputError
                    ? SponsorInputError
                    : `Sponosor`}
                </Text>
              </ButtonError>
              </AutoColumn>              
            )}
            {spnosorErrorMessage ? <SwapCallbackError error={spnosorErrorMessage} /> : null}
           </BottomGrouping>
        </Wrapper>
      </AppBody>
    </>
  )
}

//      <AdvancedSwapDetailsDropdown trade={feswGiveRate} />
