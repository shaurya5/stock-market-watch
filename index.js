const { google } = require("googleapis");

const authSheets = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });
  return {
    auth,
    authClient,
    sheets,
  };
};

const spreadsheetId = "1h3mIfF6E0MRKVLz-MNnJvWaUSHsu-0R0tjfom_m6aYk";

const getSheetData = async () => {
  const { sheets } = await authSheets();
  const { CEData, PEData } = await fetchNSEData();
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: CEData.map((item) => [
        item.strikePrice,
        item.expiryDate,
        item.lastPrice,
        item.volume,
        item.oi,
        item.chngInOi,
      ]),
    },
  });

  return response.data.values;
};

const NSELink =
  "https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY";

const fetchNSEData = async () => {
  const res = await fetch(NSELink);
  const data = await res.json();
  const expiryDate = data.records.expiryDates[1];

  console.log(expiryDate)

  const mapData = (item, type) => ({
    strikePrice: item.strikePrice,
    expiryDate: item.expiryDate,
    lastPrice: item[type].lastPrice,
    volume: item[type].totalTradedVolume,
    oi: item[type].openInterest,
    chngInOi: item[type].changeinOpenInterest,
  });

  const mapCEData = data.records.data
    .filter((item) => item.CE && item.CE.expiryDate === expiryDate)
    .map((item) => mapData(item, "CE") );
  const mapPEData = data.records.data
    .filter((item) => item.PE && item.PE.expiryDate === expiryDate)
    .map((item) => mapData(item, "PE"));

  return { CEData: mapCEData, PEData: mapPEData };
};

const main = async () => {
  // const { CEData, PEData } = await fetchNSEData();
  // console.log(CEData);
  getSheetData().then((data) => console.log(data));
};

main();

/*
  LTP - last price
  Volume - Total traded volume
  OI - Open Interest
  Chng in OI - Change in Open Interest
*/
