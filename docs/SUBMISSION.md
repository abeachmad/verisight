<!-- BEGIN KETTY:SUBMISSION v1 -->
# Submission

## Deskripsi singkat
Verisight memverifikasi klaim (AI + sumber), menulis bukti ke Linera (CID/IPFS, tx_hash, chain_id), lalu membuka market prediksi dengan odds real-time di testnet.

## Setup (Windows/WSL & Linux)
1) `cp .env.example .env` → isi:
   - ORACLEFEED_APP_ID, MARKET_APP_ID
   - ORACLEFEED_SERVICE_URL, MARKET_SERVICE_URL
   - IPFS_API_URL, IPFS_GATEWAY_URL
2) Deploy/publish (testnet) → lihat `linera/scripts/*` (atau wrapper PS/WSL bila ada).
3) Jalankan backend & frontend.

## Demo 60 detik (step)
1) **Events** → pilih event.
2) **On-chain evidence**: CID/IPFS (link), `tx_hash` (copy), `chain_id`.
3) **Odds** live (poll 3s) berubah saat stake.
4) **Stake**: auto-disabled saat `cutoff/resolved`, toast untuk cooldown.
5) **Resolve** → UI menampilkan status resolved.

## Linera SDK/Protocol
Lihat **docs/ONCHAIN.md** (ABI, Views, Contract vs Service).

## Known limitations
Latency testnet; parameter velocity cap konservatif.

## Changelog
Lihat **CHANGELOG.md**.
<!-- END KETTY:SUBMISSION v1 -->
