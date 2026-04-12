#!/usr/bin/env python3
"""Check wallet balance on Sepolia testnet"""

from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://sepolia.infura.io/v3/a75bc1be3bb44560b0b7c4abc3986efa'))

# Check connection
print("Connected to Sepolia:", w3.is_connected())
print()

# Check balance
wallet = '0xF7Dc7da1485346FbD0856FEa570885C4B8C02c6f'
balance = w3.eth.get_balance(wallet)
balance_eth = Web3.from_wei(balance, 'ether')

print(f"Wallet: {wallet}")
print(f"Balance: {balance_eth} SepoliaETH")
print(f"Balance (Wei): {balance}")
