<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

## Test coverage

| Statements                                                                                 | Branches                                                                       | Functions                                                                                | Lines                                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![Statements](https://img.shields.io/badge/statements-94.77%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-76.78%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-97.43%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-97.67%25-brightgreen.svg?style=flat) |

## Use CoW Protocol

> Check [**@cowprotocol/cow-sdk**](https://github.com/cowprotocol/cow-sdk/tree/main/packages/sdk/README.md) to learn how to trade on the CoW Protocol (get quote, verify amounts, sign and send order)

## Technical Overview

This is a **TypeScript monorepo** containing the complete CoW Protocol SDK ecosystem. The repository is organized into multiple packages that provide different levels of abstraction and functionality for interacting with CoW Protocol.

### Monorepo Architecture

The project uses modern tooling for efficient development and publishing:

- **🏗️ Build System**: [Turbo](https://turbo.build/) for fast, incremental builds and task orchestration
- **📦 Package Manager**: [pnpm](https://pnpm.io/) v10.8+ with workspaces for efficient dependency management
- **🔧 TypeScript**: Shared TypeScript configuration across all packages
- **🧪 Testing**: Jest for unit testing with coverage reporting
- **📋 Linting**: ESLint v9+ with TypeScript support and unused imports detection
- **🎨 Formatting**: Prettier for consistent code formatting
- **📦 Publishing**: Release Please for automated versioning and publishing
- **⚡ Development**: Node.js 22+ required

### Package Structure

#### 🎯 Main SDK Package

- **[`@cowprotocol/cow-sdk`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/sdk/README.md)** - Complete package that re-exports all other packages for easy consumption

#### 🔧 Core Trading Packages

- **[`@cowprotocol/sdk-trading`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/trading/README.md)** - High-level trading SDK with built-in quote fetching, order signing, and posting
- **[`@cowprotocol/sdk-order-book`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/order-book/README.md)** - Order book API client for retrieving orders, trades, and posting orders
- **[`@cowprotocol/sdk-order-signing`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/order-signing/README.md)** - Cryptographic utilities for signing orders and cancellations

#### 🌉 Advanced Features

- **[`@cowprotocol/sdk-bridging`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/bridging/README.md)** - Cross-chain token transfers and bridging functionality
- **[`@cowprotocol/sdk-composable`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/composable/README.md)** - Programmatic orders (TWAP, conditional orders, etc.)
- **[`@cowprotocol/sdk-cow-shed`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/cow-shed/README.md)** - Account abstraction with smart contract capabilities

#### 🔌 Provider Adapters

- **[`@cowprotocol/sdk-viem-adapter`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/providers/viem-adapter/README.md)** - Viem blockchain library adapter
- **[`@cowprotocol/sdk-ethers-v6-adapter`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/providers/ethers-v6-adapter/README.md)** - Ethers.js v6 adapter
- **[`@cowprotocol/sdk-ethers-v5-adapter`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/providers/ethers-v5-adapter/README.md)** - Ethers.js v5 adapter

#### 📚 Supporting Packages

- **[`@cowprotocol/sdk-app-data`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/app-data/README.md)** - AppData schema definitions and metadata handling
- **[`@cowprotocol/sdk-config`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/config/README.md)** - Configuration constants and chain settings
- **[`@cowprotocol/sdk-common`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/common/README.md)** - Common utilities, types, and shared functionality
- **[`@cowprotocol/sdk-contracts-ts`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/contracts-ts/README.md)** - TypeScript contract bindings and ABI definitions
- **[`@cowprotocol/sdk-subgraph`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/subgraph/README.md)** - GraphQL client for CoW Protocol subgraph data
- **[`@cowprotocol/sdk-weiroll`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/weiroll/README.md)** - Weiroll integration utilities

#### 🛠️ Development Packages

- **[`@cow-sdk/typescript-config`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/typescript-config)** - Shared TypeScript configuration

### Development Workflow

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format

# Type checking
pnpm typecheck

# Clean build artifacts
pnpm clean
```

## Contributing

We welcome contributions to the CoW Protocol SDK! Here's how to get started:

### 🚀 **Quick Start**

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cow-sdk.git
   cd cow-sdk
   ```
3. **Follow the [Development Workflow](#development-workflow)** above to set up your environment
4. **Make your changes** following our [Contributor Guidelines](CONTRIBUTING.md)
5. **Create a pull request** short after creating it, you will be asked to sign the CLA (Contributor License Agreement). A comment with instructions will be added to the PR.

### 🏷️ **Preview Deployments**

For significant changes that need testing in real projects (like CoW Swap), our team may add the `allow-publish` label to your PR. This will:

- **Automatically publish** preview packages to GitHub Packages
- **Generate versioned packages** (e.g., `1.0.0-pr-123.0`)
- **Enable easy testing** in projects by installing the preview version

### 📚 **Need Help?**

- Check existing [issues](https://github.com/cowprotocol/cow-sdk/issues) for similar problems
- Join our [Discord](https://discord.gg/cowprotocol) for community support
- Read the [CoW Protocol documentation](https://docs.cow.fi)
