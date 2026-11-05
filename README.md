# Linger_pro

Shadowrocket expiry-validation test for Linger, for author-authorized testing.

## Install

Add this remote module in Shadowrocket > Configuration > Modules:

https://raw.githubusercontent.com/johnnywwy/Linger_pro/main/LingerPro.sgmodule

The module references `LingerPro.js` automatically. HTTPS decryption and a trusted Shadowrocket certificate are prerequisites; importing JavaScript alone does not configure MITM or request matching.

## Scope and limitations

- Checks `X-Client-Bundle-ID: com.libowang.Linger`.
- Matches dynamic subscriber IDs, excluding subpaths such as `/offerings`.
- Changes only existing `Pro access` / `linger_yearly` expiry fields locally.
- Does not create purchase records or forge response signatures.
- Does not change App Store or RevenueCat server records.
- JavaScript syntax checked; actual Shadowrocket behavior has not been verified.
- Disable the module after testing.
