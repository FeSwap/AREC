import { ChainId, JSBI, Percent, Token, WETH } from '@feswap/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { fortmatic, injected, portis, walletconnect, walletlink } from '../connectors'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const FAKE_ADDRESS = '0xAffE3b84ed74870935B7dE70f057ac583c76CD88'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT:  { [chainId: number]: Token }  = {
      [ChainId.MAINNET]:  new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
      [ChainId.ROPSTEN]:  new Token(ChainId.ROPSTEN, '0x110a13FC3efE6A245B50102D2d79B3E76125Ae83', 6, 'USDT', 'Tether USD'),
      [ChainId.RINKEBY]:  new Token(ChainId.RINKEBY, '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02', 6, 'USDT', 'Tether USD'),
      [ChainId.GÖRLI]:  new Token(ChainId.GÖRLI, '0xC73253A937F829aF45f86abC0a5C540373645f88', 6, 'USDT', 'Tether USD'),
      [ChainId.KOVAN]:  new Token(ChainId.KOVAN, '0x07de306FF27a2B630B1141956844eB1552B956B5', 6, 'USDT', 'Tether USD')   
    }
export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const WBTC :{ [chainId: number]: Token }  = {
      [ChainId.MAINNET]:  new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
      [ChainId.RINKEBY]:  new Token(ChainId.RINKEBY, '0x577D296678535e4903D59A4C929B718e1D575e0A', 8, 'WBTC', 'Wrapped BTC')      
  }

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const GOVERNANCE_ADDRESS = '0x433adCE1695eBb2554232d32493C7498E1605DaD'
export const TIMELOCK_ADDRESS   = '0x0F0C989960299460C461c9fC907e1D6195769B2d'
//export const SPONSOR_ADDRESS  = '0x9b185eCEbff41B991FdA0A268fEc31454779d276'             // Test for dev on Goerli
export const SPONSOR_ADDRESS    = '0xB7196A981De991cdCAEe06Eb7c39c84B5277d234'              // On test Chain

//export const NFT_BID_ADDRESS  = '0xbc288BF91880bb849F004A1Dc4d783a435040d08'
//export const NFT_BID_ADDRESS  = '0xef7cf61dad6a2cf7b402482ef574b5dd20ef2b5b'
//export const NFT_BID_ADDRESS  = '0xC72B4Da86643CcFF189AA7255DF320EdB0E187B0'
//export const NFT_BID_ADDRESS  = '0xa1fbe179e8791ab4fc0060b2b881577e68dcd6dd'            // Goerli
//export const NFT_BID_ADDRESS  = '0x9bb53A4d89768fb9277eE83016F08Eff21DDd576'            // Rinkeby
export const NFT_BID_ADDRESS    = '0x06C2De45973Df34DaB22AD0b767d2bE3eca5D178'            // on test Chain

//export const FESW_FACTORY_ADDRESS   = '0xC72B4Da86643CcFF189AA7255DF320EdB0E187B0'       // Rinkeby
export const FESW_FACTORY_ADDRESS     = '0x75f7b730c51610aba6f3d89deb4864f156c8e747'         // on test Chain

//export const FESW_ROUTER_ADDRESS  = '0x09179ceebad6b676F6E6B0474907335be3E30D89'       // Rinkeby (2021/06/14)
//export const FESW_ROUTER_ADDRESS  = '0x6E923637948657BB1b5610C81b9C6a44bBa63297'       // Rinkeby (2021/06/26)
//export const FESW_ROUTER_ADDRESS  = '0x34D3fB8402c2c666bEcC16363520dC28F810e4FF'       // Rinkeby (2021/06/27)
export const FESW_ROUTER_ADDRESS    = '0x657db4e8c4258570cc7dd61031777901439e8079'       // on test Chain

//const FESW_ADDRESS = '0xCdd5905389a765C66605CA705414f672a2055b19'                     // Test for dev
//const FESW_TEST_ADDRESS = '0xCdd5905389a765C66605CA705414f672a2055b19'                // Test for dev

const FESW_ADDRESS      = '0xcfcC81C508a8025879a27257cC0f699F9f2016AB'
const FESW_TEST_ADDRESS = '0xcfcC81C508a8025879a27257cC0f699F9f2016AB'

export const FESW: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, FESW_ADDRESS, 18, 'FESW', 'FeSwap DAO'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, FESW_TEST_ADDRESS, 18, 'FESW', 'FeSwap DAO'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, FESW_TEST_ADDRESS, 18, 'FESW', 'FeSwap DAO'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, FESW_TEST_ADDRESS, 18, 'FESW', 'FeSwap DAO'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, FESW_TEST_ADDRESS, 18, 'FESW', 'FeSwap DAO')
}

export const COMMON_CONTRACT_NAMES: { [address: string]: string } = {
//  [FESW_ADDRESS]: 'FESW',
  [GOVERNANCE_ADDRESS]: 'Governance',
  [TIMELOCK_ADDRESS]: 'Timelock'
}

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e'
}

export const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
  [ChainId.KOVAN]: [WETH[ChainId.KOVAN]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT[ChainId.MAINNET], COMP, MKR]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
  }
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT[ChainId.MAINNET]]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT[ChainId.MAINNET]]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
    ],
    [USDC, USDT[ChainId.MAINNET]],
    [DAI, USDT[ChainId.MAINNET]]
  ]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }
}

// href: 'https://go.cb-w.com/mtUDhEZPy1',

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)
export const BIG_INT_SECONDS_IN_DAY = JSBI.BigInt(60 * 60 * 24)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ZERO_PERCENT = new Percent(JSBI.BigInt(0), JSBI.BigInt(100))
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008'
]
