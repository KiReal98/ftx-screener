import React, { useState, useEffect, Fragment } from "react";
import { BallTriangle } from "react-loader-spinner";
import { getApiAuth, fetchApiData } from "../utils/helpers";
import { API_KEY, API_SECRET } from "../utils/constants";

import "./ScreenTable.css";

const ScreenTable = () => {
  const [markets, setMarkets] = useState();
  const [marketsOrderBook, setMarketsOrderBook] = useState();
  const [orderBook, setOrderBook] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isInDraftMode, setIsInDraftMode] = useState(true);
  const [totalLimit, setTotalLimit] = useState();

  useEffect(() => {
    getMarkets();
  }, []);

  useEffect(() => {
    if (marketsOrderBook) {
      Promise.all(marketsOrderBook).then((res) => {
        const orderBookPerMarket = res.map((result, i) => ({
          market: markets[i],
          asks: result.result.asks,
          bids: result.result.bids,
        }));

        setOrderBook(orderBookPerMarket);
        setIsLoading(false);
      });
    }
  }, [marketsOrderBook]);

  const getMarkets = () => {
    fetchApiData(
      "/markets",
      getApiAuth(API_KEY, API_SECRET, "GET", "/markets")
    ).then((marketsData) => {
      if (marketsData && marketsData.result) {
        const marketsOrderbook = marketsData.result.map((market) =>
          fetch(`https://ftx.com/api/markets/${market.name}/orderbook`).then(
            (res) => res.json()
          )
        );
        const markets = marketsData.result.map((market) => market.name);

        setMarkets(markets);
        setMarketsOrderBook(marketsOrderbook);
      }
    });
  };

  const renderAsksBids = () => {
    if (orderBook && orderBook.length > 0 && !isInDraftMode) {
      let count = 0;
      return orderBook.map((marketObj, i) => {
        const { market, asks, bids } = marketObj;
        const limit = totalLimit ? totalLimit : 9999999999;

        const asksWithinLimit = asks.map((order, j) => {
          const total = Number((order[0] * order[1]).toFixed(3));
          if (total > limit) {
            const isOdd = count % 2 === 0 ? "odd" : "";
            count++;
            return (
              <Fragment key={j}>
                <span className={`item-market positive-${isOdd}`}>
                  {market}
                </span>
                <span className={`item-price ${isOdd}`}>{order[0]}</span>
                <span className={`item-size ${isOdd}`}>{order[1]}</span>
                <span className={`item-total positive-${isOdd}`}>{total}</span>
              </Fragment>
            );
          }
          return "";
        });

        const bidsWithinLimit = bids.map((order, j) => {
          const total = Number((order[0] * order[1]).toFixed(3));
          if (total > limit) {
            const isOdd = count % 2 === 0 ? "odd" : "";
            count++;
            return (
              <Fragment key={j}>
                <span className={`item-market negative-${isOdd}`}>
                  {market}
                </span>
                <span className={`item-price ${isOdd}`}>{order[0]}</span>
                <span className={`item-size ${isOdd}`}>{order[1]}</span>
                <span className={`item-total negative-${isOdd}`}>{total}</span>
              </Fragment>
            );
          }
          return "";
        });

        return (
          <Fragment key={i}>
            {asksWithinLimit}
            {bidsWithinLimit}
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
          <input
            className="total-limit-input"
            type="number"
            min="1"
            max="1000000000"
            name="totalLimit"
            value={totalLimit}
            id="totalLimit"
            placeholder="Enter total limit"
            onChange={(e) => {
              setTotalLimit(e.target.value);
              setIsInDraftMode(true);
            }}
          />
          <button
            type="button"
            className="btn-search"
            disabled={isLoading || totalLimit > 1000000000}
            onClick={(e) => setIsInDraftMode(false)}
          >
            Find
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="loader">
          <BallTriangle color="#00BFFF" height={100} width={100} />
        </div>
      ) : (
        <div className="screener-grid">
          <span className="item-header">Market</span>
          <span className="item-header">Price</span>
          <span className="item-header">Size</span>
          <span className="item-header">Total</span>
          {renderAsksBids()}
        </div>
      )}
    </div>
  );
};

export default ScreenTable;
