import React from 'react'
import { Text } from 'rebass'

import { ButtonError } from '../../components/Button'


import { RowBetween } from '../../components/Row'
import { BottomGrouping, Wrapper } from '../../components/swap/styleds'
import PageHeader from '../../components/PageHeader'
import {StyledPageCard} from '../../components/earn/styled'



import { useActiveWeb3React } from '../../hooks'
//import { useWalletModalToggle } from '../../state/application/hooks'


import AppBody from '../AppBody'
import QuestionHelper from '../../components/QuestionHelper'

export default function Liquidize() {
  const { chainId } = useActiveWeb3React()


  async function Test() {
    console.log("AAAAAAAAAAAAAAAAAA")
    const url = "https://api.arkreen.com/account/account/"
    const account = "0x364a71eE7a1C9EB295a4F4850971a1861E9d3c7D"

    const response = await fetch(url + account)

    const json = await response.json()
    console.log('Json data', json)
  }


  async function getData() {
    const url = new URL("https://api.arkreen.com/device/device/getMinersByOwnerAddress")
    const parameter = {
      "address":  "0x364a71eE7a1C9EB295a4F4850971a1861E9d3c7D",
      "offset":   "1",
      "limit":    "10",
    }
    const search = new URLSearchParams(parameter).toString();
    console.log("search", search, url+'?'+search)
 
    const response = await fetch(url+'?'+search)
    
    const json = await response.json()
    console.log('Json data', json)
  }

    // Example POST method implementation:
  //  async function postData(url = '', data = {}) {
  async function getMiners() {
      const url = "https://api.arkreen.com/device/device/getMinersByOwnerAddress"
      const parameter = {
        "address":  "0x364a71eE7a1C9EB295a4F4850971a1861E9d3c7D",
        "offset":   1,
        "limit":    25,
      }
  
      // Default options are marked with *
      const response = await fetch(url, {
        method: 'POST',                 // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parameter)      // body data type must match "Content-Type" header
      });
      console.log('response data', response)
      const json = await response.json()
      console.log('Json data', json)
    }


  // Example POST method implementation:
  //  async function postData(url = '', data = {}) {
  async function postData() {
    const url = "https://api.arkreen.com/account/accountreward/list"
    const parameter = {
      "address":  "0x364a71eE7a1C9EB295a4F4850971a1861E9d3c7D",
      "offset":   1,
      "limit":    25,
    }

    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST',                 // *GET, POST, PUT, DELETE, etc.
      mode: 'cors',                   // no-cors, *cors, same-origin
      cache: 'no-cache',              // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin',     // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',             // manual, *follow, error
      referrerPolicy: 'no-referrer',  // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(parameter)      // body data type must match "Content-Type" header
    });
    console.log('response data', response)
    const json = await response.json()
    console.log('Json data', json)
  }

  async function getJsonData() {
    postData()
  }


  return (
    <>
      <AppBody>
      <StyledPageCard bgColor={'red'}>
        <PageHeader header={'Test'}>
          { chainId && ( <QuestionHelper text={'Test'} info={<>Test</>} /> )} 
        </PageHeader>
        <Wrapper id="issuance-page">

          <BottomGrouping>


                <RowBetween style={{marginTop:'1rem'}}>
                  <ButtonError  onClick={Test}>
                    <Text fontSize={20} fontWeight={500}>
                      Test
                    </Text>
                  </ButtonError>
                </RowBetween>

                <RowBetween style={{marginTop:'1rem'}}>
                  <ButtonError  onClick={getJsonData}>
                    <Text fontSize={20} fontWeight={500}>
                      postData
                    </Text>
                  </ButtonError>
                </RowBetween>                

                <RowBetween style={{marginTop:'1rem'}}>
                  <ButtonError  onClick={()=>getData()}>
                    <Text fontSize={20} fontWeight={500}>
                      getData
                    </Text>
                  </ButtonError>
                </RowBetween>  

                <RowBetween style={{marginTop:'1rem'}}>
                  <ButtonError  onClick={()=>getMiners()}>
                    <Text fontSize={20} fontWeight={500}>
                      getMiners
                    </Text>
                  </ButtonError>
                </RowBetween>                  
          </BottomGrouping>
        </Wrapper>
        </StyledPageCard>
      </AppBody>
    </>
  )
}