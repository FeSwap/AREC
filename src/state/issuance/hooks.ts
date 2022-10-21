import { useActiveWeb3React } from '../../hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../transactions/hooks'
import { BigNumber } from 'ethers'

import { useRECIssuanceContract } from '../../hooks/useContract'

//export const arkreenTokenAddress    = "0x54e1c534f59343c56549c76d1bdccc8717129832"
//export const arkreenIssuanceAddress = "0x95f56340889642a41b913c32d160d2863536e073"

interface RECRequest {
  issuer:       string
  startTime:    BigNumber;
  endTime:      BigNumber;
  amountREC:    BigNumber;
  cID:          string;
  region:       string;      
  url:          string;
  memo:         string;
} 

interface SignatureToPay {
  token:      string
  value:      BigNumber;
  deadline:   BigNumber;  
  v:          BigNumber;
  r:          BigNumber;
  s:          BigNumber;              
}

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


