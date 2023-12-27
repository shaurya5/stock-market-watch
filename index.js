const NSELink =
  "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY";

const fetchData = async () => {
  const res = await fetch(NSELink);
  const data = await res.json();
  let CEData = data.records.data.filter((item) => item.CE);
  let PEData = data.records.data.filter((item) => item.PE);
  CEData = CEData.map((item) => {
    return {
      strikePrice: item.strikePrice,
      expiryDate: item.expiryDate,
      lastPrice: item.CE.lastPrice,
      volume: item.CE.totalTradedVolume,
      oi: item.CE.openInterest,
      chngInOi: item.CE.changeinOpenInterest,
    };
  });
  PEData = PEData.map((item) => {
    return {
      strikePrice: item.strikePrice,
      expiryDate: item.expiryDate,
      lastPrice: item.PE.lastPrice,
      volume: item.PE.totalTradedVolume,
      oi: item.PE.openInterest,
      chngInOi: item.PE.changeinOpenInterest,
    };
  });
  return { CEData, PEData };
};

const main = async () => {
  const { CEData, PEData } = await fetchData();
  console.log(CEData);
};

main();

/*
  LTP - last price
  Volume - Total traded volume
  OI - Open Interest
  Chng in OI - Change in Open Interest
*/
