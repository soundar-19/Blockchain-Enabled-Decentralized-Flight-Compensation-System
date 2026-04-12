#!/usr/bin/env python3
"""
SkyGuard DAO - Setup Verification Script
Checks that all systems are properly configured for the compensation feature
"""

import os
import sys
import json
from pathlib import Path

class SetupVerifier:
    def __init__(self):
        self.checks_passed = 0
        self.checks_failed = 0
        self.root_dir = Path(__file__).parent

    def print_header(self, text):
        print("\n" + "="*60)
        print(f"  {text}")
        print("="*60)

    def check(self, condition, name, error_msg=""):
        """Run a check and track results"""
        if condition:
            print(f"✓ {name}")
            self.checks_passed += 1
        else:
            print(f"✗ {name}")
            if error_msg:
                print(f"  → {error_msg}")
            self.checks_failed += 1

    def verify_environment(self):
        """Verify environment variables and configuration"""
        self.print_header("Environment Configuration")

        # Check backend .env
        backend_env = self.root_dir / "backend" / ".env"
        self.check(
            backend_env.exists(),
            "Backend .env file exists",
            f"Expected: {backend_env}"
        )

        if backend_env.exists():
            env_content = backend_env.read_text()
            
            # Check required variables
            required_vars = [
                "DEPLOYER_ACCOUNT",
                "DEPLOYER_PRIVATE_KEY",
                "FLY_TOKEN_ADDRESS",
                "COMPENSATION_CONTRACT_ADDRESS",
                "RPC_URL",
                "MONGO_URI"
            ]
            
            for var in required_vars:
                self.check(
                    var in env_content,
                    f"Backend {var} configured",
                    f"Add {var}= to backend/.env"
                )

        # Check frontend .env
        frontend_env = self.root_dir / "frontend" / ".env"
        self.check(
            frontend_env.exists(),
            "Frontend .env file exists",
            f"Expected: {frontend_env}"
        )

        if frontend_env.exists():
            env_content = frontend_env.read_text()
            self.check(
                "VITE_API_URL" in env_content,
                "Frontend VITE_API_URL configured"
            )

    def verify_dependencies(self):
        """Verify Python and Node dependencies"""
        self.print_header("Dependencies")

        # Check Python packages
        try:
            import flask
            self.check(True, "Flask installed")
        except ImportError:
            self.check(False, "Flask installed", "Run: pip install -r backend/requirements.txt")

        try:
            import web3
            self.check(True, "Web3.py installed")
        except ImportError:
            self.check(False, "Web3.py installed", "Run: pip install -r backend/requirements.txt")

        try:
            import pymongo
            self.check(True, "PyMongo installed")
        except ImportError:
            self.check(False, "PyMongo installed", "Run: pip install -r backend/requirements.txt")

        # Check Node packages
        frontend_modules = self.root_dir / "frontend" / "node_modules"
        self.check(
            frontend_modules.exists(),
            "Frontend npm packages installed",
            "Run: cd frontend && npm install"
        )

    def verify_files(self):
        """Verify critical source files exist"""
        self.print_header("Source Files")

        files_to_check = [
            ("Backend blockchain service", "backend/blockchain/blockchain_service.py"),
            ("Backend routes", "backend/api/blockchain_routes.py"),
            ("Frontend App", "frontend/src/App.jsx"),
            ("Compensate page", "frontend/src/pages/Compensate/CompensatePage.jsx"),
            ("Blockchain service", "frontend/src/services/blockchainDataService.js"),
            ("Smart contracts", "contracts/FlightToken.sol"),
            ("Compensation contract", "contracts/CompensationContract.sol"),
        ]

        for name, path in files_to_check:
            full_path = self.root_dir / path
            self.check(
                full_path.exists(),
                name,
                f"Expected: {path}"
            )

    def verify_blockchain_methods(self):
        """Verify new compensation methods exist"""
        self.print_header("Blockchain Methods")

        blockchain_service_file = self.root_dir / "backend" / "blockchain" / "blockchain_service.py"
        
        if blockchain_service_file.exists():
            content = blockchain_service_file.read_text()
            
            self.check(
                "def calculate_compensation" in content,
                "calculate_compensation() method exists"
            )
            
            self.check(
                "def file_compensation_claim_with_transfer" in content,
                "file_compensation_claim_with_transfer() method exists"
            )
            
            self.check(
                "def get_transaction_status" in content,
                "get_transaction_status() method exists"
            )

    def verify_database(self):
        """Verify database connectivity"""
        self.print_header("Database")

        try:
            from pymongo import MongoClient
            from pymongo.errors import ConnectionFailure
            
            # This is a lightweight check - just see if pymongo is configured
            self.check(True, "PyMongo available for database operations")
            
            # Optionally try to connect
            try:
                client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=1000)
                client.admin.command('ping')
                self.check(True, "MongoDB is running and accessible")
                client.close()
            except ConnectionFailure:
                self.check(False, "MongoDB connection", 
                    "Start MongoDB: mongod --dbpath data/ (or use Docker)")
                
        except ImportError:
            self.check(False, "PyMongo available", "Run: pip install pymongo")

    def verify_endpoints(self):
        """Verify API endpoint structure"""
        self.print_header("API Endpoints")

        routes_file = self.root_dir / "backend" / "api" / "blockchain_routes.py"
        
        if routes_file.exists():
            content = routes_file.read_text()
            
            endpoints = [
                ("Compensation claim endpoint", "/compensation/file-claim"),
                ("Blockchain status endpoint", "/blockchain/status"),
                ("Wallet creation endpoint", "/wallet/create"),
            ]
            
            for name, endpoint in endpoints:
                self.check(
                    endpoint in content,
                    f"{name}: {endpoint}"
                )

    def generate_summary(self):
        """Print verification summary"""
        self.print_header("Verification Summary")
        
        total = self.checks_passed + self.checks_failed
        percentage = (self.checks_passed / total * 100) if total > 0 else 0
        
        print(f"\n✓ Passed:  {self.checks_passed}")
        print(f"✗ Failed:  {self.checks_failed}")
        print(f"  Total:   {total}")
        print(f"\nSuccess Rate: {percentage:.1f}%")

        if self.checks_failed == 0:
            print("\n✨ All checks passed! System is ready to use.")
            print("\nNext steps:")
            print("  1. Start backend:   python backend/run.py")
            print("  2. Start frontend:  cd frontend && npm run dev")
            print("  3. Open browser:    http://localhost:5173")
            return True
        else:
            print("\n⚠ Some checks failed. Please fix the issues above.")
            print("See: COMPENSATE_FEATURE_GUIDE.md for troubleshooting")
            return False

    def run(self):
        """Run all verifications"""
        print("\n🔍 SkyGuard DAO - Setup Verification")
        print("=" * 60)
        
        self.verify_environment()
        self.verify_dependencies()
        self.verify_files()
        self.verify_blockchain_methods()
        self.verify_database()
        self.verify_endpoints()
        
        success = self.generate_summary()
        
        return 0 if success else 1

if __name__ == "__main__":
    verifier = SetupVerifier()
    sys.exit(verifier.run())
