# Kazakh (Cyrillic) translation vocabulary (`kk@Cyrl.json`)

See [`../vocabulary.md`](../vocabulary.md) for the glossary of terms and the meaning of each row.

| Term | Translation | Notes |
|------|-------------|-------|
| **_Brand & protocol_** | | |
| Bitcoin | Bitcoin | brand kept Latin; Cyrillic gloss `Биткоин` per kk.wikipedia.org/wiki/Биткоин + Bitcoin Core kk (use in body text only). |
| Lightning | Lightning | brand · kept Latin (no established kk.wikipedia article). |
| Electrum | Electrum | brand. |
| LNDhub | LNDhub | brand. |
| LND | LND | brand. |
| LNURL | LNURL | brand. |
| Tor | Tor | brand. |
| Orbot | Orbot | brand. |
| GroundControl | GroundControl | brand. |
| **_Units & amounts_** | | |
| bitcoin / BTC | биткоин / BTC | Lowercase unit name per kk.wikipedia.org/wiki/Биткоин (article uses `биткоин` in body). `BTC` ticker uppercase. |
| sats | сатоши | noun, lowercase; abbreviation `сат.` used in compact UI · transliteration. |
| sat/vByte | sat/vByte | Keep Latin per convention. |
| vByte | vByte | Keep Latin per convention. |
| **_Wallet, keys & seeds_** | | |
| Wallet | әмиян | noun · Bitcoin Core kk + kk.wikipedia.org/wiki/Әмиян (purse/wallet). |
| Vault | сейф | noun (safe/strongbox); ⚠️ NOT a brand — translate the concept. |
| Watch-only | тек қарау | adj · "view-only" (no upstream wallet citation; descriptive). ⚠️ NOT generic "view mode". |
| Hardware wallet | аппараттық әмиян | noun · matches Wallet=әмиян; common Kazakh tech idiom (no upstream wallet citation). |
| Seed | сид / қалпына келтіру сөз тіркесі | noun · technical / mainstream (no upstream wallet citation). |
| Mnemonic | мнемоникалық тіркес | noun · standard Kazakh tech idiom (no upstream wallet citation). |
| Passphrase | құпиясөйлем | noun · Bitcoin Core kk (`Құпиясөйлем`). ⚠️ NOT the app "password" (`құпиясөз`) and NOT the device "passcode". |
| Public key | ашық кілт | noun, target-locale lowercase · parallel to `жеке кілт` (private key). |
| Private key | жеке кілт | noun · Bitcoin Core kk (`жеке кілттер` = private keys). |
| WIF | WIF | acronym. |
| xpub | xpub | acronym; lowercase per convention. |
| Descriptor | дескриптор | noun, target-locale lowercase · transliteration (no upstream wallet citation). |
| Derivation path | шығару жолы | noun, target-locale lowercase · "derivation path" (no upstream wallet citation). |
| Master fingerprint | негізгі саусақ ізі | noun, target-locale lowercase · "main fingerprint" (no upstream wallet citation). |
| BIP38 | BIP38 | acronym. |
| **_On-chain transactions_** | | |
| Transaction | транзакция | noun · Bitcoin Core kk (`Транзакция`) + kk.wikipedia.org/wiki/Биткоин. |
| Address | мекенжай | noun, target-locale lowercase · Bitcoin Core kk + kk.wikipedia. ⚠️ shipped UI uses `Адрес` (Russian loan) — flag for fix. |
| Input | кіріс | noun, target-locale lowercase · ⚠️ NOT "login" (`кіру`) — pair with `шығыс` (output). |
| Output | шығыс | noun, target-locale lowercase · ⚠️ NOT the UI label "Кімге:" — tx output noun. |
| UTXO | UTXO | acronym. |
| Change | қалдық | noun · ⚠️ NOT verb "өзгерту" — must be the noun "leftover/remainder" (standard Kazakh banking term). |
| Hex | hex / он алтылық | noun · short / explanatory · ⚠️ NOT "hash". |
| Pending | күтілуде | adj/state ("is awaiting"); target-locale lowercase · shipped string. |
| Unconfirmed | расталмаған | adj/state · parallel negative of `расталған` (confirmed). |
| Confirmed | расталған / растық | adj / noun · Bitcoin Core kk ships noun `Растық` (= "the confirming") and `Растау саны` for "Confirmations"; UI adjective form is `расталған`. |
| Mempool | mempool | technical term kept Latin (typical in Slavic/Turkic locales). |
| Broadcast | тарату / тарату жасау | noun / verb · standard Kazakh "broadcast/distribute" (no upstream wallet citation). |
| Block explorer | блок шолғышы | noun, target-locale lowercase · "block browser" (no upstream wallet citation). |
| Onchain | он-чейн / блокчейнде | adj · compact (chip) / explanatory (body) (no upstream wallet citation). |
| Offchain | оф-чейн / блокчейннен тыс | adj · compact (chip) / explanatory (body) (no upstream wallet citation). |
| **_Fees & fee bumping_** | | |
| Fee | комиссия | noun, target-locale lowercase · Bitcoin Core kk (`Комиссия`) and kk.wikipedia.org/wiki/Биткоин (`комиссиялар`). |
| Fee Bump | комиссияны арттыру | noun, target-locale lowercase · "raising of fee" umbrella term for RBF + CPFP. |
| RBF | RBF | acronym. |
| CPFP | CPFP | acronym. ⚠️ NOT a verb like "create" — keep `CPFP`. |
| Speed Up | жылдамдату | verb · "speed up" (no upstream wallet citation). |
| **_Lightning_** | | |
| Invoice | шот / шот-фактура | noun · mainstream / technical · standard Kazakh business term (no upstream wallet citation). |
| Lightning Invoice | Lightning шоты | noun · brand kept Latin + localised noun (no upstream wallet citation). |
| Preimage | TODO | math term; uncertain Kazakh rendering. |
| Payment | төлем / төлем жасау | noun / verb · target-locale lowercase · shipped UI uses verb-phrase "make payment"; canonical noun is `төлем`. |
| Expired | мерзімі біткен | adj/state · "validity ended" (no upstream wallet citation). |
| **_Multisig & advanced addressing_** | | |
| Co-signer | қос қол қоюшы | noun, target-locale lowercase · "co-signer" — ⚠️ NOT "қосиеленуші" (co-owner). |
| Quorum | кворум / қол қою шегі | noun · canonical / UI-clear (signature threshold). |
| PSBT | PSBT | acronym. |
| Provide signature | қол қою | verb · Bitcoin Core kk uses `қол қою` for `Sign` ("Хатқа қол қою" = sign a message). |
| BIP47 / Payment Code | BIP47 / төлем коды | acronym kept; `Payment Code` → `төлем коды` (target-locale lowercase). |
| Notification transaction | хабарландыру транзакциясы | noun · BIP47-specific "notification tx" (no upstream wallet citation). |
| SilentPayment | Silent Payments | brand · keep English plural per glossary. |
| **_Coin control_** | | |
| Coin Control | UTXO басқару / тиындарды басқару | noun, target-locale lowercase · technical / mainstream · ⚠️ NOT Title Case. |
| Frozen | қатырылған | adj/state · ⚠️ NOT verb "қатыру" — must be adjective/state form. |
| **_Security & storage_** | | |
| Replay risk | қайталану қаупі | noun · Cross-chain transaction replay; failed checks leave the risk unknown and require explicit acceptance before continuing. |
| Encrypted storage | шифрланған сақтау орны | noun, target-locale lowercase · ⚠️ NOT Title Case (no upstream wallet citation). |
| Plausible Deniability | TODO | uncertain Kazakh idiomatic rendering for the privacy concept. |
| Biometrics | биометрия | noun, target-locale lowercase · kk.wikipedia.org/wiki/Биометрия. |
| Passcode | құрылғы коды | ⚠️ NOT app "password" (`Құпиясөз` = "secret word") — distinct device-level code · shipped `Құпиясөз` conflates with password; flag for fix. |
| **_Backup, import & UX_** | | |
| Backup | резервтік көшірме | noun · Bitcoin Core kk (`әмиянның резервтік көшірмесі`). |
| Restore | қалпына келтіру | verb / noun · target-locale lowercase · standard Kazakh "restore" (no upstream wallet citation). |
| Import | импорттау | verb, target-locale lowercase · ⚠️ shipped `Енгізу` (= "to enter/input") is wrong sense — flag for fix. |
| Voucher | ваучер | noun · transliteration; established Kazakh loanword. |
| Redeem | TODO | ⚠️ NOT "buy to wallet" / NOT "transfer" — uncertain Kazakh idiomatic verb for "cash in/activate voucher". |
| Send | жіберу | verb, target-locale lowercase · Bitcoin Core kk (`&Жіберу`). |
| Receive | қабылдау | verb · Bitcoin Core kk (`&Қабылдау`). |
| Settings | баптаулар | noun, target-locale lowercase · shipped plural; Bitcoin Core kk uses singular `Баптау`. Both acceptable. |
| Confirm | растау | verb, target-locale lowercase · Bitcoin Core kk (`Растау`). |
| QR Code | QR код | noun · kk.wikipedia.org/wiki/QR_код. |
| Clipboard | алмасу буфері | noun · kk.wikipedia.org/wiki/Алмасу_буфері. |
| Memo | жазба | noun, target-locale lowercase · "note/memo" (no upstream wallet citation). |
| Description | сипаттама | noun, target-locale lowercase · standard Kazakh "description". |
| Label | белгі | noun · Bitcoin Core kk (`Белгі`). |
