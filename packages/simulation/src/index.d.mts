export declare function lmsrCost(quantities: number[], liquidity: number): number;
export declare function lmsrPrices(quantities: number[], liquidity: number): number[];
export declare function quoteAllocation(quantities: number[], liquidity: number, outcomeIndex: number, units: number): {cost:number; pricesBefore:number[]; pricesAfter:number[]; updatedQuantities:number[]};
export declare function brierScore(probabilities: number[], winnerIndex: number): number;
