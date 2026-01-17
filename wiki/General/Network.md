---
banner: https://www.cisco.com/content/dam/cisco-cdc/site/images/legacy/assets/swa/img/anchor-info/network-designed-628x353.jpg
color: white
text: black
---
# Network:

- **Network:** A group of connected devices that communicate and share data.
    
- **Why networks exist:** To share data, resources, enable communication, remote access, efficiency.
    
- **Computer network (definition):** Interconnected devices exchanging data & resources.
    
- **Network goals:** Communication, resource sharing, scalability, reliability, efficiency, security.
    
- **Network applications:** Internet, email, file sharing, cloud services, streaming, VoIP, remote monitoring.
    
- **LAN:** Small area (home, office, building).
    
- **MAN:** City-wide or large campus network.
    
- **WAN:** Very large area (country, continent, Internet).
    
- **Client–server:** Clients request services from a central server.
    
- **Peer-to-peer:** Devices share resources directly; no central server.
    
- **Standards & organizations:**
    
    - **IEEE:** Hardware & link-layer standards (Ethernet, Wi-Fi).
        General
    - **IETF:** Internet protocols & standards (TCP/IP, HTTP, DNS).
        

---

# **OSI Model – 7 Layers (Detailed)**

|Layer #|Layer Name|Key Functions & Concepts|Examples (Protocol/Device/Scenario)|
|---|---|---|---|
|7|**Application**|Interface for end-user; network services; data generation|HTTP (web), FTP, SMTP (email), SNMP, DNS|
|6|**Presentation**|Data format, encryption, compression|HTTPS encryption, JPEG/MP3 formats|
|5|**Session**|Start, maintain, terminate sessions; authentication|Video call session, website login session|
|4|**Transport**|End-to-end delivery, reliability, ports, flow & congestion control|TCP (reliable), UDP (fast), 3-way handshake, QoS|
|3|**Network**|Logical addressing, routing, fragmentation|Router, IP addressing (IPv4/IPv6), ICMP (ping), ARP|
|2|**Data Link**|Frames, MAC addresses, error detection/correction, flow control|Switch, Bridge, Ethernet frames, CRC, Stop-and-Wait, Sliding Window|
|1|**Physical**|Transmission of raw bits as signals, media & connectors|Hub, Repeater, Ethernet cable, fiber optics, Wi-Fi signals|

![[what-is-the-osi-model.svg]]

---

# **TCP/IP Model Layers**

1. **Application Layer:** Combines OSI layers 5–7; services directly to end-users.
    
    - **Examples:** HTTP, FTP, SMTP, DNS, SNMP.
        
2. **Transport Layer:** End-to-end communication, reliability, ports, congestion & flow control.
    
    - **Examples:** TCP (reliable), UDP (fast/connectionless).
        
3. **Internet Layer:** Logical addressing, routing, inter-network communication.
    
    - **Examples:** IP, ICMP, ARP, NAT, DHCP.
        
4. **Link Layer (Network Interface):** Local network access, framing, media transmission.
    
    - **Examples:** Ethernet, Wi-Fi, PPP, NIC, Switch, Hub.
        

![[c173bb_0b8d26799e6f4bdfbb4ad0aeb5160908~mv2.avif]]

---

# **OSI vs TCP/IP Comparison**

|Aspect|OSI Model|TCP/IP Model|
|---|---|---|
|Layers|7 (Application → Physical)|4 (Application → Link)|
|Focus|Conceptual framework|Internet communication|
|Layer Functions|More granular, separate session & presentation|Combines multiple OSI layers (application layer)|
|Usage|Teaching, troubleshooting|Real-world Internet protocols|

![[OSI-vs-TCP-vs-Hybrid-2.webp|888x444]]

---

# **Key Network Devices & OSI Layers**

|Device|OSI Layer|Function|Example|
|---|---|---|---|
|Hub|1|Broadcasts signals, regenerates bits|8-port Ethernet hub|
|Repeater|1|Extends signal over distance|Network signal extender|
|Switch|2|Forwards frames using MAC addresses|Cisco Catalyst Switch|
|Bridge|2|Connects LAN segments, filters traffic|LAN bridge|
|Router|3|Routes packets across networks|Home Wi-Fi router|
|Gateway|7|Protocol translation between networks|Email gateway converting SMTP→Exchange|

---

# **Extra Notes by Layer**

### **Physical Layer (1)**

- Bits → Signals (electric, light, radio)
    
- Transmission media: Twisted pair, coaxial, fiber, wireless
    
- Impairments: Attenuation, noise, distortion
    
- Transmission modes: Simplex, Half-duplex, Full-duplex
    

### **Data Link Layer (2)**

- Frames: Organized data for transmission
    
- MAC addressing: Device identification on LAN
    
- Error detection: CRC, parity
    
- Flow control: Stop-and-Wait, Sliding Window
    
- LAN protocols: Ethernet, ARP
    

### **Network Layer (3)**

- Logical addressing: IP addresses
    
- Routing: Static/Dynamic, Distance Vector (RIP), Link State (OSPF)
    
- Protocols: IP, ICMP, ARP, NAT, DHCP
    
- Fragmentation & reassembly of packets
    

### **Transport Layer (4)**

- Reliable delivery: TCP (connection-oriented)
    
- Fast delivery: UDP (connectionless)
    
- Ports & sockets: Identify applications
    
- Flow & congestion control, QoS
    
- TCP 3-way handshake: SYN → SYN-ACK → ACK
    

### **Application Layer (5–7 / TCP/IP Application)**

- Services for users & apps: Web, email, file transfer, domain resolution
    
- Protocol examples: HTTP/HTTPS, FTP, SMTP, POP3/IMAP, DNS, SNMP
    

---

# **Memory Tips & Visual Hints**

- **Mnemonic for OSI layers:** _All People Seem To Need Data Processing_ → Application → Presentation → Session → Transport → Network → Data Link → Physical
    
- **Device mapping:** Physical → Hub/Repeater, Data Link → Switch/Bridge, Network → Router, Application → Gateway
    

---

## **9. Network Topologies & Switching Techniques**

**Purpose:** Define how devices are arranged and how data flows.

### **Network Topologies**

|Topology|Structure|Advantages|Disadvantages|Example|
|---|---|---|---|---|
|**Star**|Devices connect to central hub/switch|Easy to manage; isolate faults|Central device failure stops network|Office LAN with switch|
|**Bus**|Single backbone cable|Simple, low cabling cost|Cable fault stops network; hard to troubleshoot|Early Ethernet LANs|
|**Ring**|Devices connected in a closed loop|Predictable data flow|Single break can disrupt network|Token Ring networks|
|**Mesh**|Devices fully interconnected|High redundancy; fault-tolerant|Expensive, complex|Data center backbone|
|**Hybrid**|Combination of topologies|Flexible, scalable|Complex setup|Large corporate networks|
![](https://www.swissns.ch/site/wp-content/uploads/2017/06/network-topologies.png)
### **Switching Techniques**

|Technique|How it Works|Advantages|Disadvantages|Example|
|---|---|---|---|---|
|**Circuit Switching**|Dedicated path for entire communication|Guaranteed bandwidth, predictable latency|Inefficient for bursty traffic|Traditional telephone networks|
|**Packet Switching**|Data divided into packets sent independently|Efficient, scalable, fault-tolerant|Packets may arrive out of order|Internet (IP networks)|

### **LAN Technologies**

|Technology|Method|Speed|Notes|Example|
|---|---|---|---|---|
|**Ethernet**|CSMA/CD|10 Mbps – 400 Gbps|Most common LAN technology|Wired office LAN|
|**Token Ring**|Token passing|4 – 16 Mbps|Rare today|Older IBM corporate LANs|

### **VLAN Basics**

- Logical segmentation of LAN into multiple broadcast domains.
    
- Improves security, reduces congestion, organizes departments.
    
- Example: VLAN 10 for HR, VLAN 20 for Engineering on same switch.
    

---

## **10. WAN Technologies**

- **Packet switching:** Efficient long-distance communication; basis for Internet.
    
- **Frame Relay / ATM (historical):** Older WAN techs for leased-line networks; largely replaced by MPLS/IP.
    
- **VPN basics:** Secure connection over public networks.
    
    - Examples: Remote office VPN, personal VPN for privacy.
        

---

## **11. Wireless & Mobile Networking**

- **Wi-Fi standards (IEEE 802.11):** a/b/g/n/ac/ax; define speed, frequency, coverage.
    
- **Wireless protocols & MAC:** CSMA/CA, RTS/CTS; manages channel access.
    
- **Wireless security basics:** WPA2/WPA3, encryption, authentication.
    
- **Examples:** Home Wi-Fi, enterprise Wi-Fi, public hotspots.
    

---

## **12. Network Security Foundations**

- **Security threats:** Malware, DoS/DDoS attacks, man-in-the-middle, phishing.
    
- **Protection tools:**
    
    - Firewalls: Filter traffic
        
    - IDS/IPS: Detect and prevent intrusions
        
- **Cryptography basics:** SSL/TLS for secure web traffic; VPN encryption for remote connections.
    
- **Examples:** HTTPS websites, company VPN access, firewall-protected LAN.
    

---

## **13. Management & Troubleshooting**

- **Network monitoring tools:**
    
    - `ping` → check device availability
        
    - `traceroute` → path packets take
        
    - Wireshark → analyze packet data
        
- **Administration tasks:** User management, IP allocation, VLAN setup.
    
- **Basic troubleshooting:**
    
    - Check physical connections
        
    - Verify IP configuration
        
    - Use logs and monitoring tools for issues
        
- **Examples:** Troubleshooting a slow LAN, reconnecting a disconnected router, identifying high-traffic devices.
    
