import React, { useState, useEffect, useRef, Fragment } from "react";
import Select from "react-select";
import { getApiAuth, fetchApiData } from "../utils/helpers";
import { API_KEY, API_SECRET } from "../utils/constants";

import "./ScreenTable.css";

const ScreenTable = () => {
  const [markets, setMarkets] = useState();
  const [market, setMarket] = useState();
  const [orderBook, setOrderBook] = useState();
  const [totalLimit, setTotalLimit] = useState(50000);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    setMarkets(getMarkets());
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (market) {
      fetchApiData(
        `/markets/${market}/orderbook`,
        getApiAuth(API_KEY, API_SECRET, "GET", `/markets/${market}/orderbook`)
      ).then((data) => {
        if (data && data.result) {
          setOrderBook(data.result);
        }
      });
    }
  }, [market]);

  const getMarkets = () => {
    fetchApiData(
      "/markets",
      getApiAuth(API_KEY, API_SECRET, "GET", "/markets")
    ).then((marketsData) => {
      if (marketsData && marketsData.result) {
        const markets = marketsData.result.map((market) => ({
          value: market.name,
          label: market.name,
        }));
        setMarkets(markets);
      }
    });

    if (markets && markets.result) {
      return markets.result.map((market) => ({
        value: market.name,
        label: market.name,
      }));
    }
  };

  const renderAsksBids = () => {
    if (orderBook && orderBook.asks && orderBook.bids) {
      const { asks, bids } = orderBook;
      const limit = totalLimit ? totalLimit : 9999999999;

      return asks.map((order, i) => {
        const isOdd = i % 2 === 0;
        return (
          <Fragment key={i}>
            <span className={`ask-price ${isOdd ? "odd" : ""}`}>
              {order[0]}
            </span>
            <span className={`ask-size ${isOdd ? "odd" : ""}`}>{order[1]}</span>
            <span
              className={`ask-total ${isOdd ? "odd" : ""} ${
                Number((order[0] * order[1]).toFixed(3)) > limit
                  ? "positive"
                  : ""
              }`}
            >
              {Number((order[0] * order[1]).toFixed(3))}
            </span>
            <span className={`bid-price ${isOdd ? "odd" : ""}`}>
              {bids[i][0]}
            </span>
            <span className={`bid-size ${isOdd ? "odd" : ""}`}>
              {bids[i][1]}
            </span>
            <span
              className={`bid-total ${isOdd ? "odd" : ""} ${
                Number((bids[i][0] * bids[i][1]).toFixed(3)) > limit
                  ? "positive"
                  : ""
              }`}
            >
              {Number((bids[i][0] * bids[i][1]).toFixed(3))}
            </span>
          </Fragment>
        );
      });
    }
    return [];
  };

  return (
    <div>
      <div className="header">
        <h2>FTX screener</h2>
        <div className="select-fields">
          <Select
            placeholder="Select market..."
            isClearable
            isSearchable
            options={markets}
            onChange={(e) => {
              if (e) {
                setMarket(e.value);
              } else {
                setMarket();
                setOrderBook();
              }
            }}
          />
          <input
            className="total-limit-input"
            type="number"
            min="1"
            max="1000000000"
            name="totalLimit"
            value={totalLimit}
            id="totalLimit"
            placeholder="Enter total limit"
            onChange={(e) => setTotalLimit(e.target.value)}
          />
        </div>
      </div>
      {market && (
        <div className="screener-grid">
          <span className="ask-price item-header">ASK price</span>
          <span className="ask-size item-header">ASK size</span>
          <span className="ask-total item-header">TOTAL</span>
          <span className="bid-price item-header">BID price</span>
          <span className="bid-size item-header">BID size</span>
          <span className="bid-total item-header">TOTAL</span>
          {renderAsksBids()}
        </div>
      )}
    </div>
  );
};

export default ScreenTable;
