// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SupplyChain {
    enum State { Created, InTransit, Delivered }

    struct Product {
        uint256 productId;
        string name;
        string manufacturer;
        uint256 timestamp;
        address currentOwner;
        State state;
        bool exists;
    }

    mapping(uint256 => Product) private products;
    uint256 public productCount;

    event ProductCreated(uint256 indexed productId, string name, string manufacturer, address owner);
    event ProductStateUpdated(uint256 indexed productId, State state, address owner);

    function createProduct(uint256 _productId, string memory _name, string memory _manufacturer) public {
        require(!products[_productId].exists, "Product ID already registered");

        products[_productId] = Product(
            _productId,
            _name,
            _manufacturer,
            block.timestamp,
            msg.sender,
            State.Created,
            true
        );

        productCount++;
        emit ProductCreated(_productId, _name, _manufacturer, msg.sender);
    }

    function updateProductState(uint256 _productId, uint8 _state) public {
        require(products[_productId].exists, "Product does not exist");
        require(_state <= uint8(State.Delivered), "Invalid state");

        Product storage prod = products[_productId];
        prod.state = State(_state);
        prod.currentOwner = msg.sender;

        emit ProductStateUpdated(_productId, prod.state, msg.sender);
    }

    function getProduct(uint256 _productId)
        public
        view
        returns (
            uint256 productId,
            string memory name,
            string memory manufacturer,
            uint256 timestamp,
            address currentOwner,
            uint8 state,
            bool exists
        )
    {
        Product memory prod = products[_productId];
        return (
            prod.productId,
            prod.name,
            prod.manufacturer,
            prod.timestamp,
            prod.currentOwner,
            uint8(prod.state),
            prod.exists
        );
    }
}