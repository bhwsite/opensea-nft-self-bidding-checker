# Opensea NFT Owner Bidding Checker

This project is a Node.js application that checks Opensea NFT collections to identify if an owner is bidding on their own NFT. The application is especially useful in spotting owners who bid higher than their NFT's sale price. The insight provided by this tool can help users purchase an NFT and subsequently resell it to the owner at a higher price for profit.

## Getting Started

### Prerequisites

This application requires Node.js. If you do not have it installed, follow the instructions available [here](https://nodejs.org/en/download/) to install it on your machine.

### Installing

1. Clone the project to your local machine:

    ```
    git clone https://github.com/bhwsite/opensea-nft-self-bidding-checker.git
    ```

2. Navigate into the project directory:

    ```
    cd popensea-nft-self-bidding-checker
    ```

3. Install the project dependencies:

    ```
    npm install
    ```

## Usage

You will need a text file (`collections.txt`) with a list of contract addresses (one per line) for the NFT collections you want to check.

1. Update `collections.txt` with the contract addresses of the NFT collections you want to inspect.
2. Run the application:

    ```
    node index.js
    ```

The application logs the total number of items for each contract address and any offers made by the owner on their own NFTs. These details are saved in `offers.txt`.

## Contributing

We welcome contributions from the open source community. Please submit your changes via a Pull Request.
