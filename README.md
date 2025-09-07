# 🏛 Decentralized Global Artifact Exchange

## Overview
This Web3 project, previously referred to as the Decentralized Cultural Exchange Marketplace, is now named **Decentralized Global Artifact Exchange**. It addresses real-world challenges in managing artifact loans between international museums, such as inefficient tracking, trust issues, high administrative costs, and risks of loss or damage. Built on the Stacks blockchain using Clarity smart contracts, it creates a transparent, decentralized marketplace for museums to list, loan, track, and exchange cultural artifacts securely. Artifacts are represented as NFTs for provenance, with smart contracts enforcing agreements, handling escrow, and enabling real-time tracking.

## ✨ Features
- 🌐 Register and verify museums as trusted institutions  
- 🖼 Mint NFTs for artifacts with metadata (provenance, condition, value)  
- 📈 List artifacts on a decentralized marketplace for loan or exchange  
- 🤝 Automate loan agreements with customizable terms (duration, insurance, fees)  
- 🔒 Manage escrow for deposits or collateral during loans  
- 📍 Track artifact locations and status in real-time  
- ⚖ Resolve disputes via on-chain voting or oracles  
- 📊 Provide analytics for exchange history and compliance  

## 🛠 How It Works
The platform leverages Clarity smart contracts on the Stacks blockchain, ensuring Bitcoin-level security. Museums interact through a dApp frontend (not included here but integrable with Clarity). Artifacts are tokenized as NFTs, and all actions are immutable and transparent.

### Core Smart Contracts (8 in Total)
1. **MuseumRegistry.clar**: Registers and verifies museums, storing institutional details and managing roles (e.g., lender, borrower).  
   - Functions: `register-museum`, `verify-museum`, `get-museum-details`  

2. **ArtifactNFT.clar**: Mints and manages NFTs for artifacts, storing metadata like description, history, and condition.  
   - Functions: `mint-artifact`, `update-metadata`, `transfer-ownership` (restricted during loans)  

3. **MarketplaceListing.clar**: Enables listing artifacts for loan or exchange, searchable by category, value, or location.  
   - Functions: `list-artifact`, `delist-artifact`, `search-listings`  

4. **LoanAgreement.clar**: Creates binding loan contracts with terms like duration, fees, and conditions; auto-executes returns or penalties.  
   - Functions: `create-loan`, `accept-loan`, `end-loan`  

5. **EscrowManager.clar**: Handles deposits (e.g., STX or tokens) as collateral, releasing funds upon loan completion or managing penalties.  
   - Functions: `deposit-escrow`, `release-escrow`, `claim-penalty`  

6. **TrackingOracle.clar**: Integrates with off-chain oracles to log artifact status (e.g., shipped, arrived, exhibited).  
   - Functions: `update-status`, `get-tracking-history`, `verify-update`  

7. **DisputeResolution.clar**: Facilitates dispute resolution through on-chain voting or oracle inputs for issues like damaged artifacts or delayed returns.  
   - Functions: `initiate-dispute`, `vote-on-dispute`, `resolve-dispute`  

8. **AnalyticsDashboard.clar**: Tracks exchange history and generates compliance reports for museums and regulators.  
   - Functions: `get-exchange-history`, `generate-report`, `get-analytics`  

## 🚀 Usage
### For Museums
1. Register via `MuseumRegistry.clar` and get verified.  
2. Mint artifacts as NFTs using `ArtifactNFT.clar`.  
3. List artifacts on the marketplace with `MarketplaceListing.clar`.  
4. Propose or accept loan agreements via `LoanAgreement.clar`.  
5. Deposit collateral using `EscrowManager.clar`.  
6. Update artifact status (e.g., shipped) via `TrackingOracle.clar`.  
7. Resolve disputes with `DisputeResolution.clar` if needed.  
8. Access analytics and reports through `AnalyticsDashboard.clar`.  

### For Verifiers or Regulators
- Query `MuseumRegistry.clar` to verify museum credentials.  
- Use `ArtifactNFT.clar` to check artifact provenance and metadata.  
- Access `TrackingOracle.clar` for real-time status updates.  
- Review `AnalyticsDashboard.clar` for compliance data.  

## 🧑‍💻 Clarity Benefits
- **Security**: Clarity’s predictable execution ensures safe contract behavior.  
- **Transparency**: All actions are logged immutably on the Stacks blockchain.  
- **Scalability**: Modular contracts allow easy upgrades and integrations.  

## 📜 License
MIT License - feel free to fork and build upon this project!  

This decentralized platform empowers museums worldwide to share cultural heritage securely, transparently, and efficiently, fostering global cultural exchange.