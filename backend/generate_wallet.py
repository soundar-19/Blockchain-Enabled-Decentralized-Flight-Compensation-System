from blockchain.wallet_manager import WalletManager

w = WalletManager.create_wallet()
print("✓ Deployer Wallet Generated Successfully\n")
print(f"ADDRESS:     {w['address']}")
print(f"PRIVATE KEY: {w['privateKey']}\n")
print("⚠️  SAVE THESE CREDENTIALS - Required for deployment")
