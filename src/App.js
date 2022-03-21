import React, {useEffect, useState} from 'react';
import useWebSocket from 'react-use-websocket';


function App() {

  const [bidS, setBidS] = useState([])
  const [bidQtyS, setBidQtyS] = useState([])
  const [askS, setAskS] = useState([])
  const [askQtyS, setAskQtyS] = useState([])
  const [totalAsk, setTotalAsk] = useState(0)
  const [totalBid, setTotalBid] = useState(0)

  const {
    sendJsonMessage,
    lastMessage,
  } = useWebSocket('wss://stream.binance.com:9443/ws');

  useEffect(() => {
    sendJsonMessage({
        method: "SUBSCRIBE",
        params:[
            "ethbtc@bookTicker",
        ],
        id: 1
    });
  })

  const randomNumber = (min, max) => {
      let value = (Math.random() * (parseFloat(max) - parseFloat(min))) + parseFloat(min);
      return Number.parseFloat(value).toFixed(8);
  }

  useEffect(() => {
    if(lastMessage) {
      const body = JSON.parse(lastMessage.data);
      const bid = body.b;
      const bidQty = body.B;
      const ask = body.a;
      const askQty = body.A;
    
      // initialize the array
      let bidArr = [];
      let bidQtyArr = [];
      let askArr = [];
      let askQtyArr = [];
    
      let bidLimit = 0;
      let askLimit = 0;
      // loop infinite
      while (true) {
          bidLimit = 0;
          askLimit = 0;
          let ok = true;
          for (let i = 0; i < 9; i++) {
              const randomBid = randomNumber(0, bid);
              const randomBidQty = randomNumber(0.1, 5);
              bidLimit += parseFloat(randomBid)*parseFloat(randomBidQty);
              if (bidLimit >= 5) { // exceed limit, break and re-random
                  ok = false;
                  break;
              }
              const randomAsk = randomNumber(ask, (parseFloat(ask) + 0.5).toFixed(8));
              const randomAskQty = randomNumber(0.1, 5);
              askLimit += parseFloat(randomAskQty)
              if (askLimit >= 150) { // exceed limit, break and re-random
                  ok = false;
                  break;
              }
              bidArr.push(randomBid);
              bidQtyArr.push(randomBidQty);
              askArr.push(randomAsk);
              askQtyArr.push(randomAskQty);
          }
          if (!ok) { // reset the arrays when exceeding limit
              bidArr = [];
              bidQtyArr = [];
              askArr = [];
              askQtyArr = [];
          } else {
              break // everything ok, break to display the list
          }
      }
      // sort the arrays to correct order
      bidArr.sort((a,b) => b-a);
      askArr.sort((a,b)=> a-b);
    
      // append the original value to the start of the list
      bidArr.unshift(bid);
      bidQtyArr.unshift(bidQty);
      askArr.unshift(ask);
      askQtyArr.unshift(askQty);
    
      setBidS(bidArr);
      setBidQtyS(bidQtyArr);
      setAskS(askArr);
      setAskQtyS(askQtyArr);
      setTotalAsk(askLimit);
      setTotalBid(bidLimit);
    }
  }, [lastMessage])

const renderRows = () => {
  let rows = [<tr>{"Size --- Bid --- Ask --- Size"}</tr>];
    for (let i = 0; i < bidQtyS.length; i++){
      rows.push(<tr key={i}>{`${bidQtyS[i]} --- ${bidS[i]} --- ${askS[i]} --- ${askQtyS[i]}`}</tr>)
    }
    return rows
}
  return (
    <div>
<table>
          <tbody>
            {renderRows()}
          </tbody>
        </table>
        <p>Total ask size: {totalAsk}</p>
        <p>Total bid size: {totalBid}</p>
    </div>
        
  );
}

export default App;
