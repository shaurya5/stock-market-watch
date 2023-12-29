const { google } = require("googleapis");

const authSheets = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      "client_email": "stock-watch@stock-market-watch-409508.iam.gserviceaccount.com",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWbJflTAaglAEI\ndRFQg7jNR1judCuDJ/J5u2Ku1RPUgx28C+Wiek7bot9tDpN0aEEK++J9K72InR7q\n0eLphkfta8vXhpqshja1bFhIbAzWtuPjDyhkgHmcGQvsZnqDzUgSPCawgFpsYxom\nK+57VPfp41MCOEbttSXUVaXyZ/OAWS3mkueGdFHJNGIx2JrtdX0IS+EQWemiEThB\nuV42NqzuhEXYbhoX2Gf8NKEatwBY+dJsDwdgRyB1svdnqB0eVk+6t20QX3XNBWLc\n/ojQt8v+cL8BBmQQLRySs0YNqgRmfU6BrZdYxnzVDmo+h277Dfr7TbweR4Xs2yJr\ng9bl/eD1AgMBAAECggEABYik0xsnIm6tzlies1L+8M9NUhqBHMZDmZT2l95lMvgV\nfmrZLykHm98xDT9RzcohMzK4EBs4bdjn0ujkeaEVSwePHNdH6rlsNCDuCb2kh2F0\nPqhZIytDC2TRfBufjRy9/8VGvPBHEe9Taq/gdi7fPUCrl2eGTxavrMvvRGY4SgDj\n2y0UcfCobt0poyBeGCXdEjmTIGRtSSdnnaVSP/2ZXKrKOGF+JuDqcGD8xhoh4TDr\nXbZDvKPAQsSueewgFmGUzqNwqFHKVxWjR2vf1Cb+XVBRZ0S6HL7jgCWkarB88GKg\ngM5oHA4VTMC7MbjnRddYTPBM/AnsPJERHYbOuJZOIQKBgQD+L/m8XlOlqfJQPc9r\n/rUw4KCUEli/sG//C6G0GpSIjZJQaDOUxdnQz990GwEdXMyitORNKRn+ohV7/FqX\nXPqOovJSR72i/AwyjIpfDb9fuWenujOeUT2HFyDg6ic8NfkpepA4Ld+MuV9knnFv\nyMc8Vfs86m+q9yUfNIAlZbXbYQKBgQDX9Ad7oYgfT2IVDsmpovMe6HpGirEPjMQX\n7XE/IEPcTpPYlCqrKgpwcP4RkRbbb7GAt7633mvsT5n+frL77WiPmm4z7EMf6hwa\n5UqhYEgG/qJBZOilinmT8tX1mRH4ZMUvYhwiwjlGsd81FU5HvFfARn78NBOhZlnz\nmIA7PPAiFQKBgQDC0pSwSwADzrE5zVZI6O2Ja/HH7BP3wEznB8xF1cWYsCG/3U4D\nrm2XPWyAeh4tmi4CW3FMrr8MysB6yl3I++vTHZNrey8fV94ldFCuMERJIzsOdIoR\nwyTMgO6jVPUDkj7KCvW1CXv5SS+TWFmLmzERzrkE5I74U/sw4rWBdGahoQKBgQDU\ngNPkOn3ioZEYu6aCAVFQNuAsDkpRzOkhyotH3Q4p+kDOPG8IY6RGJUo+KxHc+Too\nOae482wr6+DTaAXklifwN7z95x3eh9cEOGGKD16RU3yC8TNlwrAEgE8/EFN4pGDN\nUbPyGEGYaWwFpmOTf6iyEizfLLeseTVG2ehFYp/CSQKBgBcFkLzk20wl4u/DG6gh\n1KXjuIThHi/iv8ywWxEWH701SJ1Y+9Lpd7XS8aGdyFBf8WQWhaffe2C7QS6vWdd8\nC7lSJeyv9KWXPWd/sRc+Acxz3/zcK10v+inkyHk9Z/yvU8fRtEH47YVMYaVd9NBr\ndXjL+YDs6X3KqjjAYZZ5f6My\n-----END PRIVATE KEY-----\n",
      "universe_domain": "googleapis.com"
    },
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
