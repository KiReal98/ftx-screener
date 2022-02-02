import stringHex from "string-hex";
import CryptoJS from "crypto-js";

import { API_BASE_URL } from "./constants";

export const getApiAuth = (
  apiKey,
  apiSecret,
  method = "GET",
  path,
  contentType = "application/json",
  JSONbody = true,
  body
) => {
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  const signature_payload = `${stringHex(timestamp)}${stringHex(
    method
  )}${stringHex(path)}`;
  const signature = CryptoJS.HmacSHA256(
    signature_payload,
    stringHex(apiSecret)
  );
  const signatureBase64 = CryptoJS.enc.Base64.stringify(signature);

  return {
    method,
    body: JSONbody ? JSON.stringify(body) : body,
    headers: {
      "FTX-KEY": apiKey,
      "FTX-SIGN": signatureBase64,
      "FTX-TS": timestamp,
      "Content-Type": contentType,
    },
  };
};

export const fetchApiData = async (path = "", requestData) => {
  const response = await fetch(`${API_BASE_URL}${path}`, requestData).then();

  return await response.json();
};
