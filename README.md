# Trust Score Economy — Blockchain-Based Reputation System

A decentralized reputation system built on the **Stellar testnet** and **Soroban smart contracts**. Users earn genuine, verifiable trust scores through real actions like completing tasks and making transactions, aiming to solve the fake reviews problem on platforms like Uber or Fiverr.

---

## ✨ MVP Features

- 🔗 **Wallet Registration** — Connect Freighter wallet to establish an identity.
- 📈 **Dynamic Trust Scores** — Scores update automatically based on transparent on-chain actions.
- 🚀 **Create & Complete Tasks** — Perform actions (like freelance gigs) to build reputation.
- ⚡ **Tamper-Proof Records** — All ratings and actions are recorded immutably on Stellar.
- 🌟 **Premium UI** — Dark mode glassmorphism interface.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- [Freighter Wallet](https://www.freighter.app/) browser extension

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📈 User Onboarding & Validation

As part of our MVP validation, we gathered real user feedback from testnet users using a Google Form. 
We asked for Wallet Address, Email, Name, and an MVP rating (1-5), plus qualitative feedback.

- **[User Feedback Data (Excel/CSV Export)](./user_feedback.csv)**
  *(The responses are attached as `user_feedback.csv` in the root of this repository.)*

### Validation Results:
- We successfully onboarded **5+ real testnet users**.
- Users engaged with the testnet platform by creating tasks and receiving simulated evaluations. 
- Overall reception was highly positive, highlighting the transparency of Stellar.

---

## 🔄 Next Phase Improvements (Post-Feedback Iteration)

Based on the documented user feedback, we plan to implement the following improvements in the next development cycle:

1. **Category Specific Scores:** Users requested differentiating between different types of actions (e.g., "Developer Trust" vs "Design Trust").
2. **Filtering System:** Implement advanced filtering to find highly-rated freelancers directly from the explore page.
3. **Decentralized Disputes:** Add an arbitration mechanism in Soroban for disputed ratings.
4. **UI Enhancements:** More detailed breakdown of how the current score was mathematically derived.

**Git Commit Link for the Planned Improvements:**
[View Improvement Tracking Commit](https://github.com/ggdeshmukh12107-droid/Stellar-DApp/commit/331d45e)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Smart Contract| Soroban (Stellar) |
| Wallet | Freighter |
| Testing | Vitest |

---

## 📄 License
MIT
