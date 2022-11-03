import { useActiveWeb3React } from '../../hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { ChainId, Token } from '@feswap/sdk'
import { useTransactionAdder } from '../transactions/hooks'
import { BigNumber } from 'ethers'
import { useSingleCallResult, useSingleContractMultipleData } from '../multicall/hooks'
import { ZERO_ADDRESS } from '../../constants'
import { useMemo } from 'react'
import {  } from '../../hooks/useContract'

import {  useRECIssuanceContract, useArkreenRetirementContract, useArkreenRECTokenContract,
          ARECTokenAddress, arkreenRetirementAddress, arkreenTokenAddress } from '../../hooks/useContract'
import { useGetARECConfirmCounter, useSetARECConfirmCounter } from '../user/hooks'


export interface RECRequest {
  issuer:       string
  startTime:    BigNumber;
  endTime:      BigNumber;
  amountREC:    BigNumber;
  cID:          string;
  region:       string;      
  url:          string;
  memo:         string;
} 

export interface SignatureToPay {
  token:      string
  value:      BigNumber;
  deadline:   BigNumber;  
  v:          BigNumber;
  r:          BigNumber;
  s:          BigNumber;              
}

export interface RECData {
  issuer:       string;
  serialNumber: string;
  minter:       string;
  startTime:    number;
  endTime:      number;
  amountREC:    BigNumber;
  status:       number;
  cID:          string;
  region:       string;
  url:          string;
  memo:         string;
}

export enum REC_STARUS {
  Pending,            // 0
  Rejected,           // 1
  Cancelled,          // 2
  Certified,          // 3
  Retired,            // 4
  Liquidized          // 5
}

export interface  OffsetAction {
  offsetEntity:   string;
  issuerREC:      string;                  
  amount:         BigNumber;
  tokenId:        BigNumber;                
  createdAt:      BigNumber;
  bClaimed:       boolean;
}

export const arkreenToken = new Token(ChainId.MATIC_TESTNET, arkreenTokenAddress, 18, 'AKRE', 'Arkreen DAO Token')

export function useRECIssuanceCallback(
  recRequest:     RECRequest,
  signatureToPay: SignatureToPay
): {
  recIssuanceCallback: () => Promise<string>
} {
  // get claim data for this account
  const { library, chainId, account } = useActiveWeb3React()
  const arkreenRECIssuanceContract = useRECIssuanceContract(true)  

  // used for popup summary
  const addTransaction = useTransactionAdder()

  const recIssuanceCallback = async function() {
//    if (!sponsorAmount || !account || !library || !chainId|| !sponsorContract ) return
  if ( !account || !library || !chainId || !arkreenRECIssuanceContract ) return

   return arkreenRECIssuanceContract.estimateGas['mintRECRequest'](recRequest, signatureToPay).then(estimatedGasLimit => {
      return arkreenRECIssuanceContract
        .mintRECRequest(recRequest, signatureToPay, {gasLimit: calculateGasMargin(estimatedGasLimit) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `mintRECRequest from ${recRequest?.issuer}`,
          })
          return response.hash
        })
    })
  }

  return { recIssuanceCallback }
}

// Get AREC retirment NFT number
export function useARECRetirmentTotalSupply(): number | undefined {
  const { account } = useActiveWeb3React()
  const arkreemRetirementContract = useArkreenRetirementContract(false)     
  const res = useSingleCallResult(arkreemRetirementContract, 'totalSupply')
  if (account && res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return undefined
}

// Get AREC retirment NFT number
export function useARECRetirmentTotalAmount(): BigNumber | undefined {
  const { account } = useActiveWeb3React()
  const arkreemRetirementContract = useArkreenRetirementContract(false)     
  const res = useSingleCallResult(arkreemRetirementContract, 'totalOffsetRetired')
  if (account && res.result && !res.loading) {
    return BigNumber.from(res.result[0])
  }
  return undefined
}


// Get AREC Nft count of the current user
export function useARECCount(address?: string): number | undefined {
  const { account } = useActiveWeb3React()
  const arkreenRECIssuanceContract = useRECIssuanceContract(false)    
  const res = useSingleCallResult(arkreenRECIssuanceContract, 'balanceOf', [address ?? account ?? ZERO_ADDRESS])
  if (account && res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return undefined
}

// Get AREC Nft total supply
export function useARECTotalSupply(): number | undefined {
  const { account } = useActiveWeb3React()
  const arkreenRECIssuanceContract = useRECIssuanceContract(false)    
  const res = useSingleCallResult(arkreenRECIssuanceContract, 'totalSupply', [])
  if (account && res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return undefined
}

// Get all AREC amount issued
export function useAllREAIssued(): BigNumber | undefined {
  const { account } = useActiveWeb3React()
  const arkreenRECIssuanceContract = useRECIssuanceContract(false)    
  const res = useSingleCallResult(arkreenRECIssuanceContract, 'allRECIssued')
  if (account && res.result && !res.loading) {
    return BigNumber.from(res.result[0])
  }
  return undefined
}

// Get all AREC amount Redeemed
export function useAllREARedeemed(): BigNumber | undefined {
  const { account } = useActiveWeb3React()
  const arkreenRECIssuanceContract = useRECIssuanceContract(false)    
  const res = useSingleCallResult(arkreenRECIssuanceContract, 'allRECRedeemed')
  if (account && res.result && !res.loading) {
    return BigNumber.from(res.result[0])
  }
  return undefined
}

// Get all AREC amount Liquidized
export function useAllREALiquidized(): BigNumber | undefined {
  const { account } = useActiveWeb3React()
  const arkreenRECIssuanceContract = useRECIssuanceContract(false)    
  const res = useSingleCallResult(arkreenRECIssuanceContract, 'allRECLiquidized')
  if (account && res.result && !res.loading) {
    return BigNumber.from(res.result[0])
  }
  return undefined
}

export function useAllActionIds(): BigNumber[] | undefined {
  const { account } = useActiveWeb3React()
  const arkreemRetirementContract = useArkreenRetirementContract(false)    

  const res = useSingleCallResult(arkreemRetirementContract, 'getUserEvents', [account ?? ZERO_ADDRESS])
  if (account && res.result && !res.loading) {
    return res.result[0]
  }
  return undefined
}

export function useGetUserARECList(): {
  numberOfARECNft:        number | undefined
  allARECInfo:            RECData[]
  allARECNftTokensID:     BigNumber[]
  totalRECAmountIssued:   BigNumber
  totalRECAmountPending:  BigNumber
} {
  const { account } = useActiveWeb3React()
  const arkreenRECIssuanceContract = useRECIssuanceContract(false)  
  const nftARECCount = useARECCount()
  
  // get all nft Token IDs
  const nftARECIndexes = []
  for (let i = 0; i < (nftARECCount ?? 0); i++) {
    nftARECIndexes.push([account??ZERO_ADDRESS, i])
  }
  const allARECNftTokensIDs = useSingleContractMultipleData(arkreenRECIssuanceContract, 'tokenOfOwnerByIndex', nftARECIndexes)

  // get all AREC nft Token Infos
  let allARECNftTokensIDList = []
  for (let i = 0; i < (allARECNftTokensIDs.length ?? 0); i++) {
    if(allARECNftTokensIDs[i]?.valid && !allARECNftTokensIDs[i]?.loading && !allARECNftTokensIDs[i]?.error)
      allARECNftTokensIDList.push([allARECNftTokensIDs[i].result?.[0]?? BigNumber.from(0)])
  }

  const allARECNftInfos = useSingleContractMultipleData(arkreenRECIssuanceContract, 'getRECData', allARECNftTokensIDList)

  let nftARECInfoList = []
  let allARECNftTokensID: BigNumber[] = []
  for (let i = 0; i < (allARECNftInfos.length ?? 0); i++) {
    if(allARECNftInfos[i]?.valid && !allARECNftInfos[i]?.loading && !allARECNftInfos[i]?.error) {
      nftARECInfoList.push(allARECNftInfos[i].result?.[0])
      allARECNftTokensID.push(allARECNftTokensIDs[i].result?.[0]?? BigNumber.from(0))
    }
  }

  let totalRECAmountIssued: BigNumber = BigNumber.from(0)
  let totalRECAmountPending: BigNumber = BigNumber.from(0)
  let cancelledAREC:number = 0
 
  for (let i = 0; i < (nftARECInfoList ? nftARECInfoList.length: 0); i++) {
    if((nftARECInfoList[i] as RECData)?.status === REC_STARUS.Cancelled) {
      cancelledAREC += 1
    } else if((nftARECInfoList[i] as RECData)?.status === REC_STARUS.Certified) {
      totalRECAmountIssued = totalRECAmountIssued.add((nftARECInfoList[i] as RECData)?.amountREC)
    } else {
      totalRECAmountPending = totalRECAmountPending.add((nftARECInfoList[i] as RECData)?.amountREC)
    }
  }

  return {  numberOfARECNft:      (nftARECCount !== undefined) ? nftARECCount- cancelledAREC: undefined,
            allARECInfo:          nftARECInfoList,
            allARECNftTokensID,
            totalRECAmountIssued,
            totalRECAmountPending,
  }
}

export function useGetPendingARECList(): {
  arecTotalSupply:        number | undefined
  numberOfARECNft:        number
  allARECInfo:            RECData[]
  allARECNftTokensID:     BigNumber[]
} {

  const arkreenRECIssuanceContract = useRECIssuanceContract(false)  
  const arecTotalSupply = useARECTotalSupply()
  const ARECConfirmedCount = useGetARECConfirmCounter()
  const setARECConfirmCounter = useSetARECConfirmCounter()

  // get all nft Token IDs
  const nftARECIndexes = []
  let allARECNftTokensID: BigNumber[] = []
  for (let i = ARECConfirmedCount; i < (arecTotalSupply ?? 0); i++) {
    nftARECIndexes.push([i+1])
    allARECNftTokensID.push(BigNumber.from(i+1))
  }

  console.log('arecTotalSupply, ARECConfirmedCount', arecTotalSupply, ARECConfirmedCount)

  const allARECNftInfos = useSingleContractMultipleData(arkreenRECIssuanceContract, 'getRECData', nftARECIndexes)

  let nftARECInfoList = []
  let pendingFound = false
  for (let i = 0; i < (nftARECIndexes.length ?? 0); i++) {
    if(allARECNftInfos[i]?.valid && !allARECNftInfos[i]?.loading) {
      nftARECInfoList.push(allARECNftInfos[i].result?.[0])

      if(!pendingFound){
        if((nftARECInfoList[i] as RECData)?.status === REC_STARUS.Certified) {
          setARECConfirmCounter(nftARECIndexes[i][0])

        } else if ( (nftARECInfoList[i] as RECData)?.status === REC_STARUS.Pending ||
                    (nftARECInfoList[i] as RECData)?.status === REC_STARUS.Rejected ) {
          pendingFound = true
        }
      }
    }
  }

  return {  arecTotalSupply,
            numberOfARECNft:      (arecTotalSupply? (arecTotalSupply - ARECConfirmedCount): 0),
            allARECInfo:          nftARECInfoList,
            allARECNftTokensID
  }
}

export function useGetActionList(): {
  allOffsetActionsID:     BigNumber[] | undefined
  allOffsetActions:       OffsetAction[]
  allUnclaimedActionsIDs: BigNumber[]
  totalUnclaimedAmount:   BigNumber
  allUnclaimedActions:    OffsetAction[]
  allClaimedActionsIDs:   BigNumber[]
  totalClaimedAmount:     BigNumber
} {

  const arkreemRetirementContract = useArkreenRetirementContract(false)  
  const allOffsetActionsID = useAllActionIds()

  let offsetActionsIDLIst: BigNumber[][] = []
  for (let i = 0; i < (allOffsetActionsID?.length ?? 0); i++) {
    offsetActionsIDLIst.push([allOffsetActionsID?.[i] ?? BigNumber.from(0)])
  }

  const allUserOffsetActions = useSingleContractMultipleData(arkreemRetirementContract, 'getOffsetActions', offsetActionsIDLIst)

  let allOffsetActions: OffsetAction[] = []
  for (let i = 0; i < (allUserOffsetActions?.length ?? 0); i++) {
    if(allUserOffsetActions[i]?.valid && !allUserOffsetActions[i]?.loading  && !allUserOffsetActions[i]?.error) {
      allOffsetActions.push(allUserOffsetActions[i].result?.[0])
    }
  }

  const { totalUnclaimedAmount, totalClaimedAmount, allUnclaimedActionsIDs, 
          allClaimedActionsIDs, allUnclaimedActions } = useMemo(()=> {
    let totalUnclaimedAmount: BigNumber = BigNumber.from(0)
    let totalClaimedAmount: BigNumber = BigNumber.from(0)
    let allUnclaimedActionsIDs: BigNumber[] = [] 
    let allClaimedActionsIDs: BigNumber[] = [] 
    let allUnclaimedActions: OffsetAction[] = []
  
    if( !(!allOffsetActionsID || !allOffsetActions || !offsetActionsIDLIst)) {
      for (let i = 0; i <allOffsetActions.length; i++) {
//      if(allOffsetActions[i] === undefined) break
        if((allOffsetActions[i] as OffsetAction).bClaimed === false) {
          allUnclaimedActionsIDs.push(offsetActionsIDLIst[i][0])
          totalUnclaimedAmount = totalUnclaimedAmount.add((allOffsetActions[i] as OffsetAction).amount)
          allUnclaimedActions.push(allOffsetActions[i])
        } else {
          allClaimedActionsIDs.push(offsetActionsIDLIst[i][0])
          totalClaimedAmount = totalClaimedAmount.add((allOffsetActions[i] as OffsetAction).amount)
        }
      }
    }
    return {  totalUnclaimedAmount, totalClaimedAmount, allUnclaimedActionsIDs, allClaimedActionsIDs,
               allUnclaimedActions }
    },[allOffsetActionsID, allOffsetActions, offsetActionsIDLIst])

  return {  allOffsetActionsID,
            allOffsetActions,
            allUnclaimedActionsIDs,
            totalUnclaimedAmount,
            allClaimedActionsIDs,
            totalClaimedAmount,
            allUnclaimedActions
        }
}

export function useGetARECTBalance():  BigNumber | undefined {
  const { account } = useActiveWeb3React()
  const ARECTokenContract = useArkreenRECTokenContract(false)  
  const res = useSingleCallResult(ARECTokenContract, 'balanceOf', [account??ZERO_ADDRESS])
  if (account && res.result && !res.loading) {
    return (res.result[0])
  }
  return undefined
}

export function useGetARECTotalOffset():  BigNumber | undefined {
  const { account } = useActiveWeb3React()
  const ARECTokenContract = useArkreenRECTokenContract(false)  
  const res = useSingleCallResult(ARECTokenContract, 'totalOffset')
  if (account && res.result && !res.loading) {
    return (res.result[0])
  }
  return undefined
}

export function useGetARECTotalSupply():  BigNumber | undefined {
  const { account } = useActiveWeb3React()
  const ARECTokenContract = useArkreenRECTokenContract(false)  
  const res = useSingleCallResult(ARECTokenContract, 'totalSupply')
  if (account && res.result && !res.loading) {
    return (res.result[0])
  }
  return undefined
}

export function useOverallARECInfo(): {
  AllARECCount:                 number | undefined
  AllRedeemedARECCount:         number | undefined
  AllLiquidizedARECCount:       number | undefined
  AllREAIssued:                 BigNumber | undefined
  AllREARedeemed:               BigNumber | undefined
  AllREALiquidized:             BigNumber | undefined
  allARECRetirmentTotalSupply:  number | undefined
  AllARECRetirmentTotalAmount:  BigNumber | undefined
  ARECTotalSupply:              BigNumber | undefined
  ARECTotalOffset:              BigNumber | undefined
} {
//  const { account } = useActiveWeb3React()
//  const arkreenRECIssuanceContract = useRECIssuanceContract(false)  
//  const  arkreenRetirementContract =  useArkreenRetirementContract(false)
  
  const AllARECCount = useARECTotalSupply()
  const AllRedeemedARECCount = useARECCount(arkreenRetirementAddress)
  const AllLiquidizedARECCount = useARECCount(ARECTokenAddress)

  const AllREAIssued = useAllREAIssued()
  const AllREARedeemed = useAllREARedeemed()
  const AllREALiquidized = useAllREALiquidized()

  const allARECRetirmentTotalSupply = useARECRetirmentTotalSupply()
  const AllARECRetirmentTotalAmount = useARECRetirmentTotalAmount()

  const ARECTotalSupply =  useGetARECTotalSupply()
  const ARECTotalOffset =  useGetARECTotalOffset()

/*
  const arecTotalSupply = useARECTotalSupply()
  const ARECConfirmedCount = useGetARECConfirmCounter()
  const setARECConfirmCounter = useSetARECConfirmCounter()

  // get all nft Token IDs
  const nftARECIndexes = []
  let allARECNftTokensID: BigNumber[] = []
  for (let i = ARECConfirmedCount; i < (arecTotalSupply ?? 0); i++) {
    nftARECIndexes.push([i+1])
    allARECNftTokensID.push(BigNumber.from(i+1))
  }

  const allARECNftInfos = useSingleContractMultipleData(arkreenRECIssuanceContract, 'getRECData', nftARECIndexes)

  let nftARECInfoList = []
  let pendingFound = false
  for (let i = 0; i < (nftARECIndexes.length ?? 0); i++) {
    if(allARECNftInfos[i]?.valid && !allARECNftInfos[i]?.loading) {
      nftARECInfoList.push(allARECNftInfos[i].result?.[0])

      if(!pendingFound){
        if((nftARECInfoList[i] as RECData)?.status === REC_STARUS.Certified) {
          setARECConfirmCounter(nftARECIndexes[i][0])

        } else if ( (nftARECInfoList[i] as RECData)?.status === REC_STARUS.Pending ||
                    (nftARECInfoList[i] as RECData)?.status === REC_STARUS.Rejected ) {
          pendingFound = true
        }
      }
    }
  }
  
  // get all nft Token IDs
  const nftARECIndexes = []
  for (let i = 0; i < (nftARECCount ?? 0); i++) {
    nftARECIndexes.push([account??ZERO_ADDRESS, i])
  }
  const allARECNftTokensIDs = useSingleContractMultipleData(arkreenRECIssuanceContract, 'tokenOfOwnerByIndex', nftARECIndexes)

  // get all AREC nft Token Infos
  let allARECNftTokensIDList = []
  for (let i = 0; i < (allARECNftTokensIDs.length ?? 0); i++) {
    if(allARECNftTokensIDs[i]?.valid && !allARECNftTokensIDs[i]?.loading && !allARECNftTokensIDs[i]?.error)
      allARECNftTokensIDList.push([allARECNftTokensIDs[i].result?.[0]?? BigNumber.from(0)])
  }

  const allARECNftInfos = useSingleContractMultipleData(arkreenRECIssuanceContract, 'getRECData', allARECNftTokensIDList)

  let nftARECInfoList = []
  let allARECNftTokensID: BigNumber[] = []
  for (let i = 0; i < (allARECNftInfos.length ?? 0); i++) {
    if(allARECNftInfos[i]?.valid && !allARECNftInfos[i]?.loading && !allARECNftInfos[i]?.error) {
      nftARECInfoList.push(allARECNftInfos[i].result?.[0])
      allARECNftTokensID.push(allARECNftTokensIDs[i].result?.[0]?? BigNumber.from(0))
    }
  }

  let totalRECAmountIssued: BigNumber = BigNumber.from(0)
  let totalRECAmountPending: BigNumber = BigNumber.from(0)
  let cancelledAREC:number = 0
 
  for (let i = 0; i < (nftARECInfoList ? nftARECInfoList.length: 0); i++) {
    if((nftARECInfoList[i] as RECData)?.status === REC_STARUS.Cancelled) {
      cancelledAREC += 1
    } else if((nftARECInfoList[i] as RECData)?.status === REC_STARUS.Certified) {
      totalRECAmountIssued = totalRECAmountIssued.add((nftARECInfoList[i] as RECData)?.amountREC)
    } else {
      totalRECAmountPending = totalRECAmountPending.add((nftARECInfoList[i] as RECData)?.amountREC)
    }
  }
  return {  numberOfARECNft:      (nftARECCount !== undefined) ? nftARECCount- cancelledAREC: undefined,
            allARECInfo:          nftARECInfoList,
            allARECNftTokensID,
            totalRECAmountIssued,
            totalRECAmountPending,
  }
*/
  return {
        AllARECCount,
        AllRedeemedARECCount,
        AllLiquidizedARECCount,
        AllREAIssued,
        AllREARedeemed,
        AllREALiquidized,     
        allARECRetirmentTotalSupply,
        AllARECRetirmentTotalAmount,
        ARECTotalSupply,
        ARECTotalOffset
    }

}
