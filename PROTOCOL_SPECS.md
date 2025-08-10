# Protocol Specifications - Sing-box Config Generator

## Overview

This document details the supported proxy protocols, their configuration requirements, and implementation specifics in the Sing-box Config Generator.

## Supported Protocols

### 1. VMess Protocol

**Type**: `vmess`  
**UUID Required**: ✅ Yes  
**TLS Support**: ✅ Yes  
**Encryption**: Auto (negotiated with server)

#### Configuration Structure
```json
{
  "type": "vmess",
  "tag": "proxy",
  "server": "example.com",
  "server_port": 443,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "security": "auto",
  "tls": {
    "enabled": true,
    "server_name": "example.com"
  }
}
```

#### Field Requirements
- **Server**: Domain or IP address
- **Port**: 1-65535 (typically 443, 80, 8080)
- **UUID**: RFC 4122 v4 UUID (auto-generated)
- **TLS**: Optional but recommended
- **SNI**: Server Name Indication (auto-filled from server)

#### Implementation Details
- **Lines 472-481**: VMess outbound configuration
- **UUID Generation**: Lines 372-381, 431-437
- **Security**: Always set to "auto" for compatibility
- **TLS**: Full support with SNI

---

### 2. VLESS Protocol

**Type**: `vless`  
**UUID Required**: ✅ Yes  
**TLS Support**: ✅ Yes  
**Encryption**: None (transport layer security only)

#### Configuration Structure
```json
{
  "type": "vless",
  "tag": "proxy",
  "server": "example.com",
  "server_port": 443,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tls": {
    "enabled": true,
    "server_name": "example.com"
  }
}
```

#### Field Requirements
- **Server**: Domain or IP address
- **Port**: 1-65535 (typically 443, 80, 8080)
- **UUID**: RFC 4122 v4 UUID (auto-generated)
- **TLS**: Required for security
- **SNI**: Server Name Indication (auto-filled from server)

#### Implementation Details
- **Lines 482-491**: VLESS outbound configuration
- **TLS Requirement**: Always enabled for security
- **No Encryption**: Relies on TLS for security
- **UUID**: Same generation as VMess

---

### 3. Trojan Protocol

**Type**: `trojan`  
**Password Required**: ✅ Yes  
**TLS Support**: ✅ Yes (Required)  
**Encryption**: TLS-based

#### Configuration Structure
```json
{
  "type": "trojan",
  "tag": "proxy",
  "server": "example.com",
  "server_port": 443,
  "password": "your-password-here",
  "tls": {
    "enabled": true,
    "server_name": "example.com"
  }
}
```

#### Field Requirements
- **Server**: Domain or IP address
- **Port**: 1-65535 (typically 443)
- **Password**: Server-configured password
- **TLS**: Always enabled (protocol requirement)
- **SNI**: Server Name Indication (auto-filled from server)

#### Implementation Details
- **Lines 492-501**: Trojan outbound configuration
- **TLS Required**: Protocol specification requirement
- **Password Field**: Uses ID input field for password
- **No UUID**: Uses password authentication

---

### 4. Shadowsocks Protocol

**Type**: `shadowsocks`  
**Password Required**: ✅ Yes  
**TLS Support**: ❌ No  
**Encryption**: Method-specific

#### Configuration Structure
```json
{
  "type": "shadowsocks",
  "tag": "proxy",
  "server": "example.com",
  "server_port": 8388,
  "method": "chacha20-ietf-poly1305",
  "password": "your-password-here"
}
```

#### Field Requirements
- **Server**: Domain or IP address
- **Port**: 1-65535 (typically 8388, 1080)
- **Password**: Server-configured password
- **Method**: Encryption algorithm (dropdown selection)
- **TLS**: Not supported by protocol

#### Supported Encryption Methods
1. **chacha20-ietf-poly1305** (default)
2. **aes-128-gcm**
3. **aes-256-gcm**
4. **2022-blake3-aes-128-gcm**
5. **2022-blake3-aes-256-gcm**

#### Implementation Details
- **Lines 502-510**: Shadowsocks outbound configuration
- **Method Selection**: Lines 241-290 (dropdown)
- **No TLS**: Protocol limitation
- **2022 Methods**: Support for newer encryption standards

## Protocol Comparison

| Feature | VMess | VLESS | Trojan | Shadowsocks |
|---------|-------|-------|--------|-------------|
| **UUID Required** | ✅ | ✅ | ❌ | ❌ |
| **Password Required** | ❌ | ❌ | ✅ | ✅ |
| **TLS Support** | ✅ | ✅ | ✅ (Required) | ❌ |
| **Encryption** | Auto | None | TLS | Method-specific |
| **Security Level** | High | High | High | Medium |
| **Typical Port** | 443 | 443 | 443 | 8388 |
| **Compatibility** | Good | Excellent | Good | Excellent |

## Configuration Generation Logic

### Protocol Detection (Lines 387-420)
```javascript
if (proto === "shadowsocks") {
    // Show method selector, hide TLS, hide UUID button
} else if (proto === "trojan") {
    // Hide method selector, show TLS, hide UUID button
} else {
    // Hide method selector, show TLS, show UUID button
}
```

### Field Visibility Rules
- **UUID Button**: Only shown for VMess and VLESS
- **Method Selector**: Only shown for Shadowsocks
- **TLS Section**: Hidden for Shadowsocks, shown for others
- **Help Text**: Dynamic based on selected protocol

### Validation Requirements
- **All Protocols**: Server address and port required
- **VMess/VLESS**: UUID required
- **Trojan/Shadowsocks**: Password required
- **Port Range**: 1-65535 for all protocols

## Inbound Configuration

### SOCKS Proxy (Lines 511-540)
```json
{
  "type": "socks",
  "tag": "socks-in",
  "listen": "127.0.0.1",
  "listen_port": 1080,
  "sniff": true,
  "sniff_override_destination": true
}
```

**Purpose**: Local SOCKS5 proxy for applications  
**Default Settings**: 
- Listen Address: 127.0.0.1
- Listen Port: 1080
- Sniffing: Enabled for better routing

## Routing Configuration

### Outbound Chain (Lines 511-540)
```json
[
  { /* Protocol-specific outbound */ },
  { "type": "direct", "tag": "direct" },
  { "type": "block", "tag": "block" }
]
```

**Routing Logic**:
1. **Proxy**: Protocol-specific outbound
2. **Direct**: Direct connection for local/whitelisted domains
3. **Block**: Blocked connections

## Security Considerations

### TLS Configuration
- **VMess/VLESS**: Optional but recommended
- **Trojan**: Always required
- **Shadowsocks**: Not supported
- **SNI**: Auto-filled from server address

### Authentication
- **UUID-based**: VMess, VLESS (cryptographically secure)
- **Password-based**: Trojan, Shadowsocks (server-configured)
- **Generation**: UUID v4 for VMess/VLESS

### Encryption Methods
- **VMess**: Auto-negotiated
- **VLESS**: TLS-based only
- **Trojan**: TLS-based
- **Shadowsocks**: Configurable algorithms

## Usage Recommendations

### Protocol Selection Guide
- **VMess**: Good balance of features and compatibility
- **VLESS**: Best performance, requires TLS
- **Trojan**: High security, TLS required
- **Shadowsocks**: Maximum compatibility, no TLS

### Port Recommendations
- **443**: Best for TLS protocols (bypasses most firewalls)
- **80**: Alternative for TLS protocols
- **8388**: Traditional Shadowsocks port
- **1080**: Alternative for Shadowsocks

### Security Best Practices
1. Always use TLS when available
2. Use strong passwords for password-based protocols
3. Generate new UUIDs for each server
4. Use standard ports when possible
5. Enable sniffing for better routing 