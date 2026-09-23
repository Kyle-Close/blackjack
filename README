# Blackjack Simulator

Blackjack enigine that measures different stats like house edge. With the ability to configure different rules & player strategies.

## Quick start

```bash
npm install
npm run build
npm start          # run a simulation
```

## Usage

Show the smallest command that produces a real result, and its output:

```bash
npm start -- --strategy dealer --decks 4 --hands 60000
```

Results are appended to `results.csv`:

```csv
timestamp,strategy,decks,hands,totalWagered,netResult,houseEdge
2026-09-20T03:03,dealer,4,60000,60000,-3520.5,5.87%
```

## Configuration

| Option | Values | Default | Notes |
|---|---|---|---|
| `--strategy` | `dealer`, ... | `dealer` | Player decision logic |
| `--decks` | integer | `4` | Shoe size |
| `--hands` | integer | — | Rounds to simulate |
| `--soft17` | `stand`, `hit` | ? | Whether 17 with an ace is hit |
| `--blackjackPayout` | `1.5`, `1.2` | `1.5` | 3:2 vs 6:5 |
