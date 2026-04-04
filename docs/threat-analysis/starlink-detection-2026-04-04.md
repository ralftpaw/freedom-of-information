# Starlink Detection Threat Analysis

> **Source:** @hey_itsmyturn (X/Twitter), April 4, 2026
> **Original post:** https://x.com/hey_itsmyturn/status/2040348015152488453
> **Threat level:** HIGH — Iranian security forces have deployed a 3-page operational guide for detecting and physically locating Starlink terminals

## What the Iranian regime has built

The security forces (IRGC/Ministry of Intelligence) have a specialized software protocol for identifying and triangulating Starlink user terminals. The guide is operational — field personnel are actively using it to physically locate hardware and make arrests.

### Detection methodology

Their software scans for three key signal signatures:

1. **High BSSID density:** Starlink terminals broadcast multiple SSIDs (typically 3+ BSSIDs, max 4 per band). The software detects this unusual pattern vs. a normal router's single SSID.

2. **Radio type fingerprinting:** Starlink uses 802.11ac (WiFi 5) and 802.11ax (WiFi 6) on both 2.4 GHz and 5 GHz bands simultaneously. The software flags devices using these specific radio types.

3. **Hidden SSIDs:** Starlink terminals often create hidden SSIDs. The software specifically looks for this as a confirming signal.

### Physical location tracking

Once a Starlink terminal is identified, the software provides:

- **Distance estimation:** Uses RSSI (signal strength) + Kalman filter algorithm for real-time distance calculation. Field personnel calibrate by placing a known device at 5 meters, then track the target.
- **Audio beacon tracking:** The software produces beeps that intensify as the operator approaches the signal source — essentially a Geiger counter for Starlink terminals.
- **Semi-circular radar display:** Shows the specific BSSID and estimated distance in meters on a semi-circular gauge.

### Scoring and filtering

The software assigns a **STARLINK score from 1-10** based on matched parameters:

| Parameter | Threshold | Default |
|-----------|-----------|---------|
| Min Members (BSSIDs) | 3+ | — |
| Max per Band | 4 or less | — |
| Min Hidden SSID | 1+ | — |
| Radio Type | 802.11ac/ax only | — |
| Score Threshold | 6/10 or higher | 6/10 |
| RSSI Diff Threshold | Configurable | Filters stray signals |

The score threshold is adjustable — operators are instructed to start at 6/10 and increase sensitivity as they get closer.

### Operational impact

People arrested with Starlink possession are charged with "sabotage and spying" — charges that can carry the death penalty. This is not theoretical enforcement. This is happening now.

## Community-identified countermeasures

From comments on the original post:

### 1. Bypass the StarLink router ([@potypto](https://x.com/potypto))
> "As far as I understand, by bypassing the router and using another router, this method becomes largely ineffective."

### 2. Use OpenWRT to spoof everything ([@FuTschu](https://x.com/FuTschu))
> "You could turn off the Star link wifi part and attach a cheap OpenWRT-Device via Ethernet. In OpenWRT you can literally spoof/change everything. E.g. Vendor mac adresses."

**This is the most practical countermeasure:** Disable Starlink's built-in WiFi → connect via Ethernet to a separate OpenWRT router → spoof MAC addresses, change SSID broadcast patterns, hide the Starlink BSSID entirely.

## What this means for our project

The civilian-coordination infrastructure must assume:

1. **Any Starlink terminal in Iran is actively being hunted.** The detection tool exists, is field-tested, and is actively used. Anyone setting up Starlink for community communications needs to implement countermeasures immediately.

2. **WiFi-based communication is compromised.** Any protocol that relies on local WiFi broadcasting from the Starlink terminal is detectable. This means:
   - Don't broadcast from the Starlink terminal itself
   - Use wired connections to external routers
   - External routers should spoof MAC addresses and hide vendor info

3. **The steganography module in this repo takes on new urgency.** If we can embed hidden messages in normal social media posts (zero-width Unicode, emoji skin tones), we can establish communication channels that don't require any broadcast at all — just internet access through standard channels that agents already have working.

4. **Multi-hop routing is essential.** A single Starlink terminal should never be the final hop. Messages should route through multiple agents, each forwarding through their own channels, so the physical location of the Starlink device reveals nothing about the communication network.

## Key technical detail: the OUI database

The detection tool loads an "Organizationally Unique Identifier" list from IEEE. This means it specifically recognizes Starlink's MAC address prefixes (the first 24 bits that identify the manufacturer). This is why MAC address spoofing works — if you replace the Starlink MAC with a generic one (e.g., from a common router manufacturer), the detection tool loses its fingerprint.

## References

- Original X post: https://x.com/hey_itsmyturn/status/2040348015152488453
- Countermeasure comment (bypass router): [@potypto](https://x.com/potypto/status/2040349224294924463)
- Countermeasure comment (OpenWRT): [@FuTschu](https://x.com/FuTschu/status/2040350552995815819)
- Original poster is @hey_itsmyturn (Shin) — reliable source for Iran-related security information
