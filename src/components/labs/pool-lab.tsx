"use client";

import { useState } from "react";
import { trade, type Pool } from "@/lib/labs";
import { Panel, ShareButton, Slider, Stat } from "./parts";

const pool: Pool = { cash: 100_000, coins: 1_000 };
const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const percent = (n: number) => `${(n * 100).toFixed(1)}%`;

// The chart: coins left along the bottom, cash up the side, both from zero.
const [W, H, MAX_COINS, MAX_CASH] = [520, 340, 1400, 260_000];
const x = (coins: number) => (coins / MAX_COINS) * W;
const y = (cash: number) => H - (cash / MAX_CASH) * H;
const K = pool.cash * pool.coins;
const curve = Array.from({ length: 90 }, (_, i) => {
  const coins = 400 + (i / 89) * (MAX_COINS - 400);
  return `${i ? "L" : "M"}${x(coins).toFixed(1)} ${y(K / coins).toFixed(1)}`;
}).join("");

/** Investments: buy from a pool, and watch a bot trade ahead. */
export function PoolLab() {
  const [cash, setCash] = useState(10_000);
  const [bot, setBot] = useState(false);
  const [limit, setLimit] = useState(0.5);
  const alone = trade(pool, cash, 0, 1);
  const result = trade(pool, cash, bot ? cash * 1.5 : 0, limit);
  const left = { cash: pool.cash + cash, coins: pool.coins - alone.coins };

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel title="Your trade">
        <div className="grid gap-7">
          <Slider label="Spend" min={500} max={80_000} step={500} value={cash} onChange={setCash} format={money} />
          <Slider label="Most slippage you accept" min={0.01} max={0.6} step={0.01} value={limit} onChange={setLimit} format={percent} />
          <button
            type="button"
            role="switch"
            aria-checked={bot}
            onClick={() => setBot(!bot)}
            className="flex min-h-12 cursor-pointer items-center justify-between gap-4 border border-white/25 px-4 text-left hover:border-white"
          >
            <span>
              <span className="block font-semibold">Sandwich bot</span>
              <span className="block text-sm text-gray-400">Sees your trade and buys first, then sells to you.</span>
            </span>
            <span aria-hidden="true" className={`flex h-6 w-11 shrink-0 p-0.5 transition-colors ${bot ? "justify-end bg-scarlet" : "bg-white/25"}`}>
              <span className="size-5 bg-white" />
            </span>
          </button>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-5">
          <Stat label="Quoted price" value={money(result.quoted)} />
          <Stat label="Price you pay" value={result.rejected ? "No trade" : money(result.price)} />
          <Stat label="Slippage" value={percent(result.slip)} loud={result.slip > 0.15} />
          <Stat label={bot ? "Bot’s profit" : "Coins you get"} value={bot ? money(result.bot) : alone.coins.toFixed(1)} loud={bot && result.bot > 0} />
        </dl>
      </Panel>

      <Panel title="The pool: coins × cash stays the same or grows">
        <svg viewBox={`-8 -14 ${W + 40} ${H + 46}`} className="w-full" role="img" aria-label={`Before the trade the pool holds 1,000 coins and $100,000. After yours it holds ${left.coins.toFixed(0)} coins and ${money(left.cash)}.`}>
          <path d={`M0 0V${H}H${W}`} stroke="currentColor" strokeOpacity="0.4" fill="none" />
          <path d={curve} stroke="currentColor" strokeWidth="2" fill="none" />
          <path d={`M${x(pool.coins)} ${H}V${y(pool.cash)}H0`} stroke="currentColor" strokeOpacity="0.35" strokeDasharray="4 5" fill="none" />
          <path d={`M${x(left.coins)} ${H}V${y(left.cash)}H0`} stroke="var(--color-scarlet)" strokeDasharray="4 5" fill="none" />
          <path d={`M${x(pool.coins)} ${y(pool.cash)}L${x(left.coins)} ${y(left.cash)}`} stroke="var(--color-scarlet)" strokeWidth="3" />
          <rect x={x(pool.coins) - 6} y={y(pool.cash) - 6} width="12" height="12" fill="currentColor" />
          <rect x={x(left.coins) - 8} y={y(left.cash) - 8} width="16" height="16" className="fill-scarlet" />
          <g fill="currentColor" fontSize="14">
            <text x={W} y={H + 24} textAnchor="end">Coins in the pool</text>
            <text x="8" y="4">Cash in the pool</text>
          </g>
        </svg>
        <p aria-live="polite" className="mt-5 min-h-[4.5em] text-lead">
          {result.rejected
            ? `Your limit rejected the trade, and the bot lost ${money(-result.bot)} in fees for nothing.`
            : bot
              ? `You got ${result.coins.toFixed(1)} coins instead of ${alone.coins.toFixed(1)}. The bot took ${money(result.bot)} without taking any risk. Lower your limit to stop it.`
              : result.slip > 0.15
                ? "Your own trade moved the price against you. Splitting it up, or using a deeper pool, would cost less."
                : "A small trade barely moves the price. Try spending more, or turn on the bot."}
        </p>
        {bot && result.rejected && (
          <div className="mt-4">
            <ShareButton text="I set a slippage limit and made a sandwich bot lose money." />
          </div>
        )}
      </Panel>
    </div>
  );
}
