#!/usr/bin/env python3
"""
Deploy contracts using Hardhat
"""

import subprocess
import json
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def deploy_contracts():
    """Deploy contracts using Hardhat deploy script"""
    print("╔══════════════════════════════════════════════════════╗")
    print("║  SkyGuard DAO - Contract Deployment to Sepolia      ║")
    print("╚══════════════════════════════════════════════════════╝\n")
    
    # Get hardhat directory
    hardhat_dir = Path(__file__).parent.parent.parent / 'hardhat'
    
    print(f"📁 Hardhat directory: {hardhat_dir}")
    print(f"✓ Using Sepolia testnet via Infura\n")
    
    try:
        # Set environment variables for hardhat
        env = os.environ.copy()
        env['RPC_URL'] = os.getenv('RPC_URL', 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY')
        env['DEPLOYER_PRIVATE_KEY'] = os.getenv('DEPLOYER_PRIVATE_KEY', '')
        
        # Run hardhat deploy
        print("🚀 Deploying contracts via Hardhat...\n")
        result = subprocess.run(
            'npx hardhat run scripts/deploy.js --network sepolia',
            cwd=hardhat_dir,
            capture_output=True,
            text=True,
            timeout=300,
            shell=True,
            env=env,
            encoding='utf-8',
            errors='replace'
        )
        
        output = result.stdout if result.stdout else ""
        print(output)
        
        if result.returncode != 0:
            stderr = result.stderr if result.stderr else ""
            print("❌ Deployment Error:")
            print(stderr)
            return False
        
        # Parse output for addresses
        if not output:
            print("\n⚠️ No output from deployment")
            return False
        
        # Extract FLY Token Address
        if "FLY Token Address:" in output:
            fly_address = output.split("FLY Token Address:")[1].split("\n")[0].strip()
            print(f"\n✓ FLY Token Address: {fly_address}")
        else:
            print("\n⚠️ Could not extract FLY Token address from output")
            return False
        
        # Extract Compensation Contract Address
        if "Compensation Contract Address:" in output:
            comp_address = output.split("Compensation Contract Address:")[1].split("\n")[0].strip()
            print(f"✓ Compensation Contract Address: {comp_address}")
        else:
            print("⚠️ Could not extract Compensation Contract address from output")
            return False
        
        # Update .env file
        print("\n📝 Updating .env file with contract addresses...\n")
        env_file = Path(__file__).parent.parent / '.env'
        
        with open(env_file, 'r') as f:
            env_content = f.read()
        
        # Replace contract addresses
        env_content = env_content.replace('FLY_TOKEN_ADDRESS=0x0', f'FLY_TOKEN_ADDRESS={fly_address}')
        env_content = env_content.replace('COMPENSATION_CONTRACT_ADDRESS=0x0', f'COMPENSATION_CONTRACT_ADDRESS={comp_address}')
        
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print("✅ SUCCESS! Contracts deployed to Sepolia")
        print(f"\nFLY Token: {fly_address}")
        print(f"Compensation Contract: {comp_address}")
        print(f"\n.env file updated with addresses")
        
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ Deployment timed out")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = deploy_contracts()
    sys.exit(0 if success else 1)
